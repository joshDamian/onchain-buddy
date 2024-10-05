/**
 * @dev Webhook IDs for Alchemy Notify.
 * Docs: https://docs.alchemy.com/reference/notify-api-quickstart
 * @notice These IDs are specific to the Alchemy account hosting the webhook service.
 * @notice Do not use these IDs for other Alchemy accounts.
 * */
import { SupportedChain } from '@/app/schema';

const WEBHOOK_IDS: {
    [key in SupportedChain]?: string;
} = {
    Arbitrum: 'wh_67lb7ydbemh6veui',
    Base: 'wh_m2tq7i37fj4u8n5m',
    Polygon: 'wh_s2kxghl9wa76cxuc',
    Ethereum: 'wh_ohv91kqssbz8nj46',
    Optimism: 'wh_q7qhcmkf11eq25vv',
};

export const getWebhookId = (network: SupportedChain) => WEBHOOK_IDS[network];
