import { PhoneNumberParams } from '@/app/WhatsApp/types';
import { Address, isAddress, isHash } from 'viem';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { DEFAULT_NETWORK, LIVE_HOST_URL } from '@/constants/strings';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import { logSync } from '@/resources/logger';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import { generateTransactionReceiptMessage } from '@/utils/whatsapp-messages';
import env from '@/constants/env';
import { GenerateTransactionImageProps } from '@/app/WhatsApp/backgroundProcesses/generate-transaction-report';
import { spawn } from 'child_process';
import path from 'node:path';

const BACKGROUND_PROCESSES_SCRIPTS_FOLDER = path.join(__dirname, 'backgroundProcesses');

////////////////////////////////
// Handle Query Messages
// This library is responsible for handling messages related to on-chain queries.
class QueryMessageHandlers {
    public static async handleWalletSubscriptionRelatedMessage(
        whatsAppPhoneParams: PhoneNumberParams,
        walletAddress: string
    ) {
        // Handle wallet subscription
        if (!isAddress(walletAddress)) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    '❌ Invalid wallet address'
                )
            );

            return;
        }

        const existingSubscription = await OnchainBuddyLibrary.subscribeWalletNotification(
            walletAddress as Address,
            DEFAULT_NETWORK,
            whatsAppPhoneParams.userPhoneNumber
        );

        if (existingSubscription) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    'ℹ Wallet already subscribed'
                )
            );
            return;
        }

        await BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                '✅ Wallet subscription successful'
            )
        );
    }

    public static async handleTransactionQueryRelatedMessage(
        whatsAppPhoneParams: PhoneNumberParams,
        transactionHash: string
    ) {
        if (!isHash(transactionHash)) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    '❌ Invalid transaction hash'
                )
            );

            return;
        }

        void BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                '🔍 Searching for transaction...'
            )
        );

        const startedAt = Date.now();
        const searchedTransaction =
            await OnchainAnalyticsLibrary.searchTransactionByHash(transactionHash);
        const endedAt = Date.now();

        logSync('info', `Transaction search took ${endedAt - startedAt}ms`);

        // Handle transaction query
        if (!searchedTransaction) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    '❌ Transaction not found'
                )
            );

            return;
        }

        const nativeCurrencySymbol = getAppDefaultEvmConfig(searchedTransaction.network).viemChain
            .nativeCurrency.symbol;

        const message = generateTransactionReceiptMessage(
            searchedTransaction.transaction,
            searchedTransaction.network,
            nativeCurrencySymbol
        );

        await BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(whatsAppPhoneParams.userPhoneNumber, message)
        );

        const tokenTransfersCount = OnchainAnalyticsLibrary.filterTokenTransfers(
            searchedTransaction.transaction.logs
        ).length;

        const serializedParams = JSON.stringify({
            transactionHash,
            hostUrl: env.HOST_URL ?? LIVE_HOST_URL,
            network: searchedTransaction.network,
            phoneParams: whatsAppPhoneParams,
            exportType: tokenTransfersCount > 4 ? 'pdf' : 'image',
        } satisfies GenerateTransactionImageProps);

        // Spawn the background process
        const backgroundProcess = spawn(
            'bun',
            [
                path.join(BACKGROUND_PROCESSES_SCRIPTS_FOLDER, 'generate-transaction-report.ts'),
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
}

export default QueryMessageHandlers;
