"use client";

import { useEffect, useState } from "react";
import {
  useAuth,
  useWallet,
  type DelegatedSigner,
} from "@crossmint/client-sdk-react-ui";

export function DelegatedSigners() {
  const { wallet } = useWallet();
  const { jwt } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [delegatedSigners, setDelegatedSigners] = useState<DelegatedSigner[]>(
    []
  );
  const [newSigner, setNewSigner] = useState<string>("");

  useEffect(() => {
    const fetchDelegatedSigners = async () => {
      if (wallet != null) {
        setIsLoading(true);
        const delegatedSigners = await wallet.delegatedSigners();
        setDelegatedSigners(delegatedSigners);
        setIsLoading(false);
      }
    };
    fetchDelegatedSigners();
  }, [wallet, jwt]);

  const addNewSigner = async () => {
    if (wallet == null) {
      throw new Error("No wallet connected");
    }
    if (!newSigner) {
      alert("Delegated signers: no signer provided!");
      return;
    }
    try {
      setIsAdding(true);
      await wallet.addDelegatedSigner({
        signer: `external-wallet:${newSigner}`,
      });
      const delegatedSigners = await wallet.delegatedSigners();
      setDelegatedSigners(delegatedSigners);
    } catch (err) {
      console.error("Delegated signers: ", err);
      alert(`Delegated signers: ${err}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-gray-600">
          Allow third parties to sign transactions on behalf of your wallet.{" "}
          <a
            href="https://docs.crossmint.com/wallets/advanced/delegated-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors underline"
          >
            Learn more
          </a>
          .
        </p>
      </div>

      {/* Add New Signer Section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-gray-900">Add new signer</h3>
        <input
          type="text"
          value={newSigner}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter wallet address (e.g., 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8)"
          onChange={(e) => setNewSigner(e.target.value)}
        />
        <button
          className={`w-full py-3 px-4 rounded-full text-sm font-medium transition-colors ${
            isAdding || !newSigner
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
          onClick={addNewSigner}
          disabled={isAdding || !newSigner}
        >
          {isAdding ? "Adding signer..." : "Add signer"}
        </button>
      </div>

      {/* Current Signers Section */}
      {!isLoading && delegatedSigners.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-gray-900">Current signers</h3>
          <div className="bg-gray-50 rounded-lg p-3 max-h-[168px] overflow-auto">
            <div className="flex flex-col gap-2">
              {delegatedSigners.map((delegatedSigner, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-md border border-gray-100"
                >
                  <span className="font-mono text-xs text-gray-700 whitespace-nowrap max-w-full block">
                    {delegatedSigner.signer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && delegatedSigners.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No delegated signers yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add a signer to allow third-party transactions
          </p>
        </div>
      )}
    </div>
  );
}
