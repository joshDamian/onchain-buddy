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
import { generateTransactionReceiptMessage } from '@/utils/whatsapp-messages';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import env from '@/constants/env';
import { spawn } from 'child_process';
import { logSync } from '@/resources/logger';
import * as path from 'node:path';
import { GenerateTransactionImageProps } from '@/app/WhatsApp/backgroundProcesses/generate-transaction-image';

type BotCommand = keyof typeof BOT_COMMANDS_REGEX;

const BACKGROUND_PROCESSES_SCRIPTS_FOLDER = path.join(__dirname, '..', 'backgroundProcesses');

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

        const startedAt = Date.now();
        const searchedTransaction =
            await OnchainAnalyticsLibrary.searchTransactionByHash(transactionHash);
        const endedAt = Date.now();

        logSync('info', `Transaction search took ${endedAt - startedAt}ms`);

        // Handle transaction query
        if (!searchedTransaction) {
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
            searchedTransaction.transaction,
            getTransactionExplorerUrl(transactionHash, searchedTransaction.network)
        );

        await BotApi.sendWhatsappMessage(
            phoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(phoneParams.userPhoneNumber, message)
        );

        const serializedParams = JSON.stringify({
            transactionHash,
            hostUrl: env.HOST_URL ?? LIVE_HOST_URL,
            network: searchedTransaction.network,
            phoneParams,
        } satisfies GenerateTransactionImageProps);

        // Spawn the background process
        const backgroundProcess = spawn(
            'bun',
            [
                path.join(BACKGROUND_PROCESSES_SCRIPTS_FOLDER, 'generate-transaction-image.ts'),
                serializedParams,
            ],
            {
                stdio: 'inherit', // Pipe all stdio to the parent process
            }
        );

        backgroundProcess.on('error', (err) => {
            logSync('error', 'Failed to start background process:', err);
        });
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
