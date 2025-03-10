export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
}

export interface TransactionData {
    buys: number;
    sells: number;
}

export interface Transactions {
    m5: TransactionData;
    h1: TransactionData;
    h6: TransactionData;
    h24: TransactionData;
}

export interface VolumeData {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
}

export interface PriceChangeData {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
}

export interface LiquidityData {
    usd: number;
    base: number;
    quote: number;
}

export interface Social {
    type: string;
    url: string;
}

export interface Website {
    label: string;
    url: string;
}

export interface PairInfo {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Website[];
    socials?: Social[];
}

export interface DexPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: TokenInfo;
    quoteToken: TokenInfo;
    priceNative: string;
    priceUsd: string;
    txns: Transactions;
    volume: VolumeData;
    priceChange: PriceChangeData;
    liquidity: LiquidityData;
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    info?: PairInfo;
}

export interface DexScreenerError {
    code: string;
    message: string;
}