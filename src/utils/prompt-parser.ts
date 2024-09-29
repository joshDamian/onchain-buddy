const POSSIBLE_ACTIONS = [
    {
        action: 'find_transaction',
        params: {
            transactionHash: '<transaction_hash>',
        },
    },
];

export function prepareOnchainQueryPrompt(prompt: string): {
    prompt: string;
    system_prompt: string;
} {
    const refinedPrompt = `
        Given the user's request: "${prompt}", determine the relevant on-chain query from the possible actions: ${JSON.stringify(POSSIBLE_ACTIONS)}.
        Your response should strictly follow these rules:
        1. For a prompt to count as a valid action, you must be able to extract laa the necessary parameters from the prompt.
        2. If the prompt strictly matches one of the actions, return ONLY (with no other message) the action object (in JSON format) with the parameters filled in, conforming to the format from the possible actions JSON.
        3. If no valid action is found or the user is asking for help or general inquiries, respond with a suitable message, guiding the user on how to use the bot based on the possible actions
        4. Engage the user in a conversation to gather more information if the prompt is ambiguous or unclear.
        5. If the prompt is a question about blockchain terms or concepts, provide a brief explanation of the term or concept.
        6. Aside from responses that are JSON objects, you should respond as though you're replying to a user's message and keep responses concise.
    `;

    return {
        prompt: refinedPrompt.trim(),
        system_prompt: 'You are a blockchain query assistant.',
    };
}
