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
