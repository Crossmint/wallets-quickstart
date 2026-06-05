"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { cn } from "@/lib/utils";

export function TransferFunds() {
  const { wallet } = useWallet();
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isStaging = process.env.NEXT_PUBLIC_CROSSMINT_API_KEY?.includes("staging");

  async function handleOnTransfer() {
    if (wallet == null || recipient == null || amount == null) {
      alert("Transfer: missing required fields");
      return;
    }

    if (recipient === wallet.address) {
      alert("You cannot send funds to your own wallet.");
      return;
    }

    try {
      setIsLoading(true);
      await wallet.send(recipient, "usdxm", amount.toString());
      setRecipient(null);
      setAmount(null);
      setAmountInput("");
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold">Transfer funds</h3>
            {isStaging && (
              <div className="relative group">
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center cursor-help">
                  <span className="text-gray-500 text-xs font-medium">i</span>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md w-56 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  This environment uses devnet blockchain. To complete a transfer, the recipient must have a devnet wallet.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
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

      </div>
    </div>
  );
}
