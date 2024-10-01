const POSSIBLE_ACTIONS = [
    {
        action: 'find_transaction',
        params: {
            transactionHash: '<transaction_hash>',
        },
        explanation: 'Find a transaction by its hash.',
        example: 'Search for this transaction <transaction_hash>.',
    },
];

export function prepareOnchainQueryPrompt(prompt: string): {
    prompt: string;
    system_prompt: string;
} {
    const refinedPrompt = `
        Based on the user's request: "${prompt}", determine the exact on-chain query from theses supported actions: ${JSON.stringify(POSSIBLE_ACTIONS)}.
        
        Rules:
        1. If a valid action can be identified, your response should not be more than a JSON object containing the action with parameters filled, nothing else.
        2. If the user asks about blockchain terms, provide a clear and concise explanation (and nothing else), in direct speech.
        3. If no valid action is found or the query is unclear, ask for clarification or provide help based on the available actions, directing responses to the user, not the platform.
        4. Respond concisely, engaging the user only if needed for clarification or additional information.
        5. Max tokens allowed: 128. Provide very short responses to unrelated queries.
        6. If no valid action with parameters is found, omit the JSON object and action key from your response. Provide examples using natural language, similar to those in the object.
    `;

    return {
        prompt: refinedPrompt.trim(),
        system_prompt: 'You are a blockchain query assistant.',
    };
}
