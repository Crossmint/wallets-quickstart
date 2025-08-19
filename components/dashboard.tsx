import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { TransferFunds } from "./transfer";
import { Activity } from "./activity";
import { Footer } from "./footer";
import { LogoutButton } from "./logout";
import { WalletBalance } from "./balance";

export function Dashboard() {
  const { wallet } = useWallet();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const walletAddress = wallet?.address;

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 content-center">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:pt-8">
        <div className="flex flex-col mb-6 max-sm:items-center">
          <Image
            src="/crossmint.svg"
            alt="Crossmint logo"
            priority
            width={150}
            height={150}
            className="mb-4"
          />
          <h1 className="text-2xl font-semibold mb-2">Wallets Quickstart</h1>
          <p className="text-gray-600 text-sm">
            Create and interact with Crossmint wallets
          </p>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <LogoutButton />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* USDXM Balance & Wallet Details Column */}
            <div className="flex flex-col gap-6">
              {/* USDXM Balance Section */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <WalletBalance />
              </div>

              {/* Wallet Details Section */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Wallet details</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Address
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900 overflow-auto">
                        {walletAddress
                          ? `${walletAddress.slice(
                              0,
                              6
                            )}...${walletAddress.slice(-6)}`
                          : ""}
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {copiedAddress ? (
                          <Image
                            src="/circle-check-big.svg"
                            alt="Copied"
                            width={16}
                            height={16}
                          />
                        ) : (
                          <Image
                            src="/copy.svg"
                            alt="Copy"
                            width={16}
                            height={16}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Owner
                    </span>
                    <span className="text-sm text-gray-900 overflow-auto">
                      {wallet?.owner?.replace(/^[^:]*:/, "") || "Current User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Chain
                    </span>
                    <span className="text-sm text-gray-900 capitalize text-nowrap overflow-auto">
                      {wallet?.chain}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <TransferFunds />
            <Activity />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
