import { PhoneNumberParams } from '@/app/WhatsApp/types';
import { Address, getAddress, isAddress, isHash } from 'viem';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { DEFAULT_NETWORK, FALLBACK_QUERY_DATE_RANGE, LIVE_HOST_URL } from '@/constants/strings';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import { logSync } from '@/resources/logger';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import { generateTransactionReceiptMessage } from '@/utils/whatsapp-messages';
import env from '@/constants/env';
import { GenerateTransactionImageProps } from '@/app/WhatsApp/backgroundProcesses/generate-transaction-report';
import { spawn } from 'child_process';
import path from 'node:path';
import UserManagementLibrary from '@/app/OnchainBuddy/Users/UserManagementLibrary';
import { getPublicClient } from '@/resources/viem/viemClients';
import UserOnboardingLibrary from '@/app/WhatsApp/Onboarding/UserOnboardingLibrary';
import AlchemyNotifyService from '@/app/AlchemyNotify/AlchemyNotifyService';
import { RetrieveDeFiSwapsHistoryAction } from '@/app/WhatsApp/TextContexts/contextSchema';
import {
    convertDateTagToDate,
    convertDateToTimestamp,
    formatDateToHumanReadable,
} from '@/utils/date-formatting';
import { supportedExchangeSchema } from '@/app/schema';
import UniswapSwapHistoryQuery from '@/app/Subgraphs/swapHistory/UniswapSwapHistoryQuery';
import { SwapSummary } from '@/app/Subgraphs/schema';
import { SendSwapsExcelSheetProps } from '@/app/WhatsApp/backgroundProcesses/send-swaps-excel-sheet';
import { defaultAmountFixer, prettifyNumber } from '@/utils/number-formatting';

const BACKGROUND_PROCESSES_SCRIPTS_FOLDER = path.join(__dirname, 'backgroundProcesses');

////////////////////////////////
// Handle Query Messages
// This library is responsible for handling messages related to on-chain queries.
class QueryMessageHandlers {
    /**
     * @deprecated Attach wallet address to user profile instead using handleWalletAddressRegistrationRelatedQuery
     * @param whatsAppPhoneParams
     * @param walletAddress
     */
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

        const networkConfig = getAppDefaultEvmConfig(searchedTransaction.network);

        const nativeCurrencySymbol = networkConfig.viemChain.nativeCurrency.symbol;

        const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);

        const tokenTransfers = OnchainAnalyticsLibrary.filterTokenTransfers(
            searchedTransaction.transaction.logs
        );
        const [userProfile, transaction, decodedTokenTransfers] = await Promise.all([
            UserManagementLibrary.getUserByPhoneNumber(whatsAppPhoneParams.userPhoneNumber),
            OnchainBuddyLibrary.getTransactionByHash(transactionHash, publicClient),
            OnchainAnalyticsLibrary.decodeTokenTransfers(tokenTransfers, networkConfig.network),
        ]);

        const message = generateTransactionReceiptMessage({
            receipt: searchedTransaction.transaction,
            chain: searchedTransaction.network,
            nativeCurrencySymbol: nativeCurrencySymbol,
            decodedTokenTransfers,
            userWalletAddresses: userProfile?.walletAddresses ?? [],
            transaction,
        });

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

    public static async handleWalletAddressRegistrationRelatedQuery(
        whatsAppPhoneParams: PhoneNumberParams,
        walletAddress: string,
        displayName: string
    ) {
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
        const user = await UserManagementLibrary.getUserByPhoneNumber(
            whatsAppPhoneParams.userPhoneNumber
        );

        if (!user) {
            await UserOnboardingLibrary.setupNewUserProfile(whatsAppPhoneParams, {
                displayName,
                primaryWalletAddress: walletAddress,
            });

            return;
        }

        if (user.walletAddresses.includes(getAddress(walletAddress))) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    'ℹ Wallet already linked'
                )
            );

            return;
        }

        void BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                '🔗 Linking wallet...'
            )
        );

        const updated = await UserManagementLibrary.addWalletAddresses(
            whatsAppPhoneParams.userPhoneNumber,
            [walletAddress]
        );

        if (!updated) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    '❌ Failed to link wallet'
                )
            );

            return;
        }

        const promises = AlchemyNotifyService.SUPPORTED_CHAINS.map((network) =>
            AlchemyNotifyService.addWebhookAddresses([walletAddress], network)
        );

        await Promise.allSettled(promises);

        await BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                '✅ Wallet linked successfully'
            )
        );
    }

    public static async handleDefiSwapsHistoryRelatedQuery(
        whatsAppPhoneParams: PhoneNumberParams,
        queryParams: RetrieveDeFiSwapsHistoryAction['params']
    ) {
        const { walletAddress, network, exchange, dateRange } = queryParams;

        const [startFrom, endAt] = [
            convertDateTagToDate(dateRange.start) ??
                convertDateTagToDate(FALLBACK_QUERY_DATE_RANGE.start)!,
            convertDateTagToDate(dateRange.end) ??
                convertDateTagToDate(FALLBACK_QUERY_DATE_RANGE.end)!,
        ];

        // Check exchange value
        const exchangeValidation = supportedExchangeSchema.safeParse(exchange.toLowerCase());

        if (!exchangeValidation.success) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    `Sorry, the bot doesn't support the exchange "${exchange}" yet.\n\nSupported exchanges are: ${Object.values(supportedExchangeSchema.enum).join(', ')}`
                )
            );

            return;
        }

        let [startFromTimestamp, endAtTimestamp] = [
            convertDateToTimestamp(startFrom),
            convertDateToTimestamp(endAt),
        ];

        // Swap dates if start date is greater than end date
        if (startFromTimestamp > endAtTimestamp) {
            [startFromTimestamp, endAtTimestamp] = [endAtTimestamp, startFromTimestamp];
        }

        switch (exchangeValidation.data) {
            case 'uniswap':
                await BotApi.sendWhatsappMessage(
                    whatsAppPhoneParams.businessPhoneNumberId,
                    MessageGenerators.generateTextMessage(
                        whatsAppPhoneParams.userPhoneNumber,
                        '🔄 Searching for Uniswap swaps...'
                    )
                );

                // Handle Uniswap swaps history query
                const uniswapSwaps = await UniswapSwapHistoryQuery.getSwapHistory({
                    sender: walletAddress,
                    dateRange: {
                        start: startFromTimestamp.toString(),
                        end: endAtTimestamp.toString(),
                    },
                    network,
                });

                if (!uniswapSwaps?.length) {
                    await BotApi.sendWhatsappMessage(
                        whatsAppPhoneParams.businessPhoneNumberId,
                        MessageGenerators.generateTextMessage(
                            whatsAppPhoneParams.userPhoneNumber,
                            'No swaps found for the specified date range.'
                        )
                    );
                    return;
                }

                const swapsSummary = UniswapSwapHistoryQuery.extractSwapSummary(
                    uniswapSwaps,
                    startFromTimestamp,
                    endAtTimestamp
                );
                const swapSummaryMessageText = this.generateSwapSummaryMessage(
                    swapsSummary,
                    walletAddress,
                    exchangeValidation.data,
                    `${formatDateToHumanReadable(startFromTimestamp)} - ${formatDateToHumanReadable(endAtTimestamp)}`,
                    network
                );

                await BotApi.sendWhatsappMessage(
                    whatsAppPhoneParams.businessPhoneNumberId,
                    MessageGenerators.generateTextMessage(
                        whatsAppPhoneParams.userPhoneNumber,
                        swapSummaryMessageText
                    )
                );

                const serializedParams = JSON.stringify({
                    swapsInfo: {
                        exchange: exchangeValidation.data,
                        swaps: uniswapSwaps,
                    },
                    phoneParams: whatsAppPhoneParams,
                } satisfies SendSwapsExcelSheetProps);

                // Spawn the background process
                const backgroundProcess = spawn(
                    'bun',
                    [
                        path.join(BACKGROUND_PROCESSES_SCRIPTS_FOLDER, 'send-swaps-excel-sheet.ts'),
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

    private static generateSwapSummaryMessage(
        swapsSummary: SwapSummary,
        walletAddress: string,
        exchange: string,
        timePeriod: string,
        network: string
    ) {
        const {
            totalSwaps,
            totalVolumeUSD,
            largestSwap,
            smallestSwap,
            mostSwappedTokens,
            volumeTrend,
        } = swapsSummary;

        const mostSwappedTokensMessage = Object.entries(mostSwappedTokens)
            .map(
                ([tokenSymbol, swapCount]) =>
                    `- ${tokenSymbol} 🌟: ${swapCount} ${swapCount === 1 ? 'swap' : 'swaps'}`
            )
            .join('\n');

        const capitalizedExchange = exchange.charAt(0).toUpperCase() + exchange.slice(1);

        return (
            `🔄 *${capitalizedExchange} Swaps for Wallet:* ${walletAddress}\n` +
            `📅 *Time Period:* ${timePeriod} (${network})\n\n` +
            `📊 *Swap Summary* 📊\n\n` +
            `*Total Swaps:* ${totalSwaps} ${totalSwaps === 1 ? 'swap' : 'swaps'} 🔄\n` +
            `*Total Volume USD:* 💰 $${prettifyNumber(totalVolumeUSD)}\n` +
            `*Largest Swap USD:* 🏆 $${prettifyNumber(largestSwap)}\n` +
            `*Smallest Swap USD:* 📉 $${prettifyNumber(smallestSwap)}\n\n` +
            `*Most Swapped Tokens:*\n${mostSwappedTokensMessage}\n\n` +
            `*Volume Trend:* 📈 ${defaultAmountFixer(volumeTrend)}% `
        );
    }
}

export default QueryMessageHandlers;
