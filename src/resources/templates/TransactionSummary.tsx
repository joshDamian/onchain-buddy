import React, { CSSProperties } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, XCircle, Send, Download } from 'react-feather';

type Erc20Transfers = {
    formattedAmount: string;
    tokenMetadata: { symbol: string; name: string; id: string; decimals: number } | null;
    from: `0x${string}`;
    to: `0x${string}`;
    amount: bigint;
    tokenAddress: `0x${string}`;
};

type TransactionSummaryProps = {
    transactionHash: string;
    network: string;
    title: string;
    blockHeight: string;
    from: string;
    to: string;
    value: string;
    transactionFee: string;
    status: string;
    explorerUrl: string;
    erc20Transfers: Array<Erc20Transfers>;
};

const TransactionSummary: React.FC<TransactionSummaryProps> = (props) => {
    // Determine status icon based on transaction status
    const statusIcon =
        props.status.toLowerCase() === 'success' ? (
            <CheckCircle color="#28a745" size={24} />
        ) : (
            <XCircle color="#dc3545" size={24} />
        );

    return (
        <div className={'m-0 p-8'} style={styles.container}>
            <div className={'bg-white shadow-lg h-full px-12 py-10 rounded-3xl'}>
                <h1 className={'text-center font-semibold mb-3 text-3xl'}>{props.title}</h1>
                <div className={'flex w-fit mx-auto mb-6 items-center justify-center'}>
                    <span className={'text-sm text-center text-[#0b8793]'}>
                        {props.transactionHash}
                    </span>
                </div>

                <section className={'flex flex-col divide-y-[0.5px] divide-[#0b8793]'}>
                    {/* Transaction Info Section */}
                    <div className={'flex flex-col pb-5 gap-5'}>
                        <h3 className={'font-semibold border-t-[0.5px] pt-5 border-[#0b8793]'}>
                            Transaction Info
                        </h3>
                        <div className={'flex flex-col gap-6'}>
                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Chain:</span>
                                <span>{props.network}</span>
                            </div>

                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Value:</span>
                                <span>{props.value}</span>
                            </div>

                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Status:</span>
                                <span className={'flex items-center gap-2.5'}>
                                    {statusIcon}
                                    {props.status}
                                </span>
                            </div>

                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Block Height:</span>
                                <span>{props.blockHeight}</span>
                            </div>
                            <div className={'flex items-center justify-between'}>
                                <span className={'font-medium'}>Transaction Fee:</span>
                                <span>{props.transactionFee}</span>
                            </div>
                            <div className={'flex items-center justify-between'}>
                                <div className={'flex items-center gap-2.5'}>
                                    <Send size={20} color="#ff8800" />
                                    <p className={'font-medium'}>Sender:</p>
                                </div>
                                <p>{props.from}</p>
                            </div>
                            <div className={'flex items-center justify-between'}>
                                <div className={'flex items-center gap-2.5'}>
                                    <Download size={20} color="#00cc99" />
                                    <p className={'font-medium'}>Receiver:</p>
                                </div>
                                <p>{props.to}</p>
                            </div>
                        </div>
                    </div>

                    {props.erc20Transfers.length > 0 ? (
                        <div className={'flex flex-col gap-5 py-5 justify-between'}>
                            <h3 className={'font-semibold'}>Asset Transfer Summary (ERC20)</h3>
                            <section className={'grid grid-cols-2 gap-3'}>
                                {props.erc20Transfers.map((transfer, index) => (
                                    <div key={index}>
                                        <div
                                            className={
                                                'p-3 text-xs font-semibold border text-[#0b8793] border-[0.5px] text-center'
                                            }
                                        >
                                            {transfer.formattedAmount}{' '}
                                            {transfer.tokenMetadata?.symbol}
                                        </div>
                                        <div
                                            className={
                                                'p-3 border-b border-x border-[0.5px] text-[10px] flex flex-col gap-2'
                                            }
                                        >
                                            <span className={'flex items-center gap-1'}>
                                                <span
                                                    className={
                                                        'bg-red-400 text-[9px] text-white rounded-[100px] px-1 py-[1px]'
                                                    }
                                                >
                                                    From
                                                </span>

                                                <span>{transfer.from}</span>
                                            </span>
                                            <span className={'flex items-center gap-1'}>
                                                <span
                                                    className={
                                                        'bg-green-400 text-[9px] text-white rounded-[100px] px-1 py-[1px]'
                                                    }
                                                >
                                                    To
                                                </span>

                                                <span>{transfer.to}</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    ) : null}

                    {/* QR Code for Explorer */}
                    <div className={'flex flex-col gap-5 pt-5 items-center justify-center'}>
                        <QRCodeSVG value={props.explorerUrl} fgColor={'#0b8793'} size={128} />
                        <p className={'text-center'}>Scan to view on Explorer</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

// Function to truncate long text with ellipsis for better layout
const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// CSS Styles
const styles: Record<string, CSSProperties> = {
    container: {
        fontFamily: 'Verdana, sans-serif',
        background: 'linear-gradient(to right, #0b8793, #360033)',
        boxSizing: 'border-box',
        height: 'fit-content',
    },
};

export default TransactionSummary;
