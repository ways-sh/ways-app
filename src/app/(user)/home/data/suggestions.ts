export interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'swap-sol-usdc',
    title: 'Swap 0.1 SONIC for EGGS',
    subtitle: 'using ShadowX to swap on Sonic',
  },
  {
    id: 'sonic-trends',
    title: "What's trending on Sonic?",
    subtitle: 'find the current market trends',
  },
  {
    id: 'price-feed',
    title: "What's the price of S?",
    subtitle: 'find the current price of Sonic',
  },
  {
    id: 'top-gainers-last-24h',
    title: 'Website of HeyAnon token?',
    subtitle: 'find socials for HeyAnon token',
  },
  {
    id: 'check-my-wallet',
    title: 'Check my wallet',
    subtitle: 'check the portfolio of your wallet',
  },
  // {
  //   id: 'sell-everything-buy-ways',
  //   title: 'Sell everything and buy $WAYS',
  //   subtitle: 'swap all your tokens for $WAYS',
  // },
  // {
  //   id: 'phantom-updates',
  //   title: 'Any updates from @phantom recently?',
  //   subtitle: 'summarize the latest tweets from @phantom',
  // },
  // {
  //     id: "toly-updates",
  //     title: "What has toly been doing recently?",
  //     subtitle: "summarize his recent tweets"
  // },
];

export function getRandomSuggestions(count: number): Suggestion[] {
  // Ensure we don't request more items than available
  const safeCount = Math.min(count, SUGGESTIONS.length);
  const startIndex = Math.floor(Date.now() / 1000) % SUGGESTIONS.length;

  // Create a rotated copy of the array starting from startIndex
  const rotatedSuggestions = [
    ...SUGGESTIONS.slice(startIndex),
    ...SUGGESTIONS.slice(0, startIndex),
  ];

  // Return only the first safeCount items
  return rotatedSuggestions.slice(0, safeCount);
}
