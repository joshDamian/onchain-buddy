import {
    queryUniswapSwapHistorySchema,
    SwapHistoryInput,
    SwapSummary,
    UniswapSwapHistory,
} from '@/app/Subgraphs/schema';
import { getUniswapSubgraphIdByNetwork, SUBGRAPH_BASE_URL } from '@/app/Subgraphs/config';
import { gql } from '@urql/core';
import { querySubgraph } from '@/utils/subgraphs';
import logger from '@/resources/logger';
import env from '@/constants/env';
import { z } from 'zod';
import ExcelJS from 'exceljs';
import { uploadFile } from '@/utils/ipfs-upload';
import crypto from 'node:crypto';

class UniswapSwapHistoryQuery {
    private static readonly SUBGRAPH_BASE_URL = SUBGRAPH_BASE_URL;
    private static readonly SUBGRAPH_API_KEY = env.THE_GRAPH_API_KEY;

    public static async getSwapHistory(input: SwapHistoryInput) {
        const { sender, dateRange, network } = input;

        const subgraphId = getUniswapSubgraphIdByNetwork(network);

        const [start, end] = [dateRange.start, dateRange.end];

        const query = gql<{
            swaps: UniswapSwapHistory[];
        }>`
            {
                swaps(
                    where: {
                        or: [
                            {
                                recipient: "${sender.toLowerCase()}", 
                                timestamp_gte: "${start}", 
                                timestamp_lte: "${end}"
                            },
                            {
                                sender: "${sender.toLowerCase()}", 
                                timestamp_gte: "${start}", 
                                timestamp_lte: "${end}"
                            }
                        ]
                    }
                ) {
                    sender
                    recipient
                    amountUSD
                    amount0
                    amount1
                    id
                    token0 {
                        decimals
                        id
                        name
                        symbol
                    }
                    timestamp
                    token1 {
                        id
                        name
                        symbol
                        decimals
                    }
                    transaction {
                        id
                        timestamp
                    }
                }
            }
        `;

        const response = await querySubgraph({
            subgraphBaseUrl: this.SUBGRAPH_BASE_URL,
            subgraphId,
            query,
            subgraphApiKey: this.SUBGRAPH_API_KEY,
        });

        if (response.error) {
            void logger.error(`Error getting swaps for params:`, {
                params: input,
                error: response.error,
            });

            return null;
        }

        if (!response.data?.swaps) {
            return null;
        }

        return z.array(queryUniswapSwapHistorySchema).parse(response.data.swaps);
    }

    public static extractSwapSummary(
        swaps: UniswapSwapHistory[],
        startTimestamp: number,
        endTimestamp: number
    ): SwapSummary {
        if (!swaps.length) {
            return {
                totalSwaps: 0,
                totalVolumeUSD: 0,
                largestSwap: 0,
                smallestSwap: 0,
                mostSwappedTokens: {},
                volumeTrend: 0,
            };
        }

        let totalVolumeUSD = 0;
        let largestSwap = 0;
        let smallestSwap = Infinity;
        const tokenSwapCounts: Record<string, number> = {};

        // Calculate time slicing for volume trend comparison
        const midPointTimestamp = (startTimestamp + endTimestamp) / 2;

        let firstPeriodVolume = 0;
        let secondPeriodVolume = 0;

        swaps.forEach((swap) => {
            const amountUSD = swap.amountUSD;
            const swapTimestamp = parseInt(swap.timestamp, 10);

            // Aggregate the total USD volume
            totalVolumeUSD += amountUSD;

            // Track the largest and smallest swaps in terms of USD value
            largestSwap = Math.max(largestSwap, amountUSD);
            smallestSwap = Math.min(smallestSwap, amountUSD);

            // Count swaps per token for both token0 and token1
            const token0 = swap.token0.symbol;
            const token1 = swap.token1.symbol;

            tokenSwapCounts[token0] = (tokenSwapCounts[token0] || 0) + 1;
            tokenSwapCounts[token1] = (tokenSwapCounts[token1] || 0) + 1;

            // Divide swaps into two periods based on timestamp
            if (swapTimestamp <= midPointTimestamp) {
                firstPeriodVolume += amountUSD;
            } else {
                secondPeriodVolume += amountUSD;
            }
        });

        // Calculate the volume trend (percentage change between the two periods)
        let volumeTrend = 0;
        if (firstPeriodVolume > 0) {
            volumeTrend = ((secondPeriodVolume - firstPeriodVolume) / firstPeriodVolume) * 100;
        }

        const sortedTokenSwapEntries = Object.entries(tokenSwapCounts).sort(
            ([, countA], [, countB]) => countB - countA
        );
        const sortedTokenSwapCounts = Object.fromEntries(sortedTokenSwapEntries);

        return {
            totalSwaps: swaps.length,
            totalVolumeUSD: totalVolumeUSD,
            largestSwap: largestSwap,
            smallestSwap: smallestSwap === Infinity ? 0 : smallestSwap,
            mostSwappedTokens: sortedTokenSwapCounts,
            volumeTrend: Math.round(volumeTrend), // round to integer
        };
    }

    public static async exportSwapHistoryToExcel(swaps: UniswapSwapHistory[]) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Swaps History');

        const centeredColumnStyle = {
            alignment: { vertical: 'middle', horizontal: 'center' },
        } satisfies Partial<ExcelJS.Style>;

        // Define columns for the worksheet
        worksheet.columns = [
            {
                header: 'Swap ID',
                key: 'swapId',
                width: 85,
                style: {
                    ...centeredColumnStyle,
                    font: {
                        color: { argb: 'FF0000FF' },
                    },
                },
            },
            { header: 'Sender', key: 'sender', width: 50, style: centeredColumnStyle },
            { header: 'Recipient', key: 'recipient', width: 50, style: centeredColumnStyle },
            { header: 'Token 0 Name', key: 'token0Name', width: 30, style: centeredColumnStyle },
            {
                header: 'Token 0 Symbol',
                key: 'token0Symbol',
                width: 25,
                style: centeredColumnStyle,
            },
            { header: 'Token 1 Name', key: 'token1Name', width: 30, style: centeredColumnStyle },
            {
                header: 'Token 1 Symbol',
                key: 'token1Symbol',
                width: 20,
                style: centeredColumnStyle,
            },
            { header: 'Amount 0', key: 'amount0', width: 30, style: centeredColumnStyle },
            { header: 'Amount 1', key: 'amount1', width: 30, style: centeredColumnStyle },
            { header: 'Amount USD', key: 'amountUSD', width: 30, style: centeredColumnStyle },
            { header: 'Date', key: 'date', width: 25, style: centeredColumnStyle },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).height = 25;

        // Add rows to the worksheet
        swaps.forEach((swap) => {
            worksheet.addRow({
                swapId: swap.id,
                sender: swap.sender,
                recipient: swap.recipient,
                token0Name: swap.token0.name,
                token0Symbol: swap.token0.symbol,
                token1Name: swap.token1.name,
                token1Symbol: swap.token1.symbol,
                amount0: swap.amount0,
                amount1: swap.amount1,
                amountUSD: swap.amountUSD,
                date: new Date(Number(swap.timestamp) * 1000).toDateString(), // Convert UNIX to readable timestamp
            }).height = 28;
        });

        const concatenatedSwapIds = swaps.map((swap) => swap.id).join('');

        const hash = crypto.createHash('sha256');
        const relevantHashPart = hash.update(concatenatedSwapIds).digest('base64').slice(0, 32);
        const fileName = `swaps-history-${relevantHashPart}.xlsx`;

        // Upload the workbook and get a fileUrl
        const buffer = await workbook.xlsx.writeBuffer();

        return await uploadFile(new File([buffer], fileName));
    }
}

export default UniswapSwapHistoryQuery;
