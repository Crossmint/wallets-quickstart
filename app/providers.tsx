"use client";

import {
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";
import { StytchProvider } from "@stytch/nextjs";
import { createStytchUIClient } from "@stytch/nextjs/ui";

if (!process.env.NEXT_PUBLIC_CROSSMINT_API_KEY) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
}

if (!process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN) {
  throw new Error("NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN is not set");
}

const stytchClient = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StytchProvider stytch={stytchClient}>
      <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || ""}>
        <CrossmintWalletProvider>
          {children}
        </CrossmintWalletProvider>
      </CrossmintProvider>
    </StytchProvider>
  );
}
