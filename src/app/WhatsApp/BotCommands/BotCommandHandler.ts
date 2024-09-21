import {
    BOT_COMMANDS_REGEX,
    SubscribeWalletMatchGroups,
} from '@/app/WhatsApp/BotCommands/commands';
import { PhoneNumberParams } from '@/app/WhatsApp/types';
import OnchainBuddyLibrary from '@/app/OnchainBuddy/OnchainBuddyLibrary';
import { DEFAULT_NETWORK } from '@/constants/strings';
import { Address } from 'viem';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';

type BotCommand = keyof typeof BOT_COMMANDS_REGEX;

class BotCommandHandler {
    public static async handlePossibleCommand(
        text: string,
        phoneParams: PhoneNumberParams,
        displayName: string
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
        // Handle wallet subscription

        await OnchainBuddyLibrary.subscribeWalletNotification(
            wallet as Address,
            DEFAULT_NETWORK,
            phoneParams.userPhoneNumber
        );

        await BotApi.sendWhatsappMessage(
            phoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                '✅ Wallet subscription successful',
                phoneParams.userPhoneNumber
            )
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
            default:
                return {
                    command: commandName,
                    params: {},
                };
        }
    }
}

export default BotCommandHandler;
