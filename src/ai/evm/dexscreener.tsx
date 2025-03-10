import Image from 'next/image';

import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { capitalize } from '@/lib/utils/format';

import { Placeholder } from '@/lib/placeholder';
import { searchPairs, searchTokenByName } from '@/lib/evm/dexscreener';
import { DexPair } from '@/types/evm/dexscreener';
import { DexScreenerTrendingApiResponse, DexTrendingTokenFormatted } from '@/types/evm/dexscreener-trending';

// Types
interface DexScreenerOrder {
  type: 'tokenProfile' | 'communityTakeover' | 'tokenAd' | 'trendingBarAd';
  status: 'processing' | 'cancelled' | 'on-hold' | 'approved' | 'rejected';
  paymentTimestamp: number;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
  boosts?: {
    active: number;
  };
}

interface DexScreenerPairResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

// Types for Token Profiles
interface DexScreenerTokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: DexScreenerTokenProfileLink[];
}

interface DexScreenerTokenProfileLink {
  type?: string;
  label?: string;
  url: string;
}

// Types
interface JinaWebReaderResponse {
  content: string;
  url: string;
}

// Components
const TrendingTokensContent = ({
  content,
  className,
}: {
  content: DexTrendingTokenFormatted[];
  className?: string;
}) => {
  //console.log('TrendingTokensContent content:', content);
  return (

      <div className="flex flex-wrap gap-3">
        {content.map((token) => (
          <div key={token.token.address} className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
            <div className="flex-2 min-w-[calc(50%-1rem)] gap-3">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={
                      token.info?.imageUrl ||
                      Placeholder.generate({ width: 40, height: 40, text: 'Token' })
                    }
                    alt={token.token.name}
                    className="object-cover"
                    fill
                    sizes="40px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = Placeholder.generate({
                        width: 40,
                        height: 40,
                        text: token.token.symbol,
                      });
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-medium">{token.token.name}</h2>
                    <span className="shrink-0 rounded-md bg-background/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {token.token.symbol}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="font-mono">
                      {/* {token.token.address.slice(0, 4)}...{token.token.address.slice(-4)} */}
                      <strong>Volume:</strong> {Math.floor(token.volume.h24).toLocaleString()}$
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          // <div key={token.token.address}>
          //   <h3>{token.token.name}</h3>
          //   <p>Symbol: {token.token.symbol}</p>
          //   <p>Price Native: {token.priceNative}</p>
          //   <p>Price USD: {token.priceUsd}</p>
          //   <p>Buys: {token.txns.h24.buys}</p>
          //   <p>Sells: {token.txns.h24.sells}</p>
          //   <p>Volume: {token.volume.h24}</p>
          //   <p>Price Change: {token.priceChange.h24}</p>
          //   <p>Liquidity: {token.liquidity.usd}</p>
          //   <p>Market Cap: {token.marketCap}</p>        
          // </div>
        ))}
      </div>
 
  );
};

const OrdersResult = ({ orders }: { orders: DexScreenerOrder[] }) => {
  if (!orders.length) {
    return (
      <Card className="bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          No, this token hasn&apos;t paid for any DexScreener promotional
          services. This means they haven&apos;t invested in marketing features
          like token profile promotion or community takeover on DexScreener.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 bg-muted/50 p-4">
      <h3 className="text-lg font-medium">Token Orders</h3>
      <div className="space-y-3">
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-background/50 p-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{order.type}</span>
                <Badge
                  variant={
                    order.status === 'approved'
                      ? 'default'
                      : order.status === 'processing'
                        ? 'secondary'
                        : order.status === 'rejected'
                          ? 'destructive'
                          : 'outline'
                  }
                >
                  {order.status}
                </Badge>
              </div>
              {order.paymentTimestamp > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Paid at:{' '}
                  {new Date(order.paymentTimestamp * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TokenProfile = ({ pair }: { pair: DexScreenerPair }) => {
  if (!pair) {
    return (
      <Card className="bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Token not found on DexScreener.
        </p>
      </Card>
    );
  }
  return (
    <Card className="space-y-4 bg-muted/50 p-4">
      <div className="flex items-center gap-3">
        {pair.info?.imageUrl && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={pair.info.imageUrl}
              alt={pair.baseToken.symbol}
              className="object-cover"
              fill
              sizes="48px"
              onError={(e) => {
                // @ts-expect-error - Type 'string' is not assignable to type 'never'
                e.target.src = '/placeholder.png';
              }}
            />
          </div>
        )}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium">
            {pair.baseToken.name}
            <span className="text-sm text-muted-foreground">
              ({pair.baseToken.symbol})
            </span>
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">
              {pair.baseToken.address.slice(0, 4)}...
              {pair.baseToken.address.slice(-4)}
            </span>
            <a
              href={pair.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-foreground"
            >
              View on DexScreener
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-background/50 p-3">
          <div className="text-sm font-medium">Price USD</div>
          <div className="mt-1 text-2xl font-semibold">
            $
            {Number(pair.priceUsd).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </div>
        </div>
        <div className="rounded-lg bg-background/50 p-3">
          <div className="text-sm font-medium">Liquidity</div>
          <div className="mt-1 text-2xl font-semibold">
            ${pair.liquidity?.usd.toLocaleString() ?? 'Unknown'}
          </div>
        </div>
      </div>

      {(pair.info?.websites?.length || pair.info?.socials?.length) && (
        <div className="border-t pt-4">
          <h4 className="mb-3 text-sm font-medium">Links</h4>
          <div className="flex flex-wrap gap-2">
            {pair.info?.websites?.map((website, index) => (
              <a
                key={index}
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-background px-2.5 py-1.5 text-sm hover:bg-accent"
              >
                {website.label}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            ))}
            {pair.info?.socials?.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-background px-2.5 py-1.5 text-sm capitalize hover:bg-accent"
              >
                {capitalize(social.type)}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const TokenProfiles = ({
  profiles,
}: {
  profiles: DexScreenerTokenProfile[];
}) => {
  const sonicProfiles = profiles.filter(
    (profile) => profile.chainId === 'sonic',
  );

  if (!sonicProfiles.length) {
    return (
      <Card className="bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          No Sonic token profiles found.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sonicProfiles.map((profile, index) => (
        <Card key={index} className="bg-muted/50">
          <div className="bg flex flex-col p-2">
            <div className="flex gap-3">
              {profile.icon && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={profile.icon}
                    alt="Token Icon"
                    className="object-cover"
                    fill
                    sizes="64px"
                    onError={(e) => {
                      // @ts-expect-error - Type 'string' is not assignable to type 'never'
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-muted-foreground">
                    {profile.tokenAddress.slice(0, 4)}...
                    {profile.tokenAddress.slice(-4)}
                  </code>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    DexScreener
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
                <div className="h-12 overflow-hidden py-1">
                  {profile.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {profile.description}
                    </p>
                  )}
                </div>
                {profile.links &&
                  (profile.links.length <= 2 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.links.map((link, idx) => (
                        <LinkChip key={idx} link={link} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 overflow-hidden">
                      <LinkChip link={profile.links[0]} />
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex cursor-default items-center rounded-md bg-background px-1.5 py-0.5 text-xs">
                              +{profile.links.length - 1} more
                              <MoreHorizontal className="ml-1 h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="flex flex-col gap-1 p-2">
                            {profile.links.slice(1).map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs capitalize hover:text-accent"
                              >
                                {getLinkText(link)}
                                <ExternalLink className="ml-1 h-2.5 w-2.5" />
                              </a>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const LinkChip = ({ link }: { link: DexScreenerTokenProfileLink }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center rounded-md bg-background px-1.5 py-0.5 text-xs capitalize hover:bg-accent"
  >
    {getLinkText(link)}
    <ExternalLink className="ml-1 h-2.5 w-2.5" />
  </a>
);

const getLinkText = (link: DexScreenerTokenProfileLink) =>
  link.type
    ? capitalize(link.type)
    : link.label
      ? capitalize(link.label)
      : 'Link';

function TokenDexscreenerCard({ token }: { token: DexPair }) {
  const tokenInfo = token.baseToken.symbol === 'ws' ? token.quoteToken : token.baseToken;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={
              token.info?.imageUrl ||
              Placeholder.generate({ width: 40, height: 40, text: 'Token' })
            }
            alt={tokenInfo.name}
            className="object-cover"
            fill
            sizes="40px"
            onError={(e) => {
              (e.target as HTMLImageElement).src = Placeholder.generate({
                width: 40,
                height: 40,
                text: tokenInfo.symbol,
              });
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-medium">{tokenInfo.name}</h3>
            <span className="shrink-0 rounded-md bg-background/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {tokenInfo.symbol}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">
              {tokenInfo.address.slice(0, 4)}...{tokenInfo.address.slice(-4)}
            </span>
          </div>
        </div>
      </div>
      {/* <div className="mt-1 text-sm text-muted-foreground">
        <p className="font-mono">by {token.dexId}</p>
      </div> */}
    </div>
  );
}

export const dexscreenerTools = {
  // getTokenOrders: {
  //   displayName: '🔍 Check Token Orders',
  //   description:
  //     "Check if a token has paid for DexScreener promotional services. Use this to verify if a token has invested in marketing or visibility on DexScreener, which can indicate the team's commitment to marketing and visibility. Returns order types (tokenProfile, communityTakeover, etc.) and their statuses.",
  //   parameters: z.object({
  //     chainId: z
  //       .string()
  //       .describe("The blockchain identifier (e.g., 'sonic', 'ethereum')"),
  //     tokenAddress: z.string().describe('The token address to check'),
  //   }),
  //   execute: async ({
  //     chainId,
  //     tokenAddress,
  //   }: {
  //     chainId: string;
  //     tokenAddress: string;
  //   }) => {
  //     try {
  //       const response = await fetch(
  //         `https://api.dexscreener.com/orders/v1/${chainId}/${tokenAddress}`,
  //         {
  //           headers: {
  //             Accept: 'application/json',
  //           },
  //         },
  //       );

  //       if (!response.ok) {
  //         throw new Error(
  //           `Failed to fetch token orders: ${response.statusText}`,
  //         );
  //       }

  //       const orders = (await response.json()) as DexScreenerOrder[];
  //       return {
  //         suppressFollowUp: true,
  //         data: orders,
  //       };
  //     } catch (error) {
  //       throw new Error(
  //         `Failed to get token orders: ${error instanceof Error ? error.message : 'Unknown error'}`,
  //       );
  //     }
  //   },
  //   render: (raw: unknown) => {
  //     const result = (raw as { data: DexScreenerOrder[] }).data;
  //     return <OrdersResult orders={result} />;
  //   },
  // },

  searchToken: {
    displayName: '🔍 Search Token',
    description: 'Search for a token by name or symbol',
    parameters: z.object({
      query: z.string().describe('Token name or symbol to search for'),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const result = await searchTokenByName(query);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to search tokens',
        };
      }
    },
    render: (result: unknown) => {
      const typedResult = result as {
        success: boolean;
        data?: DexPair[];
        error?: string;
      };

      if (!typedResult.success) {
        return (
          <div className="relative overflow-hidden rounded-2xl bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-destructive">
                Error: {typedResult.error}
              </p>
            </div>
          </div>
        );
      }

      if (!typedResult.data?.length) {
        return (
          <div className="relative overflow-hidden rounded-2xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">No tokens found</p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {/* {typedResult.data.map((token) => (
                    <TokenDexscreenerCard key={token.pairAddress} token={token} />
                ))} */}
          <TokenDexscreenerCard key={typedResult.data[0].pairAddress} token={typedResult.data[0]} />
        </div>
      );
    }
  },
  getTokenProfile: {
    displayName: '📊 Token Profile',
    description:
      'Get comprehensive information about a token from DexScreener. Use this when users want to know more about a token, including its price, liquidity, market cap, and social links (Telegram, Twitter, Website). This is particularly useful for due diligence or when users ask about token details, social presence, or market metrics.',
    parameters: z.object({
      mint: z.string().describe("The token's mint/contract address to check"),
    }),
    execute: async ({ mint }: { mint: string }) => {
      try {
        console.log('getTokenProfile mint:', mint);
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
          {
            headers: { Accept: 'application/json' },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch token profile: ${response.statusText}`,
          );
        }

        const data = (await response.json()) as DexScreenerPairResponse;

        if (data.pairs === null || !data.pairs.length) {
          throw new Error('No pair data found');
        }

        // Use the first pair with the highest liquidity
        const sortedPairs = data.pairs.sort(
          (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
        );
        return {
          suppressFollowUp: true,
          data: sortedPairs[0],
        };
      } catch (error) {
        return {
          suppressFollowUp: false,
          data: null,
        };
      }
    },
    render: (raw: unknown) => {
      const result = (raw as { data: DexScreenerPair }).data;
      return <TokenProfile pair={result} />;
    },
  },
  getTrendingTokens: {
    displayName: '🔥 Trending Tokens',
    description:
      'Get what tokens are trending on Sonic.',
    parameters: z.object({
      limit: z.number().optional().describe("Limit of tokens to return"),
    }),
    execute: async ({ limit }: { limit: any }) => {
      try {
        const response = await fetch(`https://backend.ways.sh/data/tokens.json`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to read web page: ${response.statusText}`);
        }

        const content = await response.json() as DexScreenerTrendingApiResponse;
        //console.log('getTrendingTokens content:', content);

        //Remove Base and Quote token => one token object
        const formattedTokens: DexTrendingTokenFormatted[] = []
        for (const token of content.tokens) {
          if (token?.Error) continue;
          const formattedToken: DexTrendingTokenFormatted = {
            token: token.baseToken.address === '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38' ? token.quoteToken : token.baseToken,
            url: token.url,
            priceNative: token.priceNative,
            priceUsd: token.priceUsd,
            txns: token.txns,
            volume: token.volume,
            priceChange: token.priceChange,
            liquidity: token.liquidity,
            fdv: token.fdv,
            marketCap: token.marketCap,
            pairCreatedAt: token.pairCreatedAt,
            info: token.info,
            chainId: token.chainId,
            dexId: token.dexId,
            pairAddress: token.pairAddress,
            boosts: token.boosts,
          }
          formattedTokens.push(formattedToken)
        }

        //console.log('getTrendingTokens formattedTokens:', formattedTokens);

        return {
          data: formattedTokens,
        };
      } catch (error) {
        throw new Error(
          `Failed to read web page: ${error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    },
    render: (raw: unknown) => {
      const result = raw as { data: DexTrendingTokenFormatted[] };
      return <TrendingTokensContent content={result.data} />;
    },
  }

  // getLatestTokenProfiles: {
  //   displayName: '🌟 Latest Token Profiles',
  //   description:
  //     'Get the latest token profiles from DexScreener, focusing on Sonic tokens. This shows tokens with verified profiles including their descriptions, social links, and branding assets.',
  //   parameters: z.object({
  //     placeholder: z.string().optional(),
  //   }),
  //   execute: async () => {
  //     try {
  //       const response = await fetch(
  //         'https://api.dexscreener.com/token-profiles/latest/v1',
  //         {
  //           headers: { Accept: 'application/json' },
  //         },
  //       );

  //       if (!response.ok) {
  //         throw new Error(
  //           `Failed to fetch token profiles: ${response.statusText}`,
  //         );
  //       }

  //       const profiles = (await response.json()) as DexScreenerTokenProfile[];

  //       // Return up to first 10 profiles for Sonic
  //       const sonicProfiles = profiles
  //         .filter((p) => p.chainId === 'sonic')
  //         .slice(0, 10);

  //       return {
  //         suppressFollowUp: true,
  //         data: sonicProfiles,
  //       };
  //     } catch (error) {
  //       throw new Error(
  //         `Failed to get token profiles: ${error instanceof Error ? error.message : 'Unknown error'}`,
  //       );
  //     }
  //   },
  //   render: (raw: unknown) => {
  //     const result = (raw as { data: DexScreenerTokenProfile[] }).data;
  //     return <TokenProfiles profiles={result} />;
  //   },
  // },
};
