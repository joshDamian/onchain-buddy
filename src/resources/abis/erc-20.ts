export const TRANSFER_EVENT_ABI = [
    {
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            { indexed: true, name: 'to', type: 'address' },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
] as const;
