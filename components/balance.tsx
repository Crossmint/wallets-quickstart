"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Balances,
  useCrossmint,
  useWallet,
} from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";

export function WalletBalance() {
  const {
    crossmint: { apiKey, jwt },
  } = useCrossmint();
  const { wallet } = useWallet();
  const [balances, setBalances] = useState<Balances | null>(null);
  const [isFunding, setIsFunding] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      if (!wallet) return;
      try {
        const balances = await wallet.balances(["usdxm"]);
        setBalances(balances);
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
        alert("Error fetching wallet balances: " + error);
      }
    }
    fetchBalances();
  }, [wallet]);

  const formatBalance = (balance: string) => {
    return Number(balance).toFixed(2);
  };

  const usdxmToken = balances?.tokens.find((token) => token.symbol === "usdxm");
  const usdxmBalance = formatBalance(usdxmToken?.amount || "0");

  const handleFund = async () => {
    if (!wallet) {
      return;
    }
    if (apiKey.includes("_production_")) {
      alert("Crossmint faucet is not available in production.");
      return;
    }

    setIsFunding(true);
    try {
      const fundingAmount = 10;
      const response = await fetch(
        `https://staging.crossmint.com/api/v1-alpha2/wallets/${wallet.address}/balances`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            amount: fundingAmount,
            token: "usdxm",
            chain: wallet.chain,
          }),
        }
      );
      if (response != null && !response.ok) {
        return alert(`Failed to get USDXM: ${response.statusText}`);
      }

      // Optimistic UI update
      setBalances((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tokens: prev.tokens.map((token) => ({
            ...token,
            amount: (Number(token.amount) + fundingAmount).toString(),
          })),
        };
      });
    } catch (error) {
      alert(`Error getting test USDXM: ${error}`);
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Icon and Info */}
      <div className="flex items-center gap-3">
        <Image src="/usdxm.svg" alt="USDXM" width={24} height={24} />
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">USDXM balance</h3>
          <div className="relative group">
            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center cursor-help">
              <span className="text-gray-500 text-xs font-medium">i</span>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              USDXM is a test stablecoin
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="text-4xl font-bold text-gray-900">$ {usdxmBalance}</div>

      {/* Add Money Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleFund}
          disabled={isFunding}
          data-fund-button
          className={cn(
            "w-full py-3 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground transition-colors cursor-pointer",
            isFunding
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "hover:bg-primary/80"
          )}
        >
          {isFunding ? "Adding money..." : "Add money"}
        </button>
        <p className="text-gray-500 text-xs text-center">
          Refresh the page after transferring. Balance may take a few seconds to
          update.
        </p>
      </div>
    </div>
  );
}
