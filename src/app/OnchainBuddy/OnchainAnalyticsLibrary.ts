import { formatEther, parseEther, TransactionReceipt } from 'viem';
import * as path from 'node:path';
import { SupportedChain } from '@/app/types';
import { generateHtmlFromJsx } from '@/utils/template-rendering';
import TransactionSummary from '@/resources/templates/TransactionSummary';
import { ComponentProps } from 'react';
import { getTransactionExplorerUrl } from '@/resources/explorer';
import { captureAndStorePageScreenshotAsImage } from '@/utils/page-capture';

class OnchainAnalyticsLibrary {
    private static readonly GENERATED_IMAGES_PATH = path.join('./', 'analytic-files', 'images');
    private static readonly GENERATED_PDFS_PATH = path.join('./', 'analytic-files', 'pdfs');

    public static async generateBasicTransactionSummaryPage(
        transactionReceipt: TransactionReceipt,
        network: SupportedChain
    ) {
        // Generate a basic transaction summary page
        return generateHtmlFromJsx<ComponentProps<typeof TransactionSummary>>(TransactionSummary, {
            transactionHash: transactionReceipt.transactionHash,
            from: transactionReceipt.from,
            to: transactionReceipt.to ?? '',
            status: transactionReceipt.status,
            network: network,
            title: 'Transaction Summary',
            blockHeight: transactionReceipt.blockNumber.toString(),
            amount: formatEther(parseEther('2.4')),
            transactionFee: formatEther(
                transactionReceipt.effectiveGasPrice * transactionReceipt.gasUsed
            ),
            explorerUrl: getTransactionExplorerUrl(transactionReceipt.transactionHash, network),
        });
    }

    public static async exportBasicTransactionAnalyticsToImage(
        transactionHash: string,
        network: SupportedChain,
        domain: string
    ): Promise<
        | {
              path: string;
          }
        | {
              buffer: Uint8Array;
          }
    > {
        const analyticsPageUrl = `${domain}/render/analytics/tx/${transactionHash}?network=${network}&level=basic`;
        // Generate an image from the analytics page
        const imageFilePath = path.join(this.GENERATED_IMAGES_PATH, `${transactionHash}.png`);

        const buffer = await captureAndStorePageScreenshotAsImage(analyticsPageUrl, imageFilePath);

        if (buffer) {
            return {
                buffer,
            };
        }

        return {
            path: imageFilePath,
        };
    }
}

export default OnchainAnalyticsLibrary;
