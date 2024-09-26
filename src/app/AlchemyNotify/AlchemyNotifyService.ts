import { type AlchemyAddressActivityWebhookEvent } from '@/app/AlchemyNotify/webhookUtils';
import { SupportedChain } from '@/app/types';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import env from '@/constants/env';
import { BASE_URL, UPDATE_WEBHOOK_ADDRESSES } from '@/app/AlchemyNotify/endpoints';
import axios from 'axios';
import { getWebhookId } from '@/app/AlchemyNotify/config';
import { OK } from '@/constants/status-codes';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import { generateReceivedTokenMessage, generateSentTokenMessage } from '@/utils/whatsapp-messages';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { Address } from 'viem';

enum AlchemyActivityCategory {
    TOKEN = 'token',
}

const transferLogTopicHash = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

class AlchemyNotifyService {
    private static readonly BASE_API_URL = BASE_URL;

    public static async handleAddressActivityNotification(
        payload: AlchemyAddressActivityWebhookEvent,
        network: SupportedChain
    ) {
        if (payload.type !== 'ADDRESS_ACTIVITY') {
            return;
        }

        const targetActivity = payload.event.activity.find((activity) => {
            const rawContract = activity.rawContract;
            const activityCategory = activity.category;
            const activityLog = activity.log;

            return (
                activityCategory === AlchemyActivityCategory.TOKEN &&
                activityLog.topics.includes(transferLogTopicHash) &&
                rawContract
            );
        });

        if (!targetActivity) {
            return;
        }

        const { fromAddress, toAddress, value, rawContract } = targetActivity;

        const [fromWalletSubscribers, toWalletSubscribers] = await Promise.all([
            OnchainBuddyLibrary.findSubscriptionsByWalletAddress(fromAddress as Address),
            OnchainBuddyLibrary.findSubscriptionsByWalletAddress(toAddress as Address),
        ]);

        if (fromWalletSubscribers.length > 0) {
            // Send notification to subscribers
            const message = generateSentTokenMessage({
                tokenAmount: value.toString(),
                // Todo: Write functionality to get asset name
                assetName: '',
                assetNetwork: network,
                receiverAddress: toAddress,
                transactionHash: targetActivity.hash,
                explorerUrl: getTransactionExplorerUrl(targetActivity.hash, network),
            });

            const promises = fromWalletSubscribers.map(async (subscriber) => {
                const whatsAppMessage = MessageGenerators.generateTextMessage(
                    subscriber.subscriberPhoneNumber,
                    message
                );

                return BotApi.sendWhatsappMessage(env.WA_PHONE_NUMBER_ID, whatsAppMessage);
            });

            await Promise.allSettled(promises);
        }
        if (toWalletSubscribers.length > 0) {
            // Send notification to subscribers
            const message = generateReceivedTokenMessage({
                tokenAmount: value.toString(),
                // Todo: Write functionality to get asset name
                assetName: '',
                assetNetwork: network,
                senderAddress: fromAddress,
                transactionHash: targetActivity.hash,
                explorerUrl: getTransactionExplorerUrl(targetActivity.hash, network),
            });

            const promises = toWalletSubscribers.map(async (subscriber) => {
                const whatsAppMessage = MessageGenerators.generateTextMessage(
                    subscriber.subscriberPhoneNumber,
                    message
                );

                return BotApi.sendWhatsappMessage(env.WA_PHONE_NUMBER_ID, whatsAppMessage);
            });

            await Promise.allSettled(promises);
        }
    }

    public static async addWebhookAddresses(
        walletAddresses: Array<string>,
        network: SupportedChain
    ) {
        const requestUrl = `${this.BASE_API_URL}${UPDATE_WEBHOOK_ADDRESSES}`;

        const response = await axios.patch(
            requestUrl,
            {
                webhook_id: getWebhookId(network),
                addresses_to_add: walletAddresses,
                addresses_to_remove: [],
            },
            {
                headers: {
                    'X-Alchemy-Token': env.ALCHEMY_AUTH_TOKEN,
                },
            }
        );

        return response.status === OK;
    }

    public static get signingKeys(): Partial<Record<SupportedChain, string>> {
        return {
            Arbitrum: env.ALCHEMY_NOTIFY_ARB_SIGNING_KEY,
        };
    }
}

export default AlchemyNotifyService;
