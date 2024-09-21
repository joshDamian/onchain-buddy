import { formatEther, TransactionReceipt } from 'viem';

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
    explorerUrl: string
): string {
    return `🧾 *Transaction Receipt:*\n\n🔗 *Transaction Hash:* ${receipt.transactionHash}\n\n📅 *Block Number:* ${receipt.blockNumber}\n\n🔢 *Gas Used:* ${receipt.gasUsed}\n\n🔢 *Gas Price:* ${formatEther(receipt.gasUsed)}\n\n🔢 *Cumulative Gas Used:* ${receipt.cumulativeGasUsed}\n\n🔢 *Status:* ${receipt.status}\n\nView in explorer: ${explorerUrl}`;
}
