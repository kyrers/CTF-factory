import { ethers } from "ethers";
import { targetNetwork } from '../config/config';

export const connect = async (displayAlert: (type: string, title: string, text: string) => void) => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (window.ethereum.networkVersion !== targetNetwork.chainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: "0x" + targetNetwork.chainId.toString(16) }]
                    });
                } catch (error: any) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (error.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainName: targetNetwork.name,
                                    chainId: "0x" + targetNetwork.chainId.toString(16),
                                    nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
                                    rpcUrls: [targetNetwork.rpcUrl]
                                }
                            ]
                        });
                    }
                }
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            return { signer: signer, signerAddress: signerAddress };
        } catch (error: any) {
            displayAlert("danger", "Error", "Please finish connecting your wallet to continue");
            return { signer: null, signerAddress: "" };
        }
    } else {
        displayAlert("danger", "Error", "Please install metamask to continue");
        return { signer: null, signerAddress: "" };
    }
}