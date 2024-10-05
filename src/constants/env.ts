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
    WA_PHONE_NUMBER_ID: notEmptyStringSchema('WA_PHONE_NUMBER_ID'),
    WA_WEBHOOK_VERIFY_TOKEN: notEmptyStringSchema('WA_WEBHOOK_VERIFY_TOKEN'),
    XATA_API_KEY: notEmptyStringSchema('XATA_API_KEY'),
    HOST_URL: z.string().url().default('https://onchain-buddy.onrender.com'),
    THE_GRAPH_API_KEY: notEmptyStringSchema('THE_GRAPH_API_KEY'),
    REPLICATE_API_TOKEN: notEmptyStringSchema('REPLICATE_API_TOKEN'),

    // Notify Signing Keys
    ALCHEMY_NOTIFY_FORWARDER_AUTH_TOKEN: notEmptyStringSchema('ALCHEMY_AUTH_TOKEN'),
    ALCHEMY_NOTIFY_FORWARDER_ARB_SIGNING_KEY: notEmptyStringSchema(
        'ALCHEMY_NOTIFY_ARB_SIGNING_KEY'
    ),
    ALCHEMY_NOTIFY_FORWARDER_ETH_SIGNING_KEY: notEmptyStringSchema(
        'ALCHEMY_NOTIFY_ETH_SIGNING_KEY'
    ),
    ALCHEMY_NOTIFY_FORWARDER_POLYGON_SIGNING_KEY: notEmptyStringSchema(
        'ALCHEMY_NOTIFY_POLYGON_SIGNING_KEY'
    ),
    ALCHEMY_NOTIFY_FORWARDER_BASE_SIGNING_KEY: notEmptyStringSchema(
        'ALCHEMY_NOTIFY_BASE_SIGNING_KEY'
    ),
    ALCHEMY_NOTIFY_FORWARDER_OPTIMISM_SIGNING_KEY: notEmptyStringSchema(
        'ALCHEMY_NOTIFY_OPTIMISM_SIGNING_KEY'
    ),
});

const env = envSchema.parse(process.env);

export default env;
