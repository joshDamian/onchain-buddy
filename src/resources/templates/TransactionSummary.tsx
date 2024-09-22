import React, { CSSProperties } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, XCircle, Send, Download, ChevronRight, ChevronDown } from 'react-feather'; // Using ChevronRight for a cleaner arrow

type TransactionSummaryProps = {
    transactionHash: string;
    network: string;
    title: string;
    blockHeight: string;
    from: string;
    to: string;
    amount: string;
    transactionFee: string;
    status: string;
    explorerUrl: string;
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
                <h1 className={'text-center text-[#360033] font-bold mb-5 text-3xl'}>
                    {props.title}
                </h1>

                <section className={'flex flex-col divide-y divide-[#0b8793]'}>
                    {/* Transaction Info Section */}
                    <div className={'flex flex-col pb-6 gap-6'}>
                        <div className={'flex w-fit mx-auto items-center justify-between'}>
                            <span className={'text-sm text-center text-[#0b8793]'}>
                                🆔 {props.transactionHash}
                            </span>
                        </div>

                        <div className={'flex items-center justify-between'}>
                            <span className={'font-medium'}>Chain:</span>
                            <span>{props.network}</span>
                        </div>

                        <div className={'flex items-center justify-between'}>
                            <span className={'font-medium'}>Amount:</span>
                            <span>{props.amount}</span>
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

                    <div className={'flex items-center py-6 justify-between'}>
                        <span className={'font-medium'}>Transaction Fee:</span>
                        <span>{truncateText(props.transactionFee)}</span>
                    </div>

                    {/* QR Code for Explorer */}
                    <div className={'flex flex-col gap-5 pt-6 items-center justify-center'}>
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
