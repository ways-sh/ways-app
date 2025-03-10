import Image from 'next/image';
import { z } from 'zod';
import { ethers } from 'ethers'
import { getCoalQuote, getCoalTransactions, CoalTransactionData, CoalResponseTransactions, CoalResponseQuoteExtended } from '@/lib/evm/coal_ag';
import { retrieveEvmKit } from '@/server/actions/evm-wallet-kit';
import { sendAndConfirmTransaction, getEtherBalance, getTokenBalance, getTokenDecimals, getProvider } from '@/lib/evm/alchemy';
import { TransactionResponse } from 'alchemy-sdk';
import { Card } from '@/components/ui/card';
import { Placeholder } from '@/lib/placeholder';
import { TicketX } from 'lucide-react';

interface EvmSwapParams {
    inputAddress: string;
    outputAddress: string;
    pairAddress: string;
    dexId: string;
    amountIn: number;
    slippage?: number;
    inputSymbol?: string;
    outputSymbol?: string;
}

interface EvmSwapResult {
    success: boolean;
    data?: {
        txs: { tx: TransactionResponse, type: 'swap' | 'approve' }[],
        inputAddress: string;
        outputAddress: string;
        pairAddress: string;
        dexId: string;
        amountIn: string;
        amountOut: string;
        slippage: number;
        inputSymbol?: string;
        outputSymbol?: string;
    };
    error?: string;
}

const SwapResult = ({ result }: { result: EvmSwapResult }) => {
    if (!result.success) {
        return (
            <Card className="bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                    Swap: {result?.error}
                </p>
            </Card>
        );
    }
    return (
        <div className="flex flex-wrap gap-2">
            {result.data?.txs.map((t, index) => (
                <Card key={t.tx.hash} className="bg-muted/50 p-4">
                    <div className="flex-2 min-w-[calc(50%-1rem)] gap-3">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                                <Image
                                    src='/integrations/sonic.jpg'
                                    alt='OK'
                                    className="object-cover"
                                    fill
                                    sizes="40px"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = Placeholder.generate({
                                            width: 40,
                                            height: 40,
                                            text: 'OK',
                                        });
                                    }}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="shrink-0 rounded-md bg-green-700 px-2 py-0.5 text-xs font-medium text-white-foreground">
                                        Transaction: {t.type}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-blue-300 px-2">
                                    <a
                                        href={`https://sonicscan.org/tx/${t.tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        {`${t.tx.hash.slice(0, 6)}...${t.tx.hash.slice(-4)}`}
                                    </a>
                                </div>
                            </div>

                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export const sonicTools = {
    swapTokens: {
        displayName: '🪙 Swap Tokens',
        description: 'Swap tokens with the embedded wallet.',
        //description: 'Swap tokens using Shadow X with the embedded wallet',
        parameters: z.object({
            requiresConfirmation: z.boolean().optional().default(false),
            inputAddress: z.string().describe('Source token address'),
            outputAddress: z.string().describe('Target token address'),
            pairAddress: z.string().describe('Pair address'),
            dexId: z.string().describe('dexID'),
            amountIn: z.number().positive().describe('Amount to swap'),
            slippage: z
                .number()
                .min(0)
                .max(10000)
                .optional()
                .describe('Slippage tolerance in basis points (0-1000)'),
            inputSymbol: z.string().describe('Source token Symbol').default(''),
            outputSymbol: z.string().describe('Target token Symbol').default(''),
        }),
        execute: async function ({
            inputAddress,
            outputAddress,
            pairAddress,
            dexId,
            amountIn,
            slippage = 100,
            inputSymbol,
            outputSymbol,
        }: EvmSwapParams): Promise<EvmSwapResult | any> {
            console.log('[swapTokens] inputToken', inputAddress);
            console.log('[swapTokens] outputToken', outputAddress);
            //console.log('[swapTokens] pairAddress', pairAddress);
            console.log('[swapTokens] dexId', dexId);
            console.log('[swapTokens] amountIn', amountIn);
            // console.log('[swapTokens] slippage', slippage);

            const quote = await getCoalQuote(inputAddress, outputAddress, amountIn.toString());
            if (!quote) {
                return {
                    success: false,
                    error: 'Failed to fetch quotes',
                }
            }

            const wallet = (await retrieveEvmKit(undefined))?.data?.data?.data?.walletAdapter;
            if (!wallet) {
                return {
                    success: false,
                    error: 'Failed to retrieve wallet adapter',
                }
            }

            //Check if wallet has > 0.1 S balance
            const balance = await getEtherBalance(wallet.address());
            if (balance < 0.1) {
                return {
                    success: false,
                    error: 'Insufficient balance',
                }
            }

            const transactions = await getCoalTransactions(quote.quoteData, wallet.address(), quote.isNativeSwap, slippage, 25, wallet.address());
            if (!transactions) {
                return {
                    success: false,
                    error: 'Failed to build transactions',
                }
            }

            console.log('transactions:', transactions);

            const txs: { tx: TransactionResponse, type: 'swap' | 'approve' }[] = [];

            // Approve
            if (transactions.additionalTransactions && transactions.additionalTransactions.length > 0) {
                for (const tx of transactions.additionalTransactions) {
                    try {
                        console.log('signing approve tx', tx);
                        const signedTx = await wallet.signTransaction(tx);
                        console.log('sending approve tx', tx);
                        const txData = await sendAndConfirmTransaction(signedTx);
                        if (txData) {
                            txs.push({ tx: txData, type: 'approve' });
                        }
                    } catch (error) {
                        console.error('Error signing /sending approve tx', error);
                        return {
                            success: false,
                            error: 'Failed to sign / send approve tx',
                        }
                    }
                }
            }

            // Swap
            console.log('signing main transaction', transactions.transactionData);
            const signedTx = await wallet.signTransaction(transactions.transactionData);
            console.log('signedTx:', signedTx);
            if (!signedTx) {
                return {
                    success: false,
                    error: 'Failed to sign main transaction',
                }
            }
            const txData = await sendAndConfirmTransaction(signedTx);
            if (txData) {
                txs.push({ tx: txData, type: 'swap' });
            }

            return {
                success: true,
                data: {
                    txs,
                    inputAddress,
                    outputAddress,
                    pairAddress,
                    dexId,
                    amountIn,
                    amountOut: quote.amountOutNative,
                    slippage,
                    inputSymbol,
                    outputSymbol,
                },
            };
        },
        render: (raw: unknown) => {
            const result = raw as EvmSwapResult;
            return <SwapResult result={result} />
            // return (
            // <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
            //     {result.data?.txs.map((tx) => (
            //         <div className="flex flex-col gap-3">
            //             <p className="text-sm text-muted-foreground">Transaction: https://sonicscan.org/tx/{tx.tx.hash}</p>
            //             <p className="text-sm text-muted-foreground">Type: {tx.type}</p>
            //         </div>
            //     ))}
            //     <div className="flex flex-col gap-3">
            //         <p className="text-sm text-muted-foreground">Input Address: {result.data?.inputAddress}</p>
            //         <p className="text-sm text-muted-foreground">Output Address: {result.data?.outputAddress}</p>
            //         <p className="text-sm text-muted-foreground">Pair Address: {result.data?.pairAddress}</p>
            //         <p className="text-sm text-muted-foreground">dexId: {result.data?.dexId}</p>
            //         <p className="text-sm text-muted-foreground">Amount In: {result.data?.amountIn}</p>
            //         <p className="text-sm text-muted-foreground">Amount Out: {result.data?.amountOut}</p>
            //     </div>
            // </div>
            //)
        },
    },


    sonicBalance: {
        displayName: '💰 Sonic Balance',
        description: 'Get the balance of a wallet in Sonic (native currency)',
        parameters: z.object({
            walletAddress: z.string().describe('The wallet address to get the balance of'),
        }),
        execute: async ({ walletAddress }: { walletAddress: string }) => {
            console.log(`sonicBalance walletAddress:`, walletAddress)
            try {
                const balance = await getEtherBalance(walletAddress)
                return balance
            } catch (error) {
                console.error(`sonicBalance error:`, error)
                throw new Error('Sonic API request failed with unknown error');
            }
        },
        render: (raw: unknown) => {
            const result = raw as number;
            return (
                <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">Balance: {result.toLocaleString()} S</p>
                    </div>
                </div>
            );
        },
    },

    tokenBalance: {
        displayName: '💰 Token Balance',
        description: 'Get token balance of a wallet by token contract address',
        parameters: z.object({
            walletAddress: z.string().describe('The wallet address to get the balance of'),
            tokenAddress: z.string().describe('The token contract address to get the balance of'),
        }),
        execute: async ({ walletAddress, tokenAddress }: { walletAddress: string, tokenAddress: string }) => {

            try {
                const balance = await getTokenBalance(walletAddress, tokenAddress)
                const decimals = await getTokenDecimals(tokenAddress)
                console.log(balance, decimals)
                //format the balance to the number of decimals
                //const formattedBalance = balance / (10 ** decimals)
                //return formattedBalance
                return ethers.utils.formatUnits(balance, decimals)
            } catch (error) {
                console.error(`tokenBalance error:`, error)
                throw new Error('Alchemy API request failed with unknown error');
            }
        },
        render: (raw: unknown) => {
            const result = raw as number;
            return (
                <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">Balance: {result.toLocaleString()}</p>
                    </div>
                </div>
            );
        },
    },

}
