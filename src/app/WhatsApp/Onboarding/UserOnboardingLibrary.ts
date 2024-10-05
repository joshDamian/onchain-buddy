import { PhoneNumberParams } from '@/app/WhatsApp/types';
import MessageGenerators from '@/app/WhatsApp/MessageGenerators';
import BotApi from '@/app/WhatsApp/BotApi/BotApi';
import UserManagementLibrary from '@/app/OnchainBuddy/Users/UserManagementLibrary';
import { GET_STARTED_MESSAGES } from '@/constants/strings';
import { SUPPORTED_CHAINS } from '@/app/schema';

class UserOnboardingLibrary {
    public static async setupNewUserProfile(
        whatsAppPhoneParams: PhoneNumberParams,
        userProfileParams: {
            displayName: string;
            primaryWalletAddress: string;
        }
    ) {
        const userProfile = await UserManagementLibrary.setupUserProfile({
            displayName: userProfileParams.displayName,
            walletAddresses: [userProfileParams.primaryWalletAddress],
            phoneNumber: whatsAppPhoneParams.userPhoneNumber,
        });

        if (!userProfile) {
            await BotApi.sendWhatsappMessage(
                whatsAppPhoneParams.businessPhoneNumberId,
                MessageGenerators.generateTextMessage(
                    whatsAppPhoneParams.userPhoneNumber,
                    `❌ Setting up your profile failed`
                )
            );
            return;
        }

        await BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                `✅ Your profile has been setup successfully\n\nHere are your details:\n\nName: ${userProfile.displayName}\nPrimary Wallet: ${userProfile.walletAddresses[0]}.\n\nHere are some things you can try out:\n\n1. Monitor your wallet\n2. Get transaction details\n3. Get DeFi swaps history\n\n_Supported Chains: ${SUPPORTED_CHAINS.join(', ')}_\n\nTo see the bot in action:\nCopy & Send this sample message: ⬇️`
            )
        );

        await BotApi.sendWhatsappMessage(
            whatsAppPhoneParams.businessPhoneNumberId,
            MessageGenerators.generateTextMessage(
                whatsAppPhoneParams.userPhoneNumber,
                GET_STARTED_MESSAGES[0]
            )
        );
    }
    public static async sendWelcomeMessage(
        whatsAppPhoneParams: PhoneNumberParams,
        displayName: string
    ) {
        const message = this.generateWelcomeMessage(
            whatsAppPhoneParams.userPhoneNumber,
            displayName
        );

        await BotApi.sendWhatsappMessage(whatsAppPhoneParams.businessPhoneNumberId, message);
    }

    private static generateWelcomeMessage(userPhoneNumber: string, displayName: string) {
        const messageText = `Hello ${displayName}! Welcome to OnchainBuddy. I am your personal blockchain assistant.\nI can help you with monitoring your wallet, transactions, and more. To get started, please provide me with your primary wallet address.\n\n_You can add more wallet addresses later. with the /register command_`;

        return MessageGenerators.generateTextMessage(userPhoneNumber, messageText);
    }
}

export default UserOnboardingLibrary;
