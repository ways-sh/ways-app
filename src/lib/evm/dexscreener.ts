const DEXSCREENER_API_URL = 'https://api.dexscreener.com';
const SOLANA_CHAIN_ID = 'sonic';

import { DexPair } from "@/types/evm/dexscreener";

export async function searchTokenByName(query: string): Promise<DexPair[]> {
  console.log('searchToken query:', query);
  const tokens = await searchPairs(query + '/wS'); //max 10 tokens
  console.log('searchToken result [0]:', tokens[0]); //result[0]

  // Search and rank tokens
  const searchQuery = query.toLowerCase();
  const results = tokens
    .filter(
      (token) =>
        token.baseToken.name.toLowerCase().includes(searchQuery) ||
        token.baseToken.symbol.toLowerCase().includes(searchQuery) ||
        token.quoteToken.name.toLowerCase().includes(searchQuery) ||
        token.quoteToken.symbol.toLowerCase().includes(searchQuery)
    )
    .sort((a, b) => {
      // Exact matches first
      const aExact =
        a.baseToken.symbol.toLowerCase() === searchQuery ||
        a.baseToken.name.toLowerCase() === searchQuery ||
        a.quoteToken.symbol.toLowerCase() === searchQuery ||
        a.quoteToken.name.toLowerCase() === searchQuery;
      const bExact =
        b.baseToken.symbol.toLowerCase() === searchQuery ||
        b.baseToken.name.toLowerCase() === searchQuery ||
        b.quoteToken.symbol.toLowerCase() === searchQuery ||
        b.quoteToken.name.toLowerCase() === searchQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    })
    .slice(0, 1);

  return results
}

/**
 * Search for trading pairs on DEX platforms
 * @param query - Search query (token symbol, name, or address)
 * @param limit - Maximum number of results to return
 * @returns Promise with array of trading pairs or empty array if none found
 */
export async function searchPairs(
  query: string,
  limit: number = 10,
): Promise<DexPair[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API_URL}/latest/dex/search?q=${query}&limit=${limit}`,
      { next: { revalidate: 30 } },
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.statusText}`);
    }

    const data = await response.json();
    const pairs = data.pairs as DexPair[];

    if (!Array.isArray(pairs)) {
      return [];
    }

    return pairs
      .filter((p) => p.chainId === SOLANA_CHAIN_ID)
      .sort((a, b) => b.volume.h24 - a.volume.h24)
      .slice(0, limit);
  } catch (error) {
    console.error('DexScreener search error:', error);
    return [];
  }

}


