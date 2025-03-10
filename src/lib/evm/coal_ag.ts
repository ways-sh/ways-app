import { ethers } from "ethers";
import { getTokenDecimals } from "./alchemy";

export interface CoalTransactionData {
  to: string;
  data: string;
  value: string;
}

interface AdditionalTransaction {
  to: string;
  data: string;
  value: string;
}

export interface CoalResponseTransactions {
  transactionData: CoalTransactionData;
  additionalTransactions?: AdditionalTransaction[];
}

interface CoalResponseQuote {
    amountOutNative: string;
    quoteData: string
}

export interface CoalResponseQuoteExtended extends CoalResponseQuote {
    action: "buy" | "sell";
    isNativeSwap: boolean
}

const fetchCoal = async (endpoint: string, method: 'GET' | 'POST', params: any,) => {
    try {
        //console.log(`requestCoalAg: ${endpoint}`, params);
        const response = await fetch(
            method === 'GET' ? `${process.env.NEXT_PUBLIC_COAL_AG_ENDPOINT + endpoint}?${new URLSearchParams(params).toString()}` : `${process.env.NEXT_PUBLIC_COAL_AG_ENDPOINT + endpoint}`,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: method === 'POST' ? JSON.stringify(params) : undefined
            })

        const data = await response.json();
        if (data.error) {
            throw new Error(
                `Coal.ag API error: ${data.details || JSON.stringify(data.error)}`,
            );
        }

        return data
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Coal.ag request failed: ${error.message}`);
        }
        throw new Error('Coal.ag request failed with unknown error');
    }
}

export const getCoalTransactions = async (quoteData: string, toAddress: string, isNativeSwap: boolean, slippage: number = 2, feeBps: number =25, feeRecipient: string): Promise<CoalResponseTransactions | undefined> => {
    const params = {
        quoteData,
        toAddress,
        feeBps,
        feeRecipient
    }
    try {
        const txList = await fetchCoal("/api/v1/swap/native", "POST", params) as CoalResponseTransactions;
        //console.log(`txList:`, txList);
        return txList;
    } catch (error) {
        throw new Error('Coal.ag request failed');
    }

}
export const getCoalQuote = async (inputAddress: string, outputAddress: string, amountIn: string): Promise<CoalResponseQuoteExtended | undefined> => {
    console.log(process.env.NEXT_PUBLIC_WRAPPED_SONIC, inputAddress, outputAddress);
    // Native swap
    if (inputAddress === process.env.NEXT_PUBLIC_WRAPPED_SONIC || outputAddress === process.env.NEXT_PUBLIC_WRAPPED_SONIC) {

        const action: "buy" | "sell" = inputAddress === process.env.NEXT_PUBLIC_WRAPPED_SONIC ? "buy" : "sell";
        const tokenAddress = inputAddress === process.env.NEXT_PUBLIC_WRAPPED_SONIC ? outputAddress : inputAddress;
        const amount = ethers.utils.parseUnits(amountIn, action === "buy" ? 18 : await getTokenDecimals(tokenAddress) ?? 18).toString()
        const feeBps = 25
        const feeRecipient = "0xabcdef1234567890abcdef1234567890abcdef12";

        const params = {
            action,
            tokenAddress,
            amount,
            feeBps,
            feeRecipient
        }
        console.log(`params:`, params);
        try {
            const quote = await fetchCoal("/api/v1/quotes/native", "GET", params) as CoalResponseQuote;
            console.log(`Quote:`, quote);
            //const txResult = await makeSwap(quote.quoteData, 1);
            return {
                ...quote,
                action,
                isNativeSwap: true
            }
        } catch (error) {
            throw new Error('Coal.ag request failed');
        }   
    }

}

