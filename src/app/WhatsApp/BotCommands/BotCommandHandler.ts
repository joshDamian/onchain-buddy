import {
    BOT_COMMANDS_REGEX,
    QueryTransactionMatchGroups,
    SubscribeWalletMatchGroups,
} from '@/app/WhatsApp/BotCommands/commands';
import { PhoneNumberParams } from '@/app/WhatsApp/types';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { DEFAULT_NETWORK, LIVE_HOST_URL } from '@/constants/strings';
import { Address, isAddress, isHash } from 'viem';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import { getPublicClient } from '@/app/OnchainBuddy/viemClients';
import { ankrArbitrumMainnet } from '@/app/OnchainBuddy/config';
import { generateTransactionReceiptMessage } from '@/utils/whatsapp-messages';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import env from '@/constants/env';
import * as fs from 'node:fs';
import { uploadFile } from '@/utils/ipfs-upload';
import { logSync } from '@/resources/logger';

type BotCommand = keyof typeof BOT_COMMANDS_REGEX;

class BotCommandHandler {
    public static async handlePossibleCommand(
        text: string,
        phoneParams: PhoneNumberParams,
        displayName: string
    ): Promise<{
        handled: boolean;
    }> {
        const botCommand = BotCommandHandler.isCommand(text);

        if (!botCommand) {
            return {
                handled: false,
            };
        }

        switch (botCommand.command) {
            case 'SUBSCRIBE_WALLET':
                await BotCommandHandler.handleWalletSubscriptionCommand(
                    phoneParams,
                    botCommand.params.wallet
                );
                break;
            case 'QUERY_TRANSACTION':
                await BotCommandHandler.handleTransactionQueryCommand(
                    phoneParams,
                    botCommand.params.transactionHash
                );
                break;
            default:
                return {
                    handled: false,
                };
        }

        return {
            handled: true,
        };
    }

    public static async handleWalletSubscriptionCommand(
        phoneParams: PhoneNumberParams,
        wallet: string
    ) {
        // Handle wallet subscription
        if (!isAddress(wallet)) {
            await BotApi.sendWhatsappMessage(
                phoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    phoneParams.userPhoneNumber,
                    '❌ Invalid wallet address'
                )
            );

            return;
        }

        const existingSubscription = await OnchainBuddyLibrary.subscribeWalletNotification(
            wallet as Address,
            DEFAULT_NETWORK,
            phoneParams.userPhoneNumber
        );

        if (existingSubscription) {
            await BotApi.sendWhatsappMessage(
                phoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    phoneParams.userPhoneNumber,
                    'ℹ Wallet already subscribed'
                )
            );
            return;
        }

        await BotApi.sendWhatsappMessage(
            phoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                phoneParams.userPhoneNumber,
                '✅ Wallet subscription successful'
            )
        );
    }

    public static async handleTransactionQueryCommand(
        phoneParams: PhoneNumberParams,
        transactionHash: string
    ) {
        const defaultPublicClient = getPublicClient(
            ankrArbitrumMainnet.viemChain,
            ankrArbitrumMainnet.rpcUrl
        );

        if (!isHash(transactionHash)) {
            await BotApi.sendWhatsappMessage(
                phoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    phoneParams.userPhoneNumber,
                    '❌ Invalid transaction hash'
                )
            );

            return;
        }

        // Handle transaction query
        const transaction = await OnchainBuddyLibrary.getTransactionByHash(
            transactionHash,
            defaultPublicClient
        );

        if (!transaction) {
            await BotApi.sendWhatsappMessage(
                phoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    phoneParams.userPhoneNumber,
                    '❌ Transaction not found'
                )
            );

            return;
        }

        const message = generateTransactionReceiptMessage(
            transaction,
            getTransactionExplorerUrl(transactionHash, ankrArbitrumMainnet.network)
        );

        await BotApi.sendWhatsappMessage(
            phoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(phoneParams.userPhoneNumber, message)
        );

        const response = await OnchainAnalyticsLibrary.exportBasicTransactionAnalyticsToImage(
            transactionHash,
            ankrArbitrumMainnet.network,
            env.HOST_URL ?? LIVE_HOST_URL
        );

        let fileBuffer: Buffer | undefined = undefined;

        if ('path' in response && response.path) {
            fileBuffer = fs.readFileSync(response.path);
        }

        if ('buffer' in response && response.buffer) {
            fileBuffer = Buffer.from(response.buffer);
        }

        if (!fileBuffer) {
            logSync('error', 'Failed to get file buffer');
            return;
        }

        const imageUrl = await uploadFile(new File([fileBuffer], `${transactionHash}.png`));

        // const mediaId = await BotApi.uploadMedia(
        //     phoneParams.businessPhoneNumberId,
        //     imagePath,
        //     'image'
        // );
        // if (!mediaId) {
        //     logSync('error', 'Failed to upload media for transaction analytics');
        //     return;
        // }

        console.log({ imageUrl });

        await BotApi.sendImageMessage(phoneParams, imageUrl, 'Transaction Analytics');
    }

    public static isCommand(command: string) {
        const commandRegex = Object.values(BOT_COMMANDS_REGEX).find((regex) => regex.test(command));

        if (!commandRegex) {
            return undefined;
        }

        const commandName = Object.keys(BOT_COMMANDS_REGEX).find(
            (key) => BOT_COMMANDS_REGEX[key as BotCommand] === commandRegex
        ) as BotCommand;

        switch (commandName) {
            case 'SUBSCRIBE_WALLET':
                return {
                    command: commandName,
                    params: command.match(commandRegex)?.groups as SubscribeWalletMatchGroups,
                };
            case 'QUERY_TRANSACTION':
                return {
                    command: commandName,
                    params: command.match(commandRegex)?.groups as QueryTransactionMatchGroups,
                };
            default:
                return {
                    command: commandName,
                    params: {},
                };
        }
    }
}

export default BotCommandHandler;
