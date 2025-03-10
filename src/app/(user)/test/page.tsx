'use client'

import { getWalletPortfolio, getTokenMarketData } from "@/lib/evm/mobula";
import { useEffect, useState } from "react";
import { sonicTools } from "@/ai/evm/sonic";
import { testAlchemy } from "@/lib/evm/alchemy";
export default function TestPage() {
    const [mobulaResult, setMobulaResult] = useState<any>(null);

    useEffect(() => {
        testAlchemy().then((result) => {            
            console.log(`page.tsx:`, result);
            setMobulaResult(JSON.stringify(result));
        });
        // getWalletPortfolio("0x430F09841d65BEB3F27765503D0F850B8bCe7713").then((result) => {
        //     console.log(`page.tsx:`, result);
        //     setMobulaResult(JSON.stringify(result));
        // });
        // getMarketData("0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c").then((result) => {
        //     console.log(`page.tsx:`, result);
        //     setMobulaResult(JSON.stringify(result));
        // });
        // sonicTools.searchToken.execute({ query: "beets staked sonic" }).then((result) => {
        //     console.log(`page.tsx:`, result);
        // });
    }, []);


    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col py-8">
                <div className="w-full px-8">
                    <h1 className="text-lg font-medium">Test page</h1>
                    {mobulaResult !== null ? (
                        <p>Mobula Result: {mobulaResult}</p>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

