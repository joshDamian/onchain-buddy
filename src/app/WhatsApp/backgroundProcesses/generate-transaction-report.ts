import { SupportedChain } from '@/app/types';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import { logSync } from '@/resources/logger';
import fs from 'node:fs';
import { uploadFile } from '@/utils/ipfs-upload';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import { PhoneNumberParams } from '@/app/WhatsApp/types';
import { getTransactionExplorerUrl } from '@/resources/explorer';

export type GenerateTransactionImageProps = {
    transactionHash: string;
    hostUrl: string;
    network: SupportedChain;
    phoneParams: PhoneNumberParams;
    exportType: 'image' | 'pdf';
};

async function generateBasicTransactionImage(params: GenerateTransactionImageProps) {
    const { transactionHash, hostUrl, network, phoneParams, exportType } = params;

    const startedAtAnalytics = Date.now();

    const response =
        exportType === 'image'
            ? await OnchainAnalyticsLibrary.exportBasicTransactionAnalyticsToImage(
                  transactionHash,
                  hostUrl,
                  network
              )
            : await OnchainAnalyticsLibrary.exportBasicTransactionAnalyticsToPdf(
                  transactionHash,
                  hostUrl,
                  network
              );

    const endedAtAnalytics = Date.now();

    logSync('info', `Transaction analytics took ${endedAtAnalytics - startedAtAnalytics}ms`);

    let fileBuffer: Buffer | undefined = undefined;

    if (response && 'path' in response && response.path) {
        fileBuffer = fs.readFileSync(response.path);
    }

    if (response && 'buffer' in response && response.buffer) {
        fileBuffer = Buffer.from(response.buffer);
    }

    if (!fileBuffer) {
        logSync('error', 'Failed to get file buffer');
        return;
    }

    const startedAtUpload = Date.now();

    const fileName = exportType === 'image' ? `${transactionHash}.png` : `${transactionHash}.pdf`;
    const fileUrl = await uploadFile(new File([fileBuffer], fileName));
    const endedAtUpload = Date.now();

    logSync('info', `File upload took ${endedAtUpload - startedAtUpload}ms`, {
        fileUrl: fileUrl,
    });

    const explorerUrl = getTransactionExplorerUrl(transactionHash, network);

    if (exportType === 'image') {
        await BotApi.sendImageMessage(phoneParams, fileUrl, `🔗 View on explorer: ${explorerUrl}`);
    } else {
        await BotApi.sendDocumentMessage(
            phoneParams,
            fileUrl,
            `🔗 View on explorer: ${explorerUrl}`
        );
    }
}

const txParams: GenerateTransactionImageProps = JSON.parse(process.argv[2]);

void generateBasicTransactionImage(txParams);
