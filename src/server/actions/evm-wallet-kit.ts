'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getPrivyClient, verifyUser } from './user';
import { ActionEmptyResponse, actionClient } from '@/lib/safe-action';
// Pull in the shims (BEFORE importing ethers)
import "@ethersproject/shims"
import { ethers } from 'ethers';
import { decryptPrivateKey } from '@/lib/evm/evm-wallet-generator';
import { CoalTransactionData } from '@/lib/evm/coal_ag';
import { provider } from '@/lib/evm/alchemy';

class BaseEvmWallet {
    private wallet: ethers.Wallet
    //private provider: ethers.providers.JsonRpcProvider
    constructor(privateKey: string) {
        console.log('BaseEvmWallet: privateKey', privateKey);
        this.wallet = new ethers.Wallet(privateKey);
        console.log('BaseEvmWallet: wallet', this.wallet.address);
    }
    address(): string {
        return this.wallet.address;
    }
    revealPrivateKey(): string {
        return this.wallet.privateKey;
    }
    public async signTransaction(transaction: CoalTransactionData): Promise<string> {
        try {
            // Fixes hexlify error
            if (transaction.value) {
                transaction.value = ethers.utils.hexlify(BigInt(transaction.value));
            }
            //const currentNonce = await this.wallet.getTransactionCount("latest")
            console.log(`Getting nonce for ${this.wallet.address}`)
            const currentNonce = await provider.getTransactionCount(this.wallet.address, "latest")
            console.log('currentNonce', currentNonce)

            const eip155tx = {
                ...transaction,
                chainId: 146,
                gasPrice: ethers.utils.parseUnits('90', 'gwei'),
                gasLimit: 1000000,
                //maxFeePerGas: ethers.utils.parseUnits('90', 'gwei'),
                //maxPriorityFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
                //type: 2,
                nonce: currentNonce,
            }

            const signedTx = await this.wallet.signTransaction(eip155tx);
            return signedTx;
        } catch (error) {
            console.error('Error signing transaction', error);
            throw error;
        }
    }
}

export const revealPrivateKey = actionClient
    .schema(
        z
            .object({
                walletId: z.string(),
            })
            .optional(),
    )
    .action(async ({ parsedInput }) => {
        const evmKit = await retrieveEvmKit(undefined);

        //@ts-expect-error
        if (!evmKit.data?.data?.success) {
            return { success: false, error: 'EVM_KIT_RETRIEVAL_ERROR', data: null };
        }
        //@ts-expect-error
        const walletAdapter = evmKit.data?.data?.data?.walletAdapter;
        //console.log('walletAdapter', walletAdapter);
        if (!walletAdapter) {
            return { success: false, error: 'WALLET_ADAPTER_NOT_FOUND', data: null };
        }
        return { success: true, data: walletAdapter.revealPrivateKey() };
    });

export const retrieveEvmKit = actionClient
    .schema(
        z
            .object({
                walletId: z.string(),
            })
            .optional(),
    )
    .action(async ({ parsedInput }) => {
        const authResult = await verifyUser();

        const userId = authResult?.data?.data?.id;

        if (!userId) {
            return { success: false, error: 'UNAUTHORIZED', data: null };
        }

        const result = await getEvmKit({
            userId,
            walletId: parsedInput?.walletId,
        });

        return { success: true, data: result };
    });

export const getEvmKit = async ({
    userId,
    walletId,
}: {
    userId: string;
    walletId?: string;
}) => {
    const whereClause = walletId
        ? { ownerId: userId, id: walletId }
        : { ownerId: userId, active: true };

    const wallet = await prisma.wallet.findFirst({
        where: whereClause,
    });

    if (!wallet) {
        return { success: false, error: 'WALLET_NOT_FOUND' };
    }

    if (wallet.encryptedPrivateKey) {
        const walletAdapter = new BaseEvmWallet(
            await decryptPrivateKey(wallet?.encryptedPrivateKey),
        );
        return { success: true, data: { walletAdapter } };
    }

    return { success: false, error: 'WALLET_DECRYPTION_ERROR' };
}


