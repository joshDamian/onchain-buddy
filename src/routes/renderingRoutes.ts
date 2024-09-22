import express from 'express';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { SupportedChain } from '@/app/types';
import { getPublicClient } from '@/app/OnchainBuddy/viemClients';
import { getAppDefaultEvmConfig } from '@/app/OnchainBuddy/config';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';

const renderingRouter = express.Router();

renderingRouter.get('/analytics/tx/:transactionHash', async (req, res) => {
    const { transactionHash } = req.params;
    const { network, level } = req.query as {
        network: SupportedChain;
        level: 'basic' | 'advanced';
    };

    const networkConfig = getAppDefaultEvmConfig(network);
    if (!networkConfig) {
        return res.status(400).send('Invalid network');
    }

    const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);

    const transactionReceipt = await OnchainBuddyLibrary.getTransactionByHash(
        transactionHash,
        publicClient
    );

    if (!transactionReceipt) {
        return res.status(404).send('Transaction not found');
    }

    const htmlContent =
        level === 'basic'
            ? await OnchainAnalyticsLibrary.generateBasicTransactionSummaryPage(
                  transactionReceipt,
                  network
              )
            : 'Advanced analytics page';

    res.send(htmlContent);
});

export default renderingRouter;
