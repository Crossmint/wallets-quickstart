"use client";

import { useEffect, useRef } from "react";
import { useCrossmint, useWallet } from "@crossmint/client-sdk-react-ui";
import { LandingPage } from "@/components/landing-page";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Dashboard } from "@/components/dashboard";
import { useStytchUser } from "@stytch/nextjs";
import { useStytch } from "@stytch/nextjs";

export default function Home() {
  const { wallet, status: walletStatus, getOrCreateWallet } = useWallet();
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const nodeRef = useRef(null);
  const { setJwt, crossmint } = useCrossmint();

  const isLoggedIn = wallet != null && stytch && user != null;
  const isLoading =
    walletStatus === "in-progress" || isInitialized === false;


  useEffect(() => {
    // Link the logged in user to the Crossmint SDK
    stytch.session.onChange(() => {
      const tokens = stytch.session.getTokens();
      setJwt(tokens?.session_jwt || undefined);
    });
  }, [stytch]);

  useEffect(() => {
    async function initializeWallet() {
      await getOrCreateWallet({
        chain: "solana",
        signer: {
          type: "email",
          email: user?.emails?.[0]?.email,
        },
      });
    }

    initializeWallet();
  }, [crossmint.jwt]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={isLoggedIn ? "dashboard" : "landing"}
            nodeRef={nodeRef}
            timeout={400}
            classNames="page-transition"
            unmountOnExit
          >
            <div ref={nodeRef}>
              {isLoggedIn ? (
                <Dashboard />
              ) : (
                <LandingPage isLoading={isLoading} />
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </main>
    </div>
  );
}
