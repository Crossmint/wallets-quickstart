"use client";

import { useState } from "react";
import { useWallet, EVMWallet } from "@crossmint/client-sdk-react-ui";

type Props = {
  productId: string | number;
  currentOwnerEmail?: string;
};

export default function TransferDialog({ productId }: Props) {
  const { wallet } = useWallet(); // Crossmint client SDK
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const validAddr = /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  const validEmail = !!email && /\S+@\S+\.\S+/.test(email);
  const canSubmit = (validEmail && !address) || (validAddr && !email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setResultUrl(null);

    console.groupCollapsed("[transferDialog] submit");
    console.debug("[transferDialog] toEmail?", validEmail ? email : null);
    console.debug("[transferDialog] toAddress?", validAddr ? address : null);

    try {
      // 1) Create in backend (Strapi)
      console.time("[transferDialog] POST /transfer");
      const r = await fetch(`/api/products/${productId}/transfer`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          validEmail ? { toUserEmail: email.trim() } : { toAddress: address.trim() }
        ),
      });
      console.timeEnd("[transferDialog] POST /transfer");

      const data: any = await r.json().catch(() => ({}));
      console.debug("[transferDialog] transfer response:", data);

      if (!r.ok || !data?.ok) {
        const msg =
          data?.error?.message ||
          data?.message ||
          (r.status === 401
            ? "No autenticado. Inicia sesión y vuelve a intentarlo."
            : "Transferencia fallida");
        alert(msg);
        console.groupEnd();
        setLoading(false);
        return;
      }

      // 2) Requires approval (signature)?
      const pending = data?.approvals?.pending?.[0];
      const needsApproval =
        data?.onChain?.status === "awaiting-approval" ||
        data?.status === "awaiting-approval";

      console.debug("[transferDialog] needsApproval:", needsApproval, " pending?:", !!pending);
      console.debug("[transferDialog] pending approval:", pending);

      if (needsApproval && pending) {
        const messageRaw = pending?.message;
        const signerLocator: string | undefined = pending?.signer?.locator; // "email:..."
        const fromWallet: string | undefined = data?.fromWallet; // 0x...
        const txId: string | undefined = data?.tx?.id || data?.id;

        if (!wallet) {
          alert("No se pudo acceder al wallet de Crossmint. Abre tu sesión de wallet e inténtalo de nuevo.");
          console.groupEnd();
          setLoading(false);
          return;
        }
        if (!messageRaw || !fromWallet || !txId) {
          alert("Faltan datos para aprobar: message/fromWallet/txId.");
          console.groupEnd();
          setLoading(false);
          return;
        }

        // Sign the approval message (Crossmint → userOperationHash 0x… of 32 bytes)
        const msgHex = pending?.message as `0x${string}`;

        if (typeof msgHex !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(msgHex)) {
          alert("Formato de mensaje inválido: se espera 0x + 64 hex (32 bytes).");
          console.groupEnd();
          setLoading(false);
          return;
        }

        const evmWallet = EVMWallet.from(wallet);

        console.group("DEBUG: Testing Crossmint signing behavior");
        console.log("userOperationHash to sign:", msgHex);
        console.log("Length:", msgHex.length, "chars");

        // Sign with the Crossmint wallet
        const rSig: any = await evmWallet.signMessage({ message: msgHex });

        // Normalize signature/ID
        const sigHex: string | undefined =
          typeof rSig === "string" ? rSig : rSig?.signature;
        let signature = sigHex;
        let signatureId = typeof rSig === "string" ? undefined : rSig?.signatureId;

        console.log("Resulting signature:", sigHex);
        console.log("Signature length:", sigHex?.length ?? 0, "chars");

        // Does it look like ECDSA (65 bytes)? Then we try EIP-191 recovery.
        // Note: Crossmint usually returns ERC-6492 -> won't be 65 bytes and this part is skipped.
        try {
          const looksLike65Bytes =
            typeof sigHex === "string" && /^0x[0-9a-fA-F]{130}$/.test(sigHex);

          if (!looksLike65Bytes) {
            console.info("ℹ️ Not a plain 65-byte ECDSA; likely an ERC-6492 envelope. Skipping EIP-191 recovery.");
          } else {
            const ethersMod: any = await import("ethers");
            const verify =
              ethersMod?.verifyMessage /** v6 **/ ?? ethersMod?.utils?.verifyMessage; /** v5 **/

            if (typeof verify === "function") {
              const recoveredAddr = verify(msgHex, sigHex);
              console.log("Recovered address (EIP-191):", recoveredAddr);
            } else {
              console.log("ℹ️ ethers verifyMessage not available in this version.");
            }
          }
        } catch (err: any) {
          console.log("EIP-191 recovery failed:", err?.message ?? err);
        }
        console.groupEnd();

        if (!signature || !/^0x[0-9a-fA-F]+$/.test(signature)) {
          alert("Firma inválida devuelta por el wallet.");
          console.groupEnd();
          setLoading(false);
          return;
        }
        console.debug("[transferDialog] signature:", signature, "signatureId:", signatureId);


        if (!signature) {
          alert("No se pudo obtener la firma.");
          console.groupEnd();
          setLoading(false);
          return;
        }

        // 3) Send approval to your backend
        console.time("[transferDialog] POST /transfer/approve");
        const approveRes = await fetch(`/api/products/${productId}/transfer/approve`, {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromWallet,
            txId: txId,
            signer: pending.signer.locator, // "email:jonunibaso@gmail.com"
            signature,                      // <-- from signMessage() (65 bytes)
            signatureId,                    // <-- the UUID returned
          }),
        });
        const approveJson = await approveRes.json().catch(() => ({}));
        console.timeEnd("[transferDialog] POST /transfer/approve");

        if (!approveRes.ok) {
          alert(approveJson?.error?.message || approveJson?.message || "Error al enviar la aprobación");
          console.groupEnd();
          setLoading(false);
          return;
        }

        const tokenUrl: string | undefined = data?.explorer?.token || data?.onChain?.tokenUrl;
        setResultUrl(tokenUrl ?? null);
        alert("Aprobación firmada y enviada. La transacción pasará a pending/success al minarse.");
        console.groupEnd();
        setLoading(false);
        return;
      }

      // 3) Direct success (no approvals)
      const tokenUrl: string | undefined = data?.explorer?.token || data?.onChain?.tokenUrl;
      setResultUrl(tokenUrl ?? null);
      alert("Transferencia iniciada correctamente.");
      console.groupEnd();
    } catch (err: any) {
      console.warn("[transferDialog] error", err);
      alert(err?.message || "Error de red");
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        aria-label="Transferir NFT"
        className="px-3 py-1 rounded-xl bg-pink-600 text-white text-sm hover:bg-pink-500 disabled:opacity-50"
        onClick={() => {
          setEmail("");
          setAddress("");
          setOpen(true);
        }}
      >
        Transferir
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-5 shadow-xl">
            <h2 className="text-lg font-semibold mb-3 text-white">Transferir NFT</h2>
            <p className="text-sm text-neutral-300 mb-4">
              Introduce <strong>email</strong> de un usuario de Bakarts DPP <em>(usará su walletAddress)</em> o una <strong>dirección 0x</strong>.
            </p>

            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block">
                <span className="text-sm text-neutral-300">Email destino</span>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white outline-none"
                  placeholder="ej. jon@bakarts.io"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (e.target.value) setAddress(""); }}
                  aria-label="Email del destinatario"
                />
              </label>

              <div className="text-center text-neutral-400 text-sm">o</div>

              <label className="block">
                <span className="text-sm text-neutral-300">Dirección 0x destino</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-white outline-none"
                  placeholder="0x..."
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); if (e.target.value) setEmail(""); }}
                  aria-label="Dirección destino"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl bg-neutral-700 text-white">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="px-3 py-2 rounded-xl bg-pink-600 text-white disabled:opacity-50"
                  aria-busy={loading}
                >
                  {loading ? "Transfiriendo..." : "Confirmar"}
                </button>
              </div>
            </form>

            {resultUrl && (
              <div className="mt-4 text-sm">
                <a href={resultUrl} target="_blank" rel="noreferrer" className="underline text-blue-400 break-all">
                  Ver NFT en Polygonscan
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
