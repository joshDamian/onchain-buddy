import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import QueryMessageHandlers from '@/app/WhatsApp/QueryMessageHandlers';
import { PhoneNumberParams } from '@/app/WhatsApp/types';

class TextContextActionHandler {
    public static async handleAction(
        action: PossibleActions,
        whatsAppPhoneParams: PhoneNumberParams,
        displayName: string
    ) {
        switch (action.action) {
            case 'find_transaction':
                await QueryMessageHandlers.handleTransactionQueryRelatedMessage(
                    whatsAppPhoneParams,
                    action.params.transactionHash
                );
                return true;
            case 'monitor_wallet':
                await QueryMessageHandlers.handleWalletAddressRegistrationRelatedQuery(
                    whatsAppPhoneParams,
                    action.params.walletAddress,
                    displayName
                );
                return true;
            case 'retrieve_defi_swaps_history':
                await QueryMessageHandlers.handleDefiSwapsHistoryRelatedQuery(
                    whatsAppPhoneParams,
                    action.params
                );
                return true;
            default:
                return false;
        }
    }
}

export default TextContextActionHandler;
