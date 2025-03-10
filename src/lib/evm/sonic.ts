import { ethers } from 'ethers'
import { Network } from 'alchemy-sdk'
import FACTORY_ABI from '@/lib/evm/abi/v3/factory.json' assert { type: 'json' };
import QUOTER_ABI from '@/lib/evm/abi/v3/quoter.json' assert { type: 'json' };
import SWAP_ROUTER_ABI from '@/lib/evm/abi/v3/swaprouter.json' assert { type: 'json' };
import POOL_ABI from '@/lib/evm/abi/v3/pool.json' assert { type: 'json' };

// Define the type for the DEX configuration
interface DexConfig {
    name: string;
    dexId: string;
    POOL_FACTORY_CONTRACT_ADDRESS: string;
    QUOTER_CONTRACT_ADDRESS: string;
    SWAP_ROUTER_CONTRACT_ADDRESS: string;
    factoryContract?: ethers.Contract;
    quoterContract?: ethers.Contract;
    swapRouterContract?: ethers.Contract;
  }

const availableDexes: DexConfig[] = [
    {
        name: 'Shadow X',
        dexId: 'shadow-exchange',
        POOL_FACTORY_CONTRACT_ADDRESS: '0xcD2d0637c94fe77C2896BbCBB174cefFb08DE6d7',
        QUOTER_CONTRACT_ADDRESS: '0x219b7ADebc0935a3eC889a148c6924D51A07535A',
        SWAP_ROUTER_CONTRACT_ADDRESS: '0x5543c6176feb9b4b179078205d7c29eea2e2d695',
        factoryContract: undefined,
        quoterContract: undefined,
        swapRouterContract: undefined,
    },
]

const provider = new ethers.providers.AlchemyProvider(Network.SONIC_MAINNET, process.env.NEXT_PUBLIC_SONIC_RPC_URL)
//Iterate over availableDexes and create a contract instance for each
availableDexes.forEach(dex => {
    dex.factoryContract = new ethers.Contract(dex.POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider)
    dex.quoterContract = new ethers.Contract(dex.QUOTER_CONTRACT_ADDRESS, QUOTER_ABI, provider)
    dex.swapRouterContract = new ethers.Contract(dex.SWAP_ROUTER_CONTRACT_ADDRESS, SWAP_ROUTER_ABI, provider)
})


