import { formatEther, TransactionReceipt } from 'viem';
import { SupportedChain } from '@/app/types';

export function generateReceivedTokenMessage(params: {
    tokenAmount: string;
    assetName: string;
    assetNetwork: string;
    senderAddress: string;
    transactionHash: string;
    explorerUrl: string;
}): string {
    const { tokenAmount, assetName, assetNetwork, transactionHash, explorerUrl, senderAddress } =
        params;

    return `🔔 Crypto Deposit Notification.\n\n🧾 *Summary:*\nReceived *${tokenAmount} ${assetName}* on *${assetNetwork}* from ${senderAddress}\n\n➡️ *Transaction Hash:* ${transactionHash}\n\n🔍 *View In Explorer:* ${explorerUrl}`;
}

export function generateSentTokenMessage(params: {
    tokenAmount: string;
    assetName: string;
    assetNetwork: string;
    receiverAddress: string;
    transactionHash: string;
    explorerUrl: string;
}): string {
    const { tokenAmount, assetName, assetNetwork, transactionHash, explorerUrl, receiverAddress } =
        params;

    return `🔔 Crypto Withdrawal Notification.\n\n🧾 *Summary:*\nSent *${tokenAmount} ${assetName}* on *${assetNetwork}* to ${receiverAddress}\n\n➡️ *Transaction Hash:* ${transactionHash}\n\n🔍 *View In Explorer:* ${explorerUrl}`;
}

export function generateTransactionReceiptMessage(
    receipt: TransactionReceipt,
    chain: SupportedChain,
    nativeCurrencySymbol: string
): string {
    return `🧾 *Transaction Found on ${chain}*\n\n📅 *Block Number:* ${receipt.blockNumber}\n\n🔢 *Gas Used:* ${receipt.gasUsed}\n\n🔢 *Transaction Fee:* ${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ${nativeCurrencySymbol}\n\n🔲 *Status:* ${receipt.status}\n\n_Please wait while the bot summarizes the transaction_`;
}
