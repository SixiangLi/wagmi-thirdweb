import { http, createConfig } from "wagmi";
import { base, baseSepolia, mainnet, polygon, sepolia } from "wagmi/chains";
import { inAppWalletConnector } from "@thirdweb-dev/wagmi-adapter";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!;


export const client = createThirdwebClient({
  clientId,
});

export const config = createConfig({
	chains: [mainnet, sepolia, polygon, base, baseSepolia],
	// Note: inAppWalletConnector to enable social login
	connectors: [injected(), inAppWalletConnector({
    client,
  })],
	ssr: true,
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[polygon.id]: http(),
		[base.id]: http(),
		[baseSepolia.id]: http(),
	},
});

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}
