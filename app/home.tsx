"use client";

import { useState } from "react";
import { useAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import { WalletBalance } from "@/components/balance";
import { TransferFunds } from "@/components/transfer";
import { DelegatedSigners } from "@/components/delegated-signers";
import { LogoutButton } from "@/components/logout";
import { LoginButton } from "@/components/login";
import { Dialog } from "@/components/dialog";
import { Activity } from "@/components/activity";

export function HomeContent() {
  const { wallet, status: walletStatus } = useWallet();
  const { status: authStatus } = useAuth();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const walletAddress = wallet?.address;
  const isLoggedIn = wallet != null && authStatus === "logged-in";
  const isLoading =
    walletStatus === "in-progress" || authStatus === "initializing";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <Image
          src="/crossmint.svg"
          alt="Crossmint logo"
          priority
          width={150}
          height={150}
        />
        <h1 className="text-xl font-medium">Wallets Quickstart</h1>
        <div className="max-w-md w-full min-h-[38px] justify-items-center">
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 max-sm:px-0">
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
          The easiest way to build onchain
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
                        ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(
                            -4
                          )}`
                        : ""}
                    </span>
                    <button
                      onClick={async () => {
                        if (!walletAddress) return;
                        try {
                          await navigator.clipboard.writeText(walletAddress);
                          setCopiedAddress(true);
                          setTimeout(() => setCopiedAddress(false), 2000);
                        } catch (err) {
                          console.error("Failed to copy:", err);
                        }
                      }}
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

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Delegated signers
                    </span>
                    <Dialog
                      title="Manage delegated signers"
                      trigger={
                        <button className="text-green-600 w-fit text-sm font-medium hover:text-green-700 transition-colors text-left">
                          Manage
                        </button>
                      }
                    >
                      <DelegatedSigners />
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Funds Section */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <TransferFunds />
          </div>

          <Activity />
        </div>
      </div>
    </div>
  );
}
