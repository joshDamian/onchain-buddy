import { type AlchemyAddressActivityWebhookEvent } from '@/app/AlchemyNotify/webhookUtils';
import { SupportedChain } from '@/app/schema';
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
import { getAddress } from 'viem';
import { TRANSFER_EVENT_TOPIC } from '@/constants/strings';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';

enum AlchemyActivityCategory {
    TOKEN = 'token',
}

class AlchemyNotifyService {
    private static readonly BASE_API_URL = BASE_URL;
    public static readonly SUPPORTED_CHAINS: Array<SupportedChain> = [
        'Arbitrum',
        'Base',
        'Polygon',
        'Ethereum',
        'Optimism',
    ];

    public static async handleAddressActivityNotification(
        payload: AlchemyAddressActivityWebhookEvent,
        network: SupportedChain
    ) {
        if (payload.type !== 'ADDRESS_ACTIVITY') {
            return;
        }

        // Supports only token transfers for now
        const targetActivity = payload.event.activity.find((activity) => {
            const rawContract = activity.rawContract;
            const activityCategory = activity.category;
            const activityLog = activity.log;

            return (
                activityCategory === AlchemyActivityCategory.TOKEN &&
                activityLog.topics.includes(TRANSFER_EVENT_TOPIC) &&
                rawContract
            );
        });

        if (!targetActivity) {
            return;
        }

        const { fromAddress, toAddress, value, rawContract } = targetActivity;

        const [fromWalletProfiles, toWalletProfiles, tokenMetadata] = await Promise.all([
            OnchainBuddyLibrary.findUserProfilesByWalletAddress(getAddress(fromAddress)),
            OnchainBuddyLibrary.findUserProfilesByWalletAddress(getAddress(toAddress)),
            OnchainAnalyticsLibrary.getErc20TokenMetadata(rawContract.address, network),
        ]);

        if (fromWalletProfiles.length > 0) {
            // Send notification to subscribers
            const message = generateSentTokenMessage({
                tokenAmount: value.toString(),
                assetName: tokenMetadata.symbol,
                assetNetwork: network,
                receiverAddress: toAddress,
                transactionHash: targetActivity.hash,
                explorerUrl: getTransactionExplorerUrl(targetActivity.hash, network),
            });

            const promises = fromWalletProfiles.map(async (profile) => {
                const whatsAppMessage = MessageGenerators.generateTextMessage(
                    profile.phoneNumber!,
                    message
                );

                return BotApi.sendWhatsappMessage(env.WA_PHONE_NUMBER_ID, whatsAppMessage);
            });

            await Promise.allSettled(promises);
        }
        if (toWalletProfiles.length > 0) {
            // Send notification to subscribers
            const message = generateReceivedTokenMessage({
                tokenAmount: value.toString(),
                assetName: tokenMetadata.symbol,
                assetNetwork: network,
                senderAddress: fromAddress,
                transactionHash: targetActivity.hash,
                explorerUrl: getTransactionExplorerUrl(targetActivity.hash, network),
            });

            const promises = toWalletProfiles.map(async (profile) => {
                const whatsAppMessage = MessageGenerators.generateTextMessage(
                    profile.phoneNumber!,
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
                    'X-Alchemy-Token': env.ALCHEMY_NOTIFY_FORWARDER_AUTH_TOKEN,
                },
            }
        );

        return response.status === OK;
    }

    public static get signingKeys(): Partial<Record<SupportedChain, string>> {
        return {
            Arbitrum: env.ALCHEMY_NOTIFY_FORWARDER_ARB_SIGNING_KEY,
            Base: env.ALCHEMY_NOTIFY_FORWARDER_BASE_SIGNING_KEY,
            Polygon: env.ALCHEMY_NOTIFY_FORWARDER_POLYGON_SIGNING_KEY,
            Ethereum: env.ALCHEMY_NOTIFY_FORWARDER_ETH_SIGNING_KEY,
            Optimism: env.ALCHEMY_NOTIFY_FORWARDER_OPTIMISM_SIGNING_KEY,
        };
    }
}

export default AlchemyNotifyService;
