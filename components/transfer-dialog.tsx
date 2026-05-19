"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";

// Token to transfer — configurable via env or defaults to usdxm (Crossmint test stablecoin)
const TOKEN = process.env.NEXT_PUBLIC_TRANSFER_TOKEN || "usdxm";

export default function TransferDialog() {
  const { wallet } = useWallet();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [explorerLink, setExplorerLink] = useState<string | null>(null);

  const validAddr = /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  const validEmail = !!email && /\S+@\S+\.\S+/.test(email);
  const hasRecipient = (validEmail && !address) || (validAddr && !email);
  const amountNum = parseFloat(amount);
  const validAmount = !isNaN(amountNum) && amountNum > 0;
  const canSubmit = hasRecipient && validAmount;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading || !wallet) return;

    setLoading(true);
    setExplorerLink(null);

    // Resolve recipient: email-based user locator or raw 0x address
    const recipient = validEmail
      ? `email:${email.trim()}`
      : address.trim();

    console.groupCollapsed("[transferDialog] submit");
    console.debug("[transferDialog] recipient:", recipient);
    console.debug("[transferDialog] token:", TOKEN, "amount:", amount);

    try {
      // Use the SDK's wallet.send() which handles the full flow:
      // create transaction → sign userOpHash → submit approval → mine
      // This is the same flow that triggers the AA23 revert in WAL-6433
      console.time("[transferDialog] wallet.send");
      const txn = await wallet.send(recipient, TOKEN, amount);
      console.timeEnd("[transferDialog] wallet.send");

      console.debug("[transferDialog] transaction result:", txn);
      setExplorerLink(txn.explorerLink);
      alert("Transfer initiated successfully.");
      console.groupEnd();
    } catch (err: any) {
      console.warn("[transferDialog] error:", err);

      // Log detailed error info for debugging the AA23 revert
      if (err?.message?.includes("execution_reverted") || err?.message?.includes("AA23")) {
        console.group("DEBUG: AA23 Revert Details");
        console.log("Error name:", err?.name);
        console.log("Error message:", err?.message);
        console.log("Revert data:", err?.revert ?? err?.data);
        console.log("Full error:", JSON.stringify(err, null, 2));
        console.groupEnd();
      }

      if (err instanceof Error && err.name === "AuthRejectedError") {
        // User rejected the signing prompt
        console.groupEnd();
        setLoading(false);
        return;
      }

      alert(err?.message || "Transfer failed");
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        aria-label="Transfer ERC-20"
        className="px-3 py-1 rounded-xl bg-pink-600 text-white text-sm hover:bg-pink-500 disabled:opacity-50"
        onClick={() => {
          setEmail("");
          setAddress("");
          setAmount("");
          setOpen(true);
        }}
      >
        Transfer (WAL-6433)
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Transfer ERC-20</h2>
            <p className="text-sm text-neutral-300 mb-4">
              Send <strong>{TOKEN}</strong> to an <strong>email</strong> (user locator) or a <strong>0x address</strong>.
            </p>

            <form onSubmit={onSubmit} className="space-y-3">
              {/* Amount */}
              <label className="block">
                <span className="text-sm text-neutral-300">Amount</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white outline-none"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-label="Amount"
                />
              </label>

              {/* Email recipient */}
              <label className="block">
                <span className="text-sm text-neutral-300">Recipient email</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white outline-none"
                  placeholder="e.g. user@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (e.target.value) setAddress(""); }}
                  aria-label="Recipient email"
                />
              </label>

              <div className="text-center text-neutral-400 text-sm">or</div>

              {/* 0x address recipient */}
              <label className="block">
                <span className="text-sm text-neutral-300">Recipient 0x address</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white outline-none"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); if (e.target.value) setEmail(""); }}
                  aria-label="Recipient address"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-neutral-700 text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="px-3 py-2 rounded-xl bg-pink-600 text-white disabled:opacity-50"
                  aria-busy={loading}
                >
                  {loading ? "Transferring..." : "Confirm"}
                </button>
              </div>
            </form>

            {explorerLink && !loading && (
              <div className="mt-4 text-sm">
                <a href={explorerLink} target="_blank" rel="noreferrer" className="underline text-blue-400 break-all">
                  View transaction on explorer
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
