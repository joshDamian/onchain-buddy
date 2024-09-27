import { SupportedChain } from '@/app/types';
import AlchemyNotifyService from '@/app/AlchemyNotify/AlchemyNotifyService';
import { Address, getAddress, PublicClient } from 'viem';
import { walletSubscriptionRepository } from '@/resources/data/db';
import { TOKEN_METADATA_ABI } from '@/resources/abis/erc-20';

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

    public static async getTransactionReceiptByHash(
        transactionHash: string,
        publicClient: PublicClient
    ) {
        return await publicClient.getTransactionReceipt({
            hash: transactionHash as Address,
        });
    }

    public static async getTransactionByHash(transactionHash: string, publicClient: PublicClient) {
        return await publicClient.getTransaction({
            hash: transactionHash as Address,
        });
    }

    public static async getErc20TokenMetadata(tokenAddress: string, publicClient: PublicClient) {
        const validTokenAddress = getAddress(tokenAddress);

        const [name, symbol, decimals] = await Promise.all([
            publicClient.readContract({
                abi: TOKEN_METADATA_ABI,
                functionName: 'name',
                address: validTokenAddress,
            }),
            publicClient.readContract({
                abi: TOKEN_METADATA_ABI,
                functionName: 'symbol',
                address: validTokenAddress,
            }),
            publicClient.readContract({
                abi: TOKEN_METADATA_ABI,
                functionName: 'decimals',
                address: validTokenAddress,
            }),
        ]);

        return {
            id: validTokenAddress,
            name,
            symbol,
            decimals,
        };
    }
}

export default OnchainBuddyLibrary;
