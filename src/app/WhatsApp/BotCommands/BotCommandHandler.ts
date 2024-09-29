import {
    BOT_COMMANDS_REGEX,
    QueryTransactionMatchGroups,
    SubscribeWalletMatchGroups,
} from '@/app/WhatsApp/BotCommands/commands';
import { PhoneNumberParams } from '@/app/WhatsApp/types';
import QueryMessageHandlers from '@/app/WhatsApp/QueryMessageHandlers';

type BotCommand = keyof typeof BOT_COMMANDS_REGEX;

class BotCommandHandler {
    public static async handlePossibleCommand(
        text: string,
        phoneParams: PhoneNumberParams,
        _displayName: string
    ): Promise<{
        handled: boolean;
    }> {
        const botCommand = BotCommandHandler.isCommand(text);

        if (!botCommand) {
            return {
                handled: false,
            };
        }

        switch (botCommand.command) {
            case 'SUBSCRIBE_WALLET':
                await BotCommandHandler.handleWalletSubscriptionCommand(
                    phoneParams,
                    botCommand.params.wallet
                );
                break;
            case 'QUERY_TRANSACTION':
                await BotCommandHandler.handleTransactionQueryCommand(
                    phoneParams,
                    botCommand.params.transactionHash
                );
                break;
            default:
                return {
                    handled: false,
                };
        }

        return {
            handled: true,
        };
    }

    public static async handleWalletSubscriptionCommand(
        phoneParams: PhoneNumberParams,
        wallet: string
    ) {
        await QueryMessageHandlers.handleWalletSubscriptionRelatedMessage(phoneParams, wallet);
    }

    public static async handleTransactionQueryCommand(
        phoneParams: PhoneNumberParams,
        transactionHash: string
    ) {
        await QueryMessageHandlers.handleTransactionQueryRelatedMessage(
            phoneParams,
            transactionHash
        );
    }

    public static isCommand(command: string) {
        const commandRegex = Object.values(BOT_COMMANDS_REGEX).find((regex) => regex.test(command));

        if (!commandRegex) {
            return undefined;
        }

        const commandName = Object.keys(BOT_COMMANDS_REGEX).find(
            (key) => BOT_COMMANDS_REGEX[key as BotCommand] === commandRegex
        ) as BotCommand;

        switch (commandName) {
            case 'SUBSCRIBE_WALLET':
                return {
                    command: commandName,
                    params: command.match(commandRegex)?.groups as SubscribeWalletMatchGroups,
                };
            case 'QUERY_TRANSACTION':
                return {
                    command: commandName,
                    params: command.match(commandRegex)?.groups as QueryTransactionMatchGroups,
                };
            default:
                return {
                    command: commandName,
                    params: {},
                };
        }
    }
}

export default BotCommandHandler;
