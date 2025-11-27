"use client";

import { useState } from "react";
import { SolanaWallet, useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";
import { sendTokenWithFeeSplit } from "@/lib/transfer-with-fee";
import { Connection, PublicKey } from "@solana/web3.js";

export function TransferFunds() {
  const { wallet } = useWallet();
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);

  async function handleOnTransfer() {
    if (wallet == null || recipient == null || amount == null) {
      alert("Transfer: missing required fields");
      return;
    }

    try {
      setIsLoading(true);
      // 1. Setup
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"
      );
      const payer = new PublicKey(wallet.address);
      const feeRecipient = new PublicKey(process.env.NEXT_PUBLIC_FEE_RECIPIENT || "");
      const tokenMint = new PublicKey(
        "z23BZbAiFRb6u5CBH64XjZPUud6dP6y2ZuKoYSM4LCY" // USDXM devnet mint address
      );

      // 2. Construct the transaction (amount conversion happens inside sendTokenWithFeeSplit)
      const tx = await sendTokenWithFeeSplit(
        connection,
        payer,
        tokenMint,
        new PublicKey(recipient),
        feeRecipient,
        amount.toString(),
        "0.01" // Fixed fee of 0.01 tokens
      );

      // 3. Set up the wallet to send the transaction
      const solanaWallet = SolanaWallet.from(wallet);

      const txn = await solanaWallet.sendTransaction({
        transaction: tx,
      });

      setExplorerLink(txn.explorerLink);
    } catch (err) {
      console.error("Transfer: ", err);
      if (err instanceof Error && err.name === "AuthRejectedError") {
        return;
      } else {
        alert("Transfer: " + err);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Transfer funds</h3>
          <p className="text-sm text-gray-500">Send funds to another wallet</p>
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

        {/* Transfer To Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Transfer to
          </label>
          <input
            type="text"
            value={recipient || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter wallet address"
            onChange={(e) => setRecipient(e.target.value || null)}
          />
        </div>

        {/* Transfer Button */}
        <button
          className={cn(
            "w-full py-3 px-4 rounded-full text-sm font-medium transition-colors",
            isLoading || !recipient || !amount
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
          )}
          onClick={handleOnTransfer}
          disabled={isLoading || !recipient || !amount}
        >
          {isLoading ? "Transferring..." : "Transfer"}
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
    </div>
  );
}
