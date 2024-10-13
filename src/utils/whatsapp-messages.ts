import { formatEther, Transaction, TransactionReceipt } from 'viem';
import { SupportedChain } from '@/app/schema';
import OnchainAnalyticsLibrary from '@/app/OnchainBuddy/OnchainAnalyticsLibrary';
import { prettifyNumber } from '@/utils/number-formatting';

export function generateReceivedTokenMessage(params: {
    tokenAmount: string;
    assetName: string;
    assetNetwork: string;
    senderAddress: string;
    transactionHash: string;
    explorerUrl: string;
    concernedWalletAddress: string;
}): string {
    const {
        tokenAmount,
        assetName,
        assetNetwork,
        transactionHash,
        explorerUrl,
        senderAddress,
        concernedWalletAddress,
    } = params;

    return `🔔 Crypto Deposit Notification.\n\n*Wallet:* ${concernedWalletAddress}\n\n🧾 *Summary:*\nReceived *${prettifyNumber(Number(tokenAmount))} ${assetName}* on *${assetNetwork}* from ${senderAddress}\n\n➡️ *Transaction Hash:* ${transactionHash}\n\n🔍 *View In Explorer:* ${explorerUrl}`;
}

export function generateSentTokenMessage(params: {
    tokenAmount: string;
    assetName: string;
    assetNetwork: string;
    receiverAddress: string;
    transactionHash: string;
    explorerUrl: string;
    concernedWalletAddress: string;
}): string {
    const {
        tokenAmount,
        assetName,
        assetNetwork,
        transactionHash,
        explorerUrl,
        receiverAddress,
        concernedWalletAddress,
    } = params;

    return `🔔 Crypto Withdrawal Notification.\n\n*Wallet:* ${concernedWalletAddress}\n\n🧾 *Summary:*\nSent *${prettifyNumber(Number(tokenAmount))} ${assetName}* on *${assetNetwork}* to ${receiverAddress}\n\n➡️ *Transaction Hash:* ${transactionHash}\n\n🔍 *View In Explorer:* ${explorerUrl}`;
}

function isUserSender(address: string, userWalletAddresses: string[]): boolean {
    return userWalletAddresses.includes(address);
}

function isUserReceiver(address: string, userWalletAddresses: string[]): boolean {
    return userWalletAddresses.includes(address);
}

function isUserTransferringBetweenWallets(
    from: string,
    to: string,
    userWalletAddresses: string[]
): boolean {
    return isUserSender(from, userWalletAddresses) && isUserReceiver(to, userWalletAddresses);
}

function buildTransactionSummaryTitle(
    status: string,
    action: string,
    amount: string,
    symbol: string,
    isUserWallet: boolean
): string {
    return status === 'success'
        ? `🔔 ${isUserWallet ? 'You' : ''} ${action} ${amount} ${symbol}`
        : `🔔 Failed to ${action} ${amount} ${symbol}`;
}

function buildTransactionActivitySummary(
    from: string,
    to: string,
    userWalletAddresses: string[]
): string {
    const fromText = isUserSender(from, userWalletAddresses) ? `${from} (✅ Your Wallet)` : from;
    const toText = isUserReceiver(to, userWalletAddresses) ? `${to} (✅ Your Wallet)` : to;
    return `🔗 *From:* ${fromText}\n🔗 *To:* ${toText}`;
}

export function generateTransactionReceiptMessage(params: {
    receipt: TransactionReceipt;
    chain: SupportedChain;
    nativeCurrencySymbol: string;
    decodedTokenTransfers: Awaited<ReturnType<typeof OnchainAnalyticsLibrary.decodeTokenTransfers>>;
    transaction: Transaction;
    userWalletAddresses: string[];
}): string {
    const {
        receipt,
        nativeCurrencySymbol,
        userWalletAddresses,
        decodedTokenTransfers,
        transaction,
    } = params;

    let transactionSummaryTitle: string;
    let transactionActivitySummary: string;

    const transactionStatus = receipt.status === 'success' ? '✅ Success' : '❌ Failed';

    // Handle token transfers
    if (decodedTokenTransfers.length > 0) {
        const userConcernedTransfers = decodedTokenTransfers.filter(
            (transfer) =>
                userWalletAddresses.includes(transfer.to) ||
                userWalletAddresses.includes(transfer.from)
        );

        const targetTransfer = userConcernedTransfers[0] ?? decodedTokenTransfers[0];

        const { from, to, formattedAmount, tokenMetadata } = targetTransfer;
        const action = isUserReceiver(to, userWalletAddresses) ? 'received' : 'sent';

        if (isUserTransferringBetweenWallets(from, to, userWalletAddresses)) {
            transactionSummaryTitle = buildTransactionSummaryTitle(
                receipt.status,
                'moved',
                prettifyNumber(Number(formattedAmount)),
                tokenMetadata.symbol,
                userConcernedTransfers.length > 0
            );
        } else {
            transactionSummaryTitle = buildTransactionSummaryTitle(
                receipt.status,
                action,
                prettifyNumber(Number(formattedAmount)),
                tokenMetadata.symbol,
                userConcernedTransfers.length > 0
            );
        }

        transactionActivitySummary = buildTransactionActivitySummary(from, to, userWalletAddresses);
    } else {
        // Handle native currency transfers (when no token transfers are detected)
        const amount = prettifyNumber(Number(formatEther(transaction.value)));
        if (isUserTransferringBetweenWallets(receipt.from, receipt.to ?? '', userWalletAddresses)) {
            transactionSummaryTitle = buildTransactionSummaryTitle(
                receipt.status,
                'moved',
                amount,
                nativeCurrencySymbol,
                true
            );
        } else {
            const action = isUserReceiver(receipt.to ?? '', userWalletAddresses)
                ? 'received'
                : 'sent';
            transactionSummaryTitle = buildTransactionSummaryTitle(
                receipt.status,
                action,
                amount,
                nativeCurrencySymbol,
                isUserSender(receipt.from, userWalletAddresses) ||
                    isUserReceiver(receipt.to ?? '', userWalletAddresses)
            );
        }

        transactionActivitySummary = buildTransactionActivitySummary(
            receipt.from,
            receipt.to ?? '',
            userWalletAddresses
        );
    }

    const transactionFee = `${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ${nativeCurrencySymbol}`;

    return (
        `🧾 *Transaction Summary: ${transactionStatus}*\n\n` +
        `📅 *Block Number:* ${receipt.blockNumber}\n\n` +
        `🔢 *Transaction Fee:* ${transactionFee}\n\n` +
        `*--- ${transactionSummaryTitle} ---*\n\n` +
        `${transactionActivitySummary}\n\n` +
        `💬 *Status*: Transaction ${receipt.status === 'success' ? 'Successful' : 'Failed'}\n\n` +
        `_Generating transaction receipt..._`
    );
}
