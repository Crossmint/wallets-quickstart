import { useState, useEffect } from "react";
import { EmbeddedAuthForm } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Smart Wallets",
    description:
      "Programmable wallets that enable transaction limits, recurring payments, and custom logic. Runs on Solana, Stellar, and EVM with full flexibility.",
    iconPath: "/cog.svg",
  },
  {
    title: "Native Gas Sponsorship",
    description:
      "Turn on gas sponsorship with a simple toggle for EVM and Solana. Crossmint covers all gas fees. We just invoice you every month.",
    iconPath: "/zap.svg",
  },
  {
    title: "No Vendor Lock-In",
    description:
      "Crossmint's wallets let you change signers as your needs change, minimizing disruption and allowing your users to keep their addresses and funds.",
    iconPath: "/lock.svg",
  },
  {
    title: "No blockchain engineers needed",
    description:
      "Easy APIs & SDKs for wallet data, transactions, bridging, and staking. Built for React and Node.js with no extra tooling required.",
    iconPath: "/code.svg",
  },
];

export function LandingPage({ isLoading }: { isLoading: boolean }) {
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Trigger feature animations after the page transition completes
    const timer = setTimeout(() => {
      setShowFeatures(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* Left side - Information with background */}
      <div
        className="relative hidden lg:flex flex-col rounded-[20px] justify-center px-18 py-8 m-3 col-span-2"
        style={{
          backgroundImage: `url('/grid-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div
          className={cn(
            "absolute rounded-[20px] inset-0 bg-black/40 transition-opacity duration-600 ease-out",
            showFeatures ? "opacity-100" : "opacity-0"
          )}
        ></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-12 text-white">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold">Wallets Quickstart</h1>
            <p className="text-white/60 text-lg">
              Create and interact with Crossmint wallets
            </p>
          </div>

          {/* Features list */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex items-start gap-5 p-4 backdrop-blur-sm rounded-2xl bg-blue-300/3 border border-white/10 transition-all duration-600 ease-out ${
                  showFeatures
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: showFeatures ? `${index * 150}ms` : "0ms",
                }}
              >
                <div className="w-10 h-10 border-white/20 border-2 rounded-full flex items-center justify-center flex-shrink-0">
                  <Image
                    className="filter-green w-6"
                    src={feature.iconPath}
                    alt={feature.title}
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center bg-gray-50 px-6 py-12 col-span-1 lg:col-span-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="w-full max-w-md bg-white rounded-3xl border shadow-lg overflow-hidden">
            <EmbeddedAuthForm />
          </div>
        )}
      </div>
    </div>
  );
}
