import { SupportedChain } from '@/app/types';
import AlchemyNotifyService from '@/app/AlchemyNotify/AlchemyNotifyService';
import { Address } from 'viem';
import { walletSubscriptionRepository } from '@/resources/data/db';
import { getXataClient } from '@/xata';

class OnchainBuddyLibrary {
    public static async subscribeWalletNotification(
        walletAddress: Address,
        network: SupportedChain,
        subscriberPhoneNumber: string
    ) {
        await AlchemyNotifyService.addWebhookAddresses([walletAddress], network);

        const existingSubscription = await walletSubscriptionRepository
            .filter({
                walletAddress: walletAddress,
                subscriberPhoneNumber: subscriberPhoneNumber,
            })
            .getFirst();

        if (existingSubscription) {
            return existingSubscription;
        }

        await walletSubscriptionRepository.create({
            walletAddress: walletAddress,
            subscriberPhoneNumber: subscriberPhoneNumber,
        });
    }

    public static async findSubscriptionsByWalletAddress(walletAddress: Address) {
        return walletSubscriptionRepository
            .filter({
                walletAddress: walletAddress,
            })
            .getAll();
    }
}

export default OnchainBuddyLibrary;
