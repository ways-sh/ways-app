// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"
import { ethers } from 'ethers';

import { Utils, TransactionResponse } from "alchemy-sdk";
import { ALCHEMY_API_KEY } from "../constants";

import ERC20_ABI from '@/lib/evm/abi/erc20.json' assert { type: 'json' };

// const config = {
//     apiKey: ALCHEMY_API_KEY,
//     network: Network.SONIC_MAINNET,
//     //https://stackoverflow.com/questions/78184162/nextjs-14-sever-error-with-alchemy-api-missing-response-requestbody-method
//     connectionInfoOverrides: {
//         skipFetchSetup: true,
//       },
// };

// const alchemy = new Alchemy(config);
export const provider = new ethers.providers.JsonRpcProvider({
    //url: "https://sonic.gateway.tenderly.co/3lsJGAad4QDuKEfBJzPIZ6",
    url: "https://rpc.soniclabs.com",
    skipFetchSetup: true,
})

export const sendAndConfirmTransaction = async (signedTransaction: string): Promise<TransactionResponse | undefined> => {
    try {
        console.log('sending transaction', signedTransaction);
        //const result = await alchemy.core.sendTransaction(signedTransaction);
        const result = await provider.sendTransaction(signedTransaction);
        console.log('tx sent:', result.hash)
        const receipt = await provider.waitForTransaction(result.hash)
        console.log('receipt', receipt?.cumulativeGasUsed, receipt?.blockNumber);
        //const result = await alchemy.transact.sendTransaction(signedTransaction);
        return result;
    } catch (error) {
        console.error(`sendTransaction error:`, error)
        throw new Error('Alchemy API request failed with unknown error');
    }
}
export const getProvider = () => {
    return provider
}

export const getAccountNonce: (walletAddress: string) => Promise<number> = async (
    walletAddress: string,
) => {
    const nonce = await provider.getTransactionCount(walletAddress, "latest")
    return Number(nonce)
}

export const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const decimals = await erc20.decimals()
    return Number(decimals)
}

export const getTokenBalance: (walletAddress: string, tokenAddress: string) => Promise<number> = async (
    walletAddress: string,
    tokenAddress: string,
) => {
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
    const balance = await erc20.balanceOf(walletAddress)
    return balance.toString()
}

export const getEtherBalance: (walletAddress: string) => Promise<number> = async (
    walletAddress: string,
) => {
    try {
        const data = await provider.getBalance(walletAddress);
        //console.log(`data:`, data);
        return Number(Utils.formatEther(data))
    } catch (error) {
        console.error(`getEtherBalance error:`, error)
        throw new Error('Alchemy API request failed with unknown error');
    }
};

export const testAlchemy = async () => {
    const wallet = new ethers.Wallet("0x06724e73ed5be608b18eabf597189c5b7b8ec352a20c54ef63df539346f50429", provider)
    const nonce = await provider.getTransactionCount(wallet.address, "latest")
    const balance = await provider.getBalance(wallet.address)
    console.log(nonce, balance.toString())
    const result = nonce
    //const result = await prov.sendTransaction("0x02f901fb81928085012a05f200850d09dc3000830f4240945cdb4d5041e49e335287f510f91723022e9f4a46872386f26fc10000b90184f09c1bb900000000000000000000000079bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c0000000000000000000000000000000000000000000000000002d207eff6609d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002fa9ece64a0843a5a37512bc3cfebb30f2c2c6d00000000000000000000000000000000000000000000000000000000067cb839f00000000000000000000000000000000000000000000000000000000000000190000000000000000000000002fa9ece64a0843a5a37512bc3cfebb30f2c2c6d0c001a0a8c2d80e456e319f7c49aa0e00c07ca5751b40ddbabdd6f98b7fcdc653a993b0a073fff1fae25f53622a0fd2005abf00935639c97dd872618484f9e75e201f2205")
    //const result = await wallet.getTransactionCount("latest")
    //const result = await ethers.utils.fetchJson("https://rpc.soniclabs.com", '{ "id": 42, "jsonrpc": "2.0", "method": "eth_chainId", "params": [ ] }')
    console.log(`result:`, result);
    return result
};

