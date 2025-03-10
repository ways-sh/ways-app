export interface MobulaTokenMarketData {
    id: string | null;
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    rank: number | null;
    price: number;
    market_cap: number;
    market_cap_diluted: number;
    volume: number;
    volume_change_24h: number | null;
    volume_7d: number | null;
    liquidity: number;
    ath: number | null;
    atl: number | null;
    off_chain_volume: number | null;
    is_listed: boolean;
    price_change_1h: number;
    price_change_24h: number;
    price_change_7d: number;
    price_change_1m: number;
    price_change_1y: number;
    total_supply: number;
    circulating_supply: number;
    contracts: Contract[];
    native: NativeToken;
    priceNative: number;
}

interface Contract {
    address: string;
    blockchainId: string;
    blockchain: string;
    decimals: number;
}

interface NativeToken {
    name: string;
    symbol: string;
    address: string;
    type: string;
    decimals: number;
    logo: string;
}

// --- Wallet Portfolio ---

export interface MobulaWalletPortfolio {
    total_wallet_balance: number;
    wallets: string[];
    assets: Asset[];
    balances_length: number;
}

interface Asset {
    asset: AssetDetails;
    price: number;
    allocation: number;
    price_change_24h: number;
    token_balance: number;
    estimated_balance: number;
    cross_chain_balances: Record<string, CrossChainBalance>;
    contracts_balances: ContractBalance[];
}

interface AssetDetails {
    id: number;
    name: string;
    symbol: string;
    logo: string;
    contracts: string[];
    decimals: number[];
    blockchains: string[];
}

interface CrossChainBalance {
    balance: number;
    chainId: string;
    address: string;
    balanceRaw: string;
}

interface ContractBalance {
    balance: number;
    balanceRaw: string;
    chainId: string;
    address: string;
    decimals: number;
}
