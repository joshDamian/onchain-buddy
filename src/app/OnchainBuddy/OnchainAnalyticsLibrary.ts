import {
    decodeEventLog,
    formatEther,
    formatUnits,
    Hex,
    Log,
    Transaction,
    TransactionReceipt,
} from 'viem';
import * as path from 'node:path';
import { SUPPORTED_CHAINS, SupportedChain } from '@/app/types';
import { generateHtmlFromJsx } from '@/utils/template-rendering';
import TransactionSummary from '@/resources/templates/TransactionSummary';
import { ComponentProps } from 'react';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import { captureAndStorePageScreenshotAsImage } from '@/utils/page-capture';
import { TRANSFER_EVENT_TOPIC, ZERO_DATA } from '@/constants/strings';
import { TRANSFER_EVENT_ABI } from '@/resources/abis/erc-20';
import TokenMetadataQueryLibrary from '@/app/Subgraphs/TokenMetadataQuery';
import { TokenMetadata } from '@/app/Subgraphs/schema';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import { getPublicClient } from '@/resources/viem/viemClients';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';

type TransactionSummaryProps = ComponentProps<typeof TransactionSummary>;

class OnchainAnalyticsLibrary {
    private static readonly GENERATED_IMAGES_PATH = path.join('./', 'analytic-files', 'images');
    private static readonly GENERATED_PDFS_PATH = path.join('./', 'analytic-files', 'pdfs');

    public static async generateBasicTransactionSummaryPage(
        transaction: Transaction,
        transactionReceipt: TransactionReceipt,
        network: SupportedChain
    ) {
        const erc20TokenTransferLogs = transactionReceipt.logs.filter((log) => {
            return (
                (log.topics as Array<Hex>).includes(TRANSFER_EVENT_TOPIC as Hex) &&
                log.data !== ZERO_DATA
            );
        });

        const assetTransfers = await this.decodeTokenTransfers(erc20TokenTransferLogs, network);

        const networkConfig = getAppDefaultEvmConfig(network);

        const nativeCurrencySymbol = networkConfig.viemChain.nativeCurrency.symbol;

        // Generate a basic transaction summary page
        return generateHtmlFromJsx<TransactionSummaryProps>(TransactionSummary, {
            transactionHash: transactionReceipt.transactionHash,
            from: transactionReceipt.from,
            to: transactionReceipt.to ?? 'NIL',
            status: transactionReceipt.status,
            network: network,
            title: 'Transaction Summary',
            blockHeight: transactionReceipt.blockNumber.toString(),
            value: `${formatEther(transaction.value)} ${nativeCurrencySymbol}`,
            transactionFee: `${formatEther(
                transactionReceipt.effectiveGasPrice * transactionReceipt.gasUsed
            )} ${nativeCurrencySymbol}`,
            explorerUrl: getTransactionExplorerUrl(transactionReceipt.transactionHash, network),
            erc20Transfers: assetTransfers,
        });
    }

    public static async decodeTokenTransfers(
        logs: Log<bigint, number, false>[],
        chain: SupportedChain
    ) {
        const assetTransfers = logs.map((log) => {
            const decodedLog = decodeEventLog({
                abi: TRANSFER_EVENT_ABI,
                data: log.data,
                eventName: 'Transfer',
                topics: log.topics,
            });
            return {
                from: decodedLog.args.from,
                to: decodedLog.args.to,
                amount: decodedLog.args.value,
                tokenAddress: log.address,
            };
        });

        const tokenAddresses = assetTransfers.map((transfer) => transfer.tokenAddress);

        const uniqueTokenAddresses = Array.from(new Set(tokenAddresses));

        const tokensMetadataPromises = uniqueTokenAddresses.map((tokenAddress) => {
            return this.getErc20TokenMetadata(tokenAddress, chain);
        });

        const tokensMetadataSettlements = await Promise.allSettled(tokensMetadataPromises);

        const successfulTokensMetadata = tokensMetadataSettlements.filter((settlement) => {
            return settlement.status === 'fulfilled';
        }) as PromiseFulfilledResult<TokenMetadata | null>[];

        const successfulTokensMetadataMap = successfulTokensMetadata.reduce(
            (acc, settlement) => {
                if (settlement.value === null) return acc;
                acc[settlement.value.id.toLowerCase()] = settlement.value;
                return acc;
            },
            {} as Record<string, TokenMetadata>
        );

        return assetTransfers.map((transfer) => {
            const tokenMetadata = successfulTokensMetadataMap[transfer.tokenAddress.toLowerCase()];

            return {
                ...transfer,
                formattedAmount: formatUnits(
                    transfer.amount,
                    tokenMetadata ? tokenMetadata.decimals : 18
                ),
                tokenMetadata: successfulTokensMetadataMap[transfer.tokenAddress] ?? null,
            };
        });
    }

    public static async exportBasicTransactionAnalyticsToImage(
        transactionHash: string,
        domain: string,
        network: SupportedChain
    ): Promise<
        | {
              path: string;
          }
        | {
              buffer: Uint8Array;
          }
        | undefined
    > {
        const analyticsPageUrl = `${domain}/render/analytics/tx/${transactionHash}?level=basic&network=${network}&origin=whatsapp`;

        const buffer = await captureAndStorePageScreenshotAsImage(analyticsPageUrl);

        if (buffer) {
            return {
                buffer,
            };
        }
    }

    public static async searchTransactionByHash(transactionHash: string) {
        const networkConfigs = SUPPORTED_CHAINS.map((chain) => getAppDefaultEvmConfig(chain));

        const publicClients = networkConfigs.map((networkConfig) => {
            return getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);
        });

        // Search for transaction in all networks
        const promises = publicClients.map((client) => {
            return new Promise(async (resolve) => {
                try {
                    const transaction = await OnchainBuddyLibrary.getTransactionReceiptByHash(
                        transactionHash,
                        client
                    );

                    resolve({
                        network: networkConfigs.find(
                            (networkConfig) => networkConfig.viemChain === client.chain
                        )?.network,
                        transaction,
                    });
                } catch (error) {
                    resolve({
                        network: networkConfigs.find(
                            (networkConfig) => networkConfig.viemChain === client.chain
                        )?.network,
                        transaction: undefined,
                    });
                }
            });
        });

        const settlements = await Promise.allSettled(promises);

        const successfulSettlements = settlements.filter(
            (settlement) => settlement.status === 'fulfilled'
        ) as Array<
            PromiseFulfilledResult<{
                network: SupportedChain;
                transaction: TransactionReceipt;
            }>
        >;

        return successfulSettlements.find((settlement) => {
            return !!settlement.value?.transaction;
        })?.value;
    }

    public static async getErc20TokenMetadata(tokenAddress: string, chain: SupportedChain) {
        // Prefer using the subgraph to fetch token metadata
        const tokenMetadata = await TokenMetadataQueryLibrary.getErc20TokenMetadata(
            tokenAddress,
            chain
        );

        if (tokenMetadata) {
            return tokenMetadata;
        }

        // Fallback to using the public client
        const networkConfig = getAppDefaultEvmConfig(chain);
        const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);

        return await OnchainBuddyLibrary.getErc20TokenMetadata(tokenAddress, publicClient);
    }
}

export default OnchainAnalyticsLibrary;
