"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Balances,
  useWallet,
} from "@crossmint/client-sdk-react-ui";
import Onramp from "@/components/onramp";

export function WalletBalance() {
  const { wallet } = useWallet();
  const [balances, setBalances] = useState<Balances | null>(null);
  const [showOnramp, setShowOnramp] = useState(false);

  useEffect(() => {
    async function fetchBalances() {
      if (!wallet) return;
      try {
        const balances = await wallet.balances();
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

  const usdcBalance = formatBalance(balances?.usdc.amount || "0");

  const handleFund = () => {
    setShowOnramp(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Icon and Info */}
      <div className="flex items-center gap-3">
        <Image src="/usdxm.svg" alt="usdc" width={24} height={24} />
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">USDC balance</h3>
          <div className="relative group">
            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center cursor-help">
              <span className="text-gray-500 text-xs font-medium">i</span>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              usdc is a test stablecoin
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="text-4xl font-bold text-gray-900">$ {usdcBalance}</div>

      {/* Add Money Button */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleFund}
          data-fund-button
          className="w-full py-3 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground transition-colors cursor-pointer hover:bg-primary/80"
        >
          Add money
        </button>
        <p className="text-gray-500 text-xs text-center">
          Refresh the page after transferring. Balance may take a few seconds to
          update.
        </p>
      </div>

      {/* Onramp Modal */}
      {showOnramp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOnramp(false)}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <Onramp />
          </div>
        </div>
      )}
    </div>
  );
}
