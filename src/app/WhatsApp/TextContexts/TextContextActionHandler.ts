import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';
import QueryMessageHandlers from '@/app/WhatsApp/QueryMessageHandlers';
import { PhoneNumberParams } from '@/app/WhatsApp/types';

class TextContextActionHandler {
    public static async handleAction(
        action: PossibleActions,
        whatsAppPhoneParams: PhoneNumberParams
    ) {
        switch (action.action) {
            case 'find_transaction':
                await QueryMessageHandlers.handleTransactionQueryRelatedMessage(
                    whatsAppPhoneParams,
                    action.params.transactionHash
                );
                break;
            default:
                return 'Unknown action';
        }
    }
}

export default TextContextActionHandler;
