"use client";

import { useEffect } from "react";
import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import {
	useSetActiveWallet,
	PayEmbed,
	ConnectButton,
	TransactionButton,
	useActiveWallet,
	MediaRenderer,
	useReadContract,
} from "thirdweb/react";
import { createWalletAdapter } from "thirdweb/wallets";
import { claimTo, getNFT } from "thirdweb/extensions/erc1155";
import {
	useAccount,
	useConnect,
	useDisconnect,
	useSwitchChain,
	useWalletClient,
} from "wagmi";
import { baseSepolia } from "thirdweb/chains";

const client = createThirdwebClient({
	clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!,
});

const contract = getContract({
	address: "0x638263e3eAa3917a53630e61B1fBa685308024fa",
	chain: baseSepolia,
	client,
});

function App() {
	const wagmiAccount = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnectAsync } = useDisconnect();
	// This is how to set a wagmi account in the thirdweb context to use with all the thirdweb components including Pay
	const { data: walletClient } = useWalletClient();
	const { switchChainAsync } = useSwitchChain();
	const setActiveWallet = useSetActiveWallet();
	useEffect(() => {
		const setActive = async () => {
			if (walletClient) {
				const adaptedAccount = viemAdapter.walletClient.fromViem({
					walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
				});
				const w = createWalletAdapter({
					adaptedAccount,
					chain: defineChain(await walletClient.getChainId()),
					client,
					onDisconnect: async () => {
						await disconnectAsync();
					},
					switchChain: async (chain) => {
						await switchChainAsync({ chainId: chain.id as any });
					},
				});
				setActiveWallet(w);
			}
		};
		setActive();
	}, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);

	// handle disconnecting from wagmi
	const thirdwebWallet = useActiveWallet();
	useEffect(() => {
		const disconnectIfNeeded = async () => {
			if (thirdwebWallet && wagmiAccount.status === "disconnected") {
				await thirdwebWallet.disconnect();
			}
		};
		disconnectIfNeeded();
	}, [wagmiAccount, thirdwebWallet]);

	const { data: nft } = useReadContract(getNFT, {
		contract,
		tokenId: 0n,
	});

	return (
		<div className="container fade-in">
			<div className="section">
				<div className="section-header">
					<h1>wagmi</h1>
				</div>
				
				<div className="card">
					<h2>Account</h2>
					<div className="grid grid-2">
						<div>
							<strong>Status:</strong> 
							<span className={`status ${wagmiAccount.status === "connected" ? "connected" : wagmiAccount.status === "connecting" ? "pending" : "disconnected"}`}>
								{wagmiAccount.status}
							</span>
						</div>
						<div>
							<strong>Chain ID:</strong> 
							<code>{wagmiAccount.chainId}</code>
						</div>
						<div>
							<strong>Addresses:</strong> 
							<code>{JSON.stringify(wagmiAccount.addresses)}</code>
						</div>
					</div>

					{wagmiAccount.status === "connected" && (
						<button
							type="button"
							className="secondary"
							onClick={async () => {
								await disconnectAsync();
							}}
						>
							Disconnect
						</button>
					)}
				</div>

				<div className="card">
					<h2>Connect</h2>
					<div className="grid grid-3">
						{connectors.map((connector) => (
							<button
								key={connector.uid}
								onClick={() => {
									if(connector.id === "in-app-wallet"){
										connect({ connector, strategy: "google" })
									} else {
										connect({ connector })
									}}
								}
								type="button"
							>
								{connector.name}
							</button>
						))}
					</div>
					<div className="status pending">{status}</div>
					{error && <div className="status disconnected">{error?.message}</div>}
				</div>
			</div>

			<hr />

			<div className="section">
				<div className="section-header">
					<h1>Thirdweb Components</h1>
				</div>

				{wagmiAccount.isConnected ? (
					<div className="grid grid-2">
						<div className="card">
							<h2>
								<a href="https://portal.thirdweb.com/typescript/v5/react/components/ConnectButton">{`<ConnectButton />`}</a>{" "}
								component
							</h2>
							<ConnectButton client={client} />
						</div>
						
						<div className="card">
							<h2>
								<a href="https://portal.thirdweb.com/connect/pay/get-started#option-2-embed-pay">{`<PayEmbed />`}</a>{" "}
								component
							</h2>
							<PayEmbed client={client} />
						</div>
						
						<div className="card">
							<h2>
								<a href="https://portal.thirdweb.com/typescript/v5/react/components/MediaRenderer">{`<MediaRenderer />`}</a>{" "}
								component
							</h2>
							{nft && (
								<div className="media-container">
									<MediaRenderer client={client} src={nft.metadata.image} />
								</div>
							)}
						</div>
						
						<div className="card">
							<h2>
								<a href="https://portal.thirdweb.com/typescript/v5/react/components/TransactionButton">{`<TransactionButton />`}</a>{" "}
								component
							</h2>
							<TransactionButton
								transaction={() => {
									return claimTo({
										contract,
										quantity: 1n,
										to: wagmiAccount.address!,
										tokenId: 0n,
									});
								}}
								onError={(e) => console.error(e)}
								className="transaction-button"
							>
								Mint
							</TransactionButton>
						</div>
					</div>
				) : (
					<div className="card">
						<p style={{ textAlign: 'center', fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)' }}>
							Connect with wagmi to share the connected wallet between both libraries!
						</p>
					</div>
				)}
			</div>
			
			<div className="section" style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
				<a href="https://github.com/thirdweb-example/wagmi-thirdweb" className="glow">
					View code on Github
				</a>
			</div>
		</div>
	);
}

export default App;
