"use client";

import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

if (!process.env.NEXT_PUBLIC_CROSSMINT_API_KEY) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
}

const chain = (process.env.NEXT_PUBLIC_CHAIN ?? "solana") as any;
const plugins = (process.env.NEXT_PUBLIC_PLUGINS?.split(",") ?? []) as any;

const customAppearance = {
  colors: {
    accent: "#020617",
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || ""}>
      <CrossmintAuthProvider
        authModalTitle="Welcome"
        loginMethods={["google", "email"]}
        appearance={customAppearance}
        termsOfServiceText={
          <p>
            By continuing, you accept the{" "}
            <a
              href="https://www.crossmint.com/legal/terms-of-service"
              target="_blank"
            >
              Wallet's Terms of Service
            </a>
            , and to recieve marketing communications from Crossmint.
          </p>
        }
      >
        <CrossmintWalletProvider
          appearance={customAppearance}
          createOnLogin={{
            chain: chain,
            signer: {
              type: "email",
            },
            plugins,
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
