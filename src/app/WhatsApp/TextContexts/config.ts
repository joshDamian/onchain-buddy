import { SUPPORTED_CHAINS, SupportedChain, SupportedExchange } from '@/app/schema';
import { PossibleActions } from '@/app/WhatsApp/TextContexts/contextSchema';

export const ONCHAIN_QUERY_RULES = ` 
    1. If a valid action can be identified, your response **must** return only a **JSON object** containing the action and the filled parameters. **No other text or explanation should be included**. Any additional text is considered incorrect. (VERY IMPORTANT)
    2. If an identified action is close to the user's query but not an exact match, provide a helpful error or ask for clarification, rejecting invalid formats (VERY IMPORTANT).
    3. If the user asks about blockchain terms or what you can do, provide a clear and concise explanation (and nothing else), in direct speech.
    4. If no valid action is found or the query is unclear, ask for clarification or provide help based on the available actions, directing responses to the user, not the platform.
    5. Respond concisely, engaging the user only if needed for clarification or additional information.
    6. Max tokens allowed: 256. Provide very short responses to unrelated queries.
    7. If no valid action is found or the parameters for a valid action are incomplete, you must omit the JSON object from your response. This is mandatory. Instead, provide clear examples using natural language, similar to those provided in the object. Failure to follow this rule will result in an incorrect response.
    8. For actions with the network parameter, the supported networks are ${SUPPORTED_CHAINS.join(', ')}, you should infer correctly from the user's request.
    9. For date ranges, if the inferred dates are not in Little-endian (DD/MM/YYYY), Middle-endian (MM/DD/YYYY), or Big-endian (YYYY-MM-DD) formats, use the following rules:
        - Present time: Use 'now' for the current moment.
        - Past times: Format using '<quantity>|<unit>', where:
          - <quantity> is a number indicating how far back in time (e.g., 30, 2, 15).
          - <unit> is a letter representing the time unit:
            - Y for years,
            - M for months,
            - W for weeks,
            - D for days,
            - H for hours,
            - m for minutes,
            - s for seconds.
        
        - Examples of correct formats:
          - '30|D' for 30 days ago,
          - '2|H' for 2 hours ago,
          - '15|m' for 15 minutes ago,
          - '1|W' for 1 week ago.
          - '1|M' for 1 month ago.
        
        - Avoid using relative phrases like:
          - '30 days ago',
          - '2 hours ago',
          - '1 week ago',
          - 'now-*' or any other non-standard relative time expression.
        
        - Incorrect formats:
          - 'now-1Y' (should be '1|Y'),
          - 'now-90|D' (should be '90|D'),
          - 'now-1w' (should be '1|W'),
          - 'now-*' (should use 'now'),
          - '1|M|ago' (should be '1|M'),
          - '1 month ago' (should be '1|M').
        
        Note: Start dates should always be before end dates.
    10. DO NOT include an object or JSON when asking for clarification or providing help. Only include the JSON object when a valid action is identified.
    
    Guidelines:             
    Examples of correct responses (when an action is identified):
    Input: "Visualize the token holdings for wallet 0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee on Ethereum."
    Correct Response:
    {
        "action": "visualize_token_holdings",
        "params": { "walletAddress": "<wallet_address>", "network": "<network>" }
    }

    Incorrect Response (Do NOT return this):
    - "Here is the response: { ... }"
    - "The following action is identified: { ... }"
    - Any additional text before or after the JSON object.

    **Examples of valid EVM-based parameters:**
    - Wallet Address: "0x0B675A788539a8c98EF553a8FD904Cd7036f1Aee" (42 characters, starts with 0x)
    - Transaction Hash: "0x5e3b447b745c3e5cfec6291bc3a564e67d64277cd6b5baeb019604ed34d2c1b1" (66 characters, starts with 0x)
`;

export const POSSIBLE_ACTIONS: Array<
    PossibleActions & {
        example?: string;
        explanation: string;
    }
> = [
    {
        action: 'monitor_wallet',
        params: {
            walletAddress: '<must_be_valid_wallet_address>',
        },
        explanation:
            "Monitor a wallet address for notifications and register it for identification on the user's profile. Only identify this action if there's a valid wallet address. If the wallet address is not valid, ask for clarification.",
        example: 'Add this wallet <wallet_address> to my profile.',
    },
    {
        action: 'retrieve_defi_swaps_history',
        params: {
            walletAddress: '<wallet_address>',
            network: '<network>' as SupportedChain,
            exchange: '<exchange>' as SupportedExchange,
            dateRange: {
                start: '<start_date>',
                end: '<end_date>',
            },
        },
        explanation:
            'Retrieve the DeFi swaps history for a wallet address within a specified date range.',
        example:
            'Fetch swap history for wallet <wallet_address> on <network> from <start_date> to <end_date> on <exchange>',
    },
    {
        action: 'find_transaction',
        params: {
            transactionHash: '<transaction_hash>',
        },
        explanation:
            'Find a transaction by its hash. Be careful not to confuse a wallet address with a transaction hash.',
        example: 'Search for this transaction <transaction_hash>.',
    },
];

export const SYSTEM_PROMPT = 'You are a personal and efficient blockchain query assistant.';

export const MODELS = {
    META_LLAMA_3_70B_INSTRUCT: 'meta/meta-llama-3-70b-instruct',
    META_LLAMA_3_8B_INSTRUCT: 'meta/meta-llama-3-8b-instruct',
} as const;

export const MODEL_TO_USE = MODELS.META_LLAMA_3_8B_INSTRUCT;

export const INPUT_CONFIG = {
    top_k: 50,
    top_p: 0.7,
    max_tokens: 256,
    temperature: 0.4,
    length_penalty: 0.8,
    presence_penalty: 1,
} as const;
