import { getReplicateClient } from '@/app/Replicate/client';
import env from '@/constants/env';
import { prepareOnchainQueryPrompt } from '@/utils/prompt-parser';
import ReplicateIntegrationLibrary from '@/app/Replicate/ReplicateIntegrationLibrary';
import { possibleActionsSchema } from './contextSchema';
import {
    INPUT_CONFIG,
    MODEL_TO_USE,
    ONCHAIN_QUERY_RULES,
    POSSIBLE_ACTIONS,
    SYSTEM_PROMPT,
} from '@/app/WhatsApp/TextContexts/config';
import logger from '@/resources/logger';
import { extractJson } from '@/utils/json-formatting';

class AITextContextParser {
    private static readonly MODEL = MODEL_TO_USE;
    private static readonly INPUT_CONFIG = INPUT_CONFIG;

    public static async deriveContextFromPrompt(prompt: string, userDisplayName: string) {
        const replicateClient = getReplicateClient(env.REPLICATE_API_TOKEN);

        const refinedPrompt = prepareOnchainQueryPrompt({
            prompt,
            possibleActions: POSSIBLE_ACTIONS,
            rules: ONCHAIN_QUERY_RULES,
            userDisplayName,
        });

        const response = await ReplicateIntegrationLibrary.runPrompt(replicateClient, {
            input: {
                prompt: refinedPrompt,
                system_prompt: SYSTEM_PROMPT,
                ...AITextContextParser.INPUT_CONFIG,
            },
            model: this.MODEL,
        });

        try {
            // Match JSON in response
            const extractedJson = extractJson(response);

            const responseJson = extractedJson ? extractedJson : (JSON.parse(response) as unknown);

            console.log(responseJson, response);

            const action = AITextContextParser.extractActionFromResponse(responseJson);

            const fallbackResponse = 'No action identified. Please try again.';

            if (extractedJson && !action) {
                void logger.error('No action identified, but JSON response was present', {
                    extractedJson,
                    prompt,
                });

                return fallbackResponse;
            }

            return action ?? response;
        } catch (error) {
            return response;
        }
    }

    private static extractActionFromResponse(responseJson: unknown) {
        const schemaValidation = possibleActionsSchema.safeParse(responseJson);

        if (!schemaValidation.success) {
            return null;
        }

        return schemaValidation.data;
    }
}

export default AITextContextParser;
