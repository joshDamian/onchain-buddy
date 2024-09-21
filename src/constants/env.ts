import { z } from 'zod';
import 'dotenv/config';

const notEmptyStringSchema = (variableName: string) =>
    z.string().refine((val) => val.trim() !== '', {
        message: `Please set ${variableName} in .env`,
        path: [variableName],
    });

const envSchema = z.object({
    PORT: z.coerce.number().default(5123),
    WA_CLOUD_ACCESS_TOKEN: notEmptyStringSchema('WA_CLOUD_ACCESS_TOKEN'),
    WA_CLOUD_API_URL: notEmptyStringSchema('WA_CLOUD_API_URL').default(
        'https://graph.facebook.com/v20.0'
    ),
    LOG_TAIL_SOURCE_TOKEN: notEmptyStringSchema('LOG_TAIL_SOURCE_TOKEN'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    ALCHEMY_NOTIFY_ARB_SIGNING_KEY: notEmptyStringSchema('ALCHEMY_NOTIFY_ARB_SIGNING_KEY'),
    ALCHEMY_AUTH_TOKEN: notEmptyStringSchema('ALCHEMY_AUTH_TOKEN'),
    WA_PHONE_NUMBER_ID: notEmptyStringSchema('WA_PHONE_NUMBER_ID'),
    WA_WEBHOOK_VERIFY_TOKEN: notEmptyStringSchema('WA_WEBHOOK_VERIFY_TOKEN'),
});

const env = envSchema.parse(process.env);

export default env;
