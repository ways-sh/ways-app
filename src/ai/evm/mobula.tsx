import { z } from 'zod';
import { getSonicPrice, getWalletPortfolio } from '@/lib/evm/mobula';
import { MobulaTokenMarketData, MobulaWalletPortfolio } from '@/types/evm/mobula';

export const mobulaTools = {

    walletPortfolio: {
        displayName: '💰 Wallet portfolio',
        description: 'Get the portfolio of a wallet',
        parameters: z.object({
            walletAddress: z.string(),
        }),
        execute: async ({walletAddress} : {walletAddress: string}) => {
            try {
                const portfolio = await getWalletPortfolio(walletAddress)
                return portfolio
            } catch (error) {
                console.error(`walletPortfolio error:`, error)
                throw new Error('Mobula API request failed with unknown error');
            }
        },
        render: (raw: unknown) => {
            const result = raw as MobulaWalletPortfolio;
            return (
                <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                    <div className="flex flex-col gap-3">
                        {result.assets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No assets found</p>
                        ) : (
                            result.assets.map((asset, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <img src={asset.asset.logo || '/placeholder.svg'} alt={asset.asset.name} className="h-6 w-6 rounded-full" />
                                    <p className="text-sm text-muted-foreground">
                                        <b>{asset.asset.name} ({asset.asset.symbol})</b>: {asset.token_balance.toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        },
    },

    sonicPrice: {
        displayName: '💰 Sonic price',
        description: 'Get the price of S (native Sonic or wrapped Sonic)',
        parameters: z.object({
            placeholder: z.string().optional(),
        }),
        execute: async () => {
            try {
                const price = await getSonicPrice()
                return price
            } catch (error) {
                console.error(`sonicPrice error:`, error)
                throw new Error('Mobula API request failed with unknown error');
            }
        },
        render: (raw: unknown) => {
            const result = raw as MobulaTokenMarketData;
            return (
                <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">Sonic price: <b>{result.price.toLocaleString()}</b> $</p>
                    </div>
                </div>
            );
        },
    },
}