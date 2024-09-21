/**
 * @dev Webhook IDs for Alchemy Notify.
 * Docs: https://docs.alchemy.com/reference/notify-api-quickstart
 * @notice These IDs are specific to the Alchemy account hosting the webhook service.
 * @notice Do not use these IDs for other Alchemy accounts.
 * */
import { SupportedChain } from '@/app/types';

const WEBHOOK_IDS: {
    [key in SupportedChain]: string;
} = {
    Arbitrum: '',
};

export const getWebhookId = (network: SupportedChain) => WEBHOOK_IDS[network];
