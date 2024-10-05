import express from 'express';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { supportedChainSchema } from '@/app/schema';
import { getPublicClient } from '@/resources/viem/viemClients';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';

const renderingRouter = express.Router();

renderingRouter.get('/analytics/tx/:transactionHash', async (req, res) => {
    const { transactionHash } = req.params;
    const { level, network } = req.query as {
        level: 'basic' | 'advanced';
        origin: 'whatsapp' | 'web';
        network: string;
    };

    const networkValidation = supportedChainSchema.safeParse(network);

    if (!networkValidation.success) {
        return res.status(400).send('Invalid network');
    }

    const validNetwork = networkValidation.data;

    const networkConfig = getAppDefaultEvmConfig(validNetwork);
    const publicClient = getPublicClient(networkConfig.viemChain, networkConfig.rpcUrl);

    const [transactionReceipt, transaction] = await Promise.all([
        OnchainBuddyLibrary.getTransactionReceiptByHash(transactionHash, publicClient),
        OnchainBuddyLibrary.getTransactionByHash(transactionHash, publicClient),
    ]);

    if (!transactionReceipt || !transaction) {
        return res.status(404).send('Transaction not found');
    }

    const htmlContent =
        level === 'basic'
            ? await OnchainAnalyticsLibrary.generateBasicTransactionSummaryPage(
                  transaction,
                  transactionReceipt,
                  validNetwork
              )
            : 'Advanced analytics page';

    res.send(htmlContent);
});

export default renderingRouter;
