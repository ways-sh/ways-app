import { MobulaTokenMarketData, MobulaWalletPortfolio } from "@/types/evm/mobula"
const fetchMobula = async (endpoint: string, params: any) => {
    try {
        const paramsString = new URLSearchParams(params).toString();
        const response = await fetch(`${endpoint}?${paramsString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${process.env.NEXT_PUBLIC_MOBULA_API_KEY}`
            },
        })

        // Check for rate limiting response
        if (response.status === 429) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(
                `Mobula API error: ${data.error.message || JSON.stringify(data.error)}`,
            );
        }

        return data
    } catch (error) {
        console.error(`fetchMobula error:`, error)
        if (error instanceof Error) {
            throw new Error(`Mobula API request failed: ${error.message}`);
        }
        throw new Error('Mobula API request failed with unknown error');
    }
}

export const getSonicPrice = async (): Promise<MobulaTokenMarketData> => {
    const S = await getTokenMarketData('0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38')
    console.log(`S price:`, S.price)
    return S
}

export const getTokenMarketData = async (tokenAddress: string): Promise<MobulaTokenMarketData> => {
    const endpoint = `${process.env.NEXT_PUBLIC_MOBULA_API_URL}/market/data`
    const params = {
        asset: tokenAddress,
        blockchain: 'Sonic'
    }
    try {
        const response = await fetchMobula(endpoint, params)
        console.log(`response:`, response)
        const tokenMarketData = response.data as MobulaTokenMarketData
        console.log(`tokenMarketData:`, tokenMarketData.name, tokenMarketData.contracts)
        return tokenMarketData
    } catch (error) {
        console.error(`getTokenMarketData error:`, error)
        throw new Error('Mobula API request failed with unknown error');
    }

    /**
     * 
{
    "id": null,
    "name": "HeyAnon",
    "symbol": "Anon",
    "decimals": 18,
    "logo": null,
    "rank": null,
    "price": 6.913837016830654,
    "market_cap": 125466349.99103858,
    "market_cap_diluted": 125466350.30216125,
    "volume": 3232850.549892361,
    "volume_change_24h": null,
    "volume_7d": null,
    "liquidity": 890250.3854597087,
    "ath": null,
    "atl": null,
    "off_chain_volume": null,
    "is_listed": false,
    "price_change_1h": -0.5307830156446429,
    "price_change_24h": 4.047215550157544,
    "price_change_7d": -26.150462227775574,
    "price_change_1m": 26.120325944681213,
    "price_change_1y": -45.42858048868571,
    "total_supply": 18147137.399498,
    "circulating_supply": 18147137.354498,
    "contracts": [
        {
            "address": "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",
            "blockchainId": "146",
            "blockchain": "Sonic",
            "decimals": 18
        }
    ],
    "native": {
        "name": "Sonic",
        "symbol": "S",
        "address": "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38",
        "type": "native",
        "decimals": 18,
        "logo": "https://assets.coingecko.com/asset_platforms/images/22192/small/sonic.jpg?1733971484"
    },
    "priceNative": 12.57490335888296
}
     */
}

export const getWalletPortfolio = async (walletAddress: string): Promise<MobulaWalletPortfolio> => {
    const endpoint = `${process.env.NEXT_PUBLIC_MOBULA_API_URL}/wallet/portfolio`
    const params = {
        wallet: walletAddress,
        blockchains: ['Sonic'],
        cache: false,
        recheck_contract: true,
    }
    try {
        const response = await fetchMobula(endpoint, params)
        const walletPortfolio = await response.data as MobulaWalletPortfolio
        console.log(`response:`, response)
        return walletPortfolio
    } catch (error) {
        console.error(`getWalletPortfolio error:`, error)
        throw new Error('Mobula API request failed with unknown error');
    }

    /**
     * 
{
    "total_wallet_balance": 138676.4456202817,
    "wallets": [
        "0x430f09841d65beb3f27765503d0f850b8bce7713"
    ],
    "assets": [
        {
            "asset": {
                "id": 102480427,
                "name": "USDC.e",
                "symbol": "USDC.e",
                "logo": "https://metacore.mobula.io/9b4a08fadc7e3bed84e2eb662e097221da46ce2fedfc77f9fa8c1b3fa0c6cded.png",
                "contracts": [
                    "0x29219dd400f2bf60e5a23d13be72b486d4038894"
                ],
                "decimals": [
                    "6"
                ],
                "blockchains": [
                    "Sonic"
                ]
            },
            "price": 0.9999982435730905,
            "allocation": 0,
            "price_change_24h": 0.003780551182936608,
            "token_balance": 121550.102085,
            "estimated_balance": 121549.88859112986,
            "cross_chain_balances": {
                "Sonic": {
                    "balance": 121550.102085,
                    "chainId": "146",
                    "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
                    "balanceRaw": "121550102085"
                }
            },
            "contracts_balances": [
                {
                    "balance": 121550.102085,
                    "balanceRaw": "121550102085",
                    "chainId": "evm:146",
                    "address": "0x29219dd400f2bf60e5a23d13be72b486d4038894",
                    "decimals": 6
                }
            ]
        },
        {
            "asset": {
                "id": 102503677,
                "name": "Eggs Finance",
                "symbol": "EGGS",
                "logo": "https://mobulastorage.blob.core.windows.net/mobula-assets/assets/logos/a6e24adcc08da3ab20a326b5f1d95cbaac2349a0e338c253e4959c8a06611de9.png",
                "contracts": [
                    "0xf26ff70573ddc8a90bd7865af8d7d70b8ff019bc"
                ],
                "decimals": [
                    "18"
                ],
                "blockchains": [
                    "Sonic"
                ]
            },
            "price": 0.0006301439928011827,
            "allocation": 0,
            "price_change_24h": 0.5712542354424472,
            "token_balance": 812108.358303655,
            "estimated_balance": 511.7452034886787,
            "cross_chain_balances": {
                "Sonic": {
                    "balance": 812108.358303655,
                    "chainId": "146",
                    "address": "0xf26ff70573ddc8a90bd7865af8d7d70b8ff019bc",
                    "balanceRaw": "812108358303655005257728"
                }
            },
            "contracts_balances": [
                {
                    "balance": 812108.358303655,
                    "balanceRaw": "812108358303655005257728",
                    "chainId": "evm:146",
                    "address": "0xf26ff70573ddc8a90bd7865af8d7d70b8ff019bc",
                    "decimals": 18
                }
            ]
        },
        {
            "asset": {
                "id": 102501606,
                "name": "Sonic (prev. FTM)",
                "symbol": "S",
                "logo": "https://mobulastorage.blob.core.windows.net/mobula-assets/assets/logos/f528ed9bd1da48a6f3373511da95961b6c57ed921edc034cc33f8be6d44da69f.png",
                "contracts": [
                    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                ],
                "decimals": [
                    "18"
                ],
                "blockchains": [
                    "Sonic"
                ]
            },
            "price": 0.5532046399751814,
            "allocation": 0,
            "price_change_24h": 1.490778658560394,
            "token_balance": 30033.753560723155,
            "estimated_balance": 16614.811825663175,
            "cross_chain_balances": {
                "Sonic": {
                    "balance": 30033.753560723155,
                    "chainId": "146",
                    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    "balanceRaw": "30033753560723155320832"
                }
            },
            "contracts_balances": [
                {
                    "balance": 30033.753560723155,
                    "balanceRaw": "30033753560723155320832",
                    "chainId": "evm:146",
                    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    "decimals": 18
                }
            ]
        }
    ],
    "balances_length": 6
}
     */
}
