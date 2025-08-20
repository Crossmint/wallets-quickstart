"use client";

import { useState } from "react";
import { SolanaWallet, useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";
import { VersionedTransaction } from "@solana/web3.js";

export function Swap() {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);

  async function handleOnSwap() {
    if (wallet == null || amount == null) {
      alert("Swap: missing required fields");
      return;
    }

    try {
      // call jupiter get quote
      // lite-api.jup.ag/swap/v1/quote
      const queryParams = new URLSearchParams({
        inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        outputMint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
        amount: (amount * 1000000).toString(),
        slippageBps: "50",
      });

      const response = await fetch(`https://lite-api.jup.ag/swap/v1/quote?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const quoteResponse = await response.json();

      console.log(quoteResponse);

      // call jupiter swap
      // lite-api.jup.ag/swap/v1/swap
      const swapResponse = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPublicKey: wallet.address,
          quoteResponse: quoteResponse,
        }),
      });

      const swapResponseData = await swapResponse.json();

      console.log(swapResponseData);

      const solanaWallet = SolanaWallet.from(wallet);

      const versionedTransaction = VersionedTransaction.deserialize(
        Buffer.from(swapResponseData.swapTransaction, "base64")
      );

      const tx = await solanaWallet.sendTransaction({
        transaction: versionedTransaction,
      });

      console.log(tx);

      setExplorerLink(tx.explorerLink);
      setAmountInput("");
    } catch (err) {
      console.error("Transfer: ", err);
      alert("Transfer: " + err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Swap</h3>
        <p className="text-sm text-gray-500">Swap between USDC and ALPHABET</p>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <span className="absolute left-0 top-0 text-4xl font-bold text-gray-900 pointer-events-none">
          $
        </span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amountInput}
          className="text-4xl font-bold text-gray-900 bg-transparent border-none outline-none w-full pl-8"
          placeholder="0.00"
          onChange={(e) => {
            const value = e.target.value;
            setAmountInput(value);

            if (value === "") {
              setAmount(null);
            } else {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                setAmount(numValue);
              }
            }
          }}
          style={{
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Transfer Button */}
      <button
        className={cn(
          "w-full py-3 px-4 rounded-full text-sm font-medium transition-colors",
          isLoading || !amount
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
        )}
        onClick={handleOnSwap}
        disabled={isLoading || !amount}
      >
        {isLoading ? "Swapping..." : "Swap"}
      </button>

      {/* Explorer Link */}
      {explorerLink && !isLoading && (
        <a
          href={explorerLink}
          className="text-sm text-blue-600 hover:text-blue-800 text-center transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          → View transaction
        </a>
      )}
    </div>
  );
}
