import { z } from 'zod';

export const setupUserProfileInputSchema = z.object({
    phoneNumber: z.string(),
    displayName: z.string(),
    walletAddresses: z.array(z.string()),
});

export type SetupUserProfileInput = z.infer<typeof setupUserProfileInputSchema>;
