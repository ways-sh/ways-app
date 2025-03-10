export interface IntegrationTheme {
  primary: string;
  secondary: string;
}

export interface Integration {
  icon: string;
  label: string;
  description?: string;
  theme: IntegrationTheme;
}

export const INTEGRATIONS: Integration[] = [
  {
    icon: '/integrations/sonic.jpg',
    label: 'Sonic',
    description: 'Fully compatible with Sonic',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },
  {
    icon: '/integrations/dexscreener.svg',
    label: 'DexScreener',
    description: 'Discover trending tokens',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },
  {
    icon: '/integrations/coal.jpg',
    label: 'Coal.ag',
    description: 'Dex aggreator',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },
  {
    icon: '/integrations/shadowx.jpg',
    label: 'Shadow Exchange',
    description: 'Concentrated liquidity layer and exchange',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },
  {
    icon: '/integrations/mobula.jpg',
    label: 'Mobula',
    description: 'Onchain data provider',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },
  {
    icon: '/integrations/clock.png',
    label: '30+ integrations soon',
    description: 'Yield aggregators, DeFi protocols and more...',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
  },


  // {
  //   icon: 'integrations/pump_fun.svg',
  //   label: 'pump.fun',
  //   description: 'Discover new tokens, launch tokens',
  //   theme: {
  //     primary: '#10B981', // Green
  //     secondary: '#10B981', // Green
  //   },
  // },
  // {
  //   icon: 'integrations/jupiter.svg',
  //   label: 'Jupiter',
  //   description: 'Swap tokens & DCA, Limit orders',
  //   theme: {
  //     primary: '#16A34A', // Green
  //     secondary: '#22C55E', // Light green
  //   },
  // },
  // {
  //   icon: 'integrations/magic_eden.svg',
  //   label: 'Magic Eden',
  //   description: 'Explore the best NFT collections',
  //   theme: {
  //     primary: '#9333EA', // Purple
  //     secondary: '#A855F7', // Light purple
  //   },
  // },
  // {
  //   icon: 'integrations/dialect.svg',
  //   label: 'Dialect',
  //   description: 'Create and share blinks',
  //   theme: {
  //     primary: '#0EA5E9', // Blue
  //     secondary: '#38BDF8', // Light blue
  //   },
  // },

  // {
  //   icon: 'integrations/defined_fi.svg',
  //   label: 'Defined Fi',
  //   description: 'Discover unbiassed trending tokens',
  //   theme: {
  //     primary: '#B0EECF', // Orange
  //     secondary: '#181432', // White
  //   },
  // },
];
