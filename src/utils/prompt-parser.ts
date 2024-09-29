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
        Based on the user's request: "${prompt}", determine the correct on-chain query from the actions: ${JSON.stringify(POSSIBLE_ACTIONS)}.
        
        Rules:
        1. If a valid action can be identified, return only the action object (in JSON) with parameters filled and nothing else.
        2. If no valid action is found or the query is unclear, ask for clarification or provide help based on the available actions.
        3. If the user asks about blockchain terms, provide a brief explanation.
        4. Respond concisely, engaging the user only if needed for clarification or additional information.
        5. Max tokens allowed: 128
        6. Do not include raw JSON for possible actions in your query examples.
    `;

    return {
        prompt: refinedPrompt.trim(),
        system_prompt: 'You are a blockchain query assistant.',
    };
}
