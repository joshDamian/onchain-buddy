import { PhoneNumberParams } from '@/app/WhatsApp/types';
import { UniswapSwapHistory } from '@/app/Subgraphs/schema';
import { SupportedExchange } from '@/app/schema';
import UniswapSwapHistoryQuery from '@/app/Subgraphs/swapHistory/UniswapSwapHistoryQuery';
import logger from '@/resources/logger';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';

export type SendSwapsExcelSheetProps = {
    swapsInfo: {
        exchange: SupportedExchange;
        swaps: UniswapSwapHistory[];
    };
    phoneParams: PhoneNumberParams;
};

async function sendSwapsExcelSheet(params: SendSwapsExcelSheetProps) {
    const { swapsInfo, phoneParams } = params;

    switch (swapsInfo.exchange) {
        case 'uniswap':
            const fileUrl = await UniswapSwapHistoryQuery.exportSwapHistoryToExcel(swapsInfo.swaps);

            if (!fileUrl) {
                await logger.error('Failed to generate excel sheet');
                return;
            }

            await BotApi.sendDocumentMessage(phoneParams, {
                link: fileUrl,
                filename: 'Swaps Query Result',
                caption: `Here's an excel sheet with the swaps you requested`,
            });
            break;

        default:
            await logger.error('Unsupported exchange');
            break;
    }
}

const swapParams: SendSwapsExcelSheetProps = JSON.parse(process.argv[2]);

void sendSwapsExcelSheet(swapParams);
