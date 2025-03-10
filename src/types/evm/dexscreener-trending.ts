interface Token {
  Error?:string;
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  priceNative: string;
  priceUsd: string;
  txns: Transactions;
  volume: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: TokenInfoDetails;
  boosts?: Boosts;
}

export interface DexTrendingTokenFormatted {
  token: TokenInfo;
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  priceNative: string;
  priceUsd: string;
  txns: Transactions;
  volume: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: TokenInfoDetails;
  boosts?: Boosts;
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

interface Transactions {
  m5: TransactionDetails;
  h1: TransactionDetails;
  h6: TransactionDetails;
  h24: TransactionDetails;
}

interface TransactionDetails {
  buys: number;
  sells: number;
}

interface Volume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

interface PriceChange {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

interface TokenInfoDetails {
  imageUrl: string;
  header: string;
  openGraph: string;
  websites: Website[];
  socials: Social[];
}

interface Website {
  label: string;
  url: string;
}

interface Social {
  type: string;
  url: string;
}

interface Boosts {
  active: number;
}

export interface DexScreenerTrendingApiResponse {
  last_updated: string;
  tokens: Token[];
}