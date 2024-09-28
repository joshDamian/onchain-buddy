import { SupportedChain } from '@/app/types';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import { logSync } from '@/resources/logger';
import fs from 'node:fs';
import { uploadFile } from '@/utils/ipfs-upload';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import { PhoneNumberParams } from '@/app/WhatsApp/types';

export type GenerateTransactionImageProps = {
    transactionHash: string;
    hostUrl: string;
    network: SupportedChain;
    phoneParams: PhoneNumberParams;
};

async function generateBasicTransactionImage(params: GenerateTransactionImageProps) {
    const { transactionHash, hostUrl, network, phoneParams } = params;

    const startedAtAnalytics = Date.now();
    const response = await OnchainAnalyticsLibrary.exportBasicTransactionAnalyticsToImage(
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
    const imageUrl = await uploadFile(new File([fileBuffer], `${transactionHash}.png`));
    const endedAtUpload = Date.now();

    logSync('info', `Image upload took ${endedAtUpload - startedAtUpload}ms`, {
        imageUrl,
    });

    await BotApi.sendImageMessage(phoneParams, imageUrl, 'Transaction Analytics');
}

const txParams: GenerateTransactionImageProps = JSON.parse(process.argv[2]);

void generateBasicTransactionImage(txParams);
