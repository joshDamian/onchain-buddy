import { userProfileRepository } from '@/resources/data/db';
import {
    SetupUserProfileInput,
    setupUserProfileInputSchema,
} from '@/app/OnchainBuddy/Users/userManagementSchema';
import { getAddress } from 'viem';

class UserManagementLibrary {
    public static async getUserByPhoneNumber(phoneNumber: string) {
        if (phoneNumber.trim() === '') {
            return null;
        }

        return await userProfileRepository
            .filter({
                phoneNumber,
            })
            .getFirst();
    }

    public static async setupUserProfile(params: SetupUserProfileInput) {
        const validation = setupUserProfileInputSchema.safeParse(params);

        if (!validation.success) {
            throw new Error(validation.error.message);
        }

        const user = await this.getUserByPhoneNumber(params.phoneNumber);

        if (user) {
            throw new Error('User already exists');
        }

        return await userProfileRepository.create({
            phoneNumber: params.phoneNumber,
            displayName: params.displayName,
            walletAddresses: params.walletAddresses.map((address) => getAddress(address)),
        });
    }

    public static async addWalletAddresses(phoneNumber: string, walletAddresses: string[]) {
        const user = await this.getUserByPhoneNumber(phoneNumber);

        if (!user) {
            throw new Error('User not found');
        }

        const newWalletAddresses = [...user.walletAddresses, ...walletAddresses].map((address) =>
            getAddress(address)
        );
        const uniqueWalletAddresses = Array.from(new Set(newWalletAddresses));

        return await userProfileRepository.update(user.xata_id, {
            walletAddresses: uniqueWalletAddresses,
        });
    }

    public static async getUserProfilesByWalletAddress(walletAddress: string) {
        return await userProfileRepository
            .filter({
                walletAddresses: { $includes: walletAddress },
            })
            .getAll();
    }
}

export default UserManagementLibrary;
