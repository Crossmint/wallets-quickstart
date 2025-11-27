import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getMint,
} from "@solana/spl-token";
import { convertAmountToBaseUnits } from "./utils";

/**
 * Send USDC from payer to a main recipient, and a fixed fee to a fee recipient.
 *
 * @param connection      Solana RPC connection
 * @param payer           PublicKey paying for fees and sending tokens
 * @param tokenMint       PublicKey of the USDC mint
 * @param recipient       Main recipient's wallet (SOL address)
 * @param feeRecipient    Fee recipient's wallet (SOL address)
 * @param totalAmount     Total amount of USDC to send (as a string, e.g. "1.5" for 1.5 tokens)
 * @param feeAmount       Fixed fee amount to send to fee recipient (as a string, e.g. "0.01" for 0.01 tokens)
 */
export async function createTransferTxWithFeeSplit(
  connection: Connection,
  payer: PublicKey,
  tokenMint: PublicKey,
  recipient: PublicKey,
  feeRecipient: PublicKey,
  totalAmount: string,
  feeAmount: string
): Promise<VersionedTransaction> {
  // Get token decimals and convert amounts to base units (without floating point errors)
  const mintInfo = await getMint(connection, tokenMint);
  const totalAmountBaseUnits = convertAmountToBaseUnits(
    totalAmount,
    mintInfo.decimals
  );
  const feeAmountBaseUnits = convertAmountToBaseUnits(
    feeAmount,
    mintInfo.decimals
  );

  // Validate that fee doesn't exceed total amount
  if (feeAmountBaseUnits >= totalAmountBaseUnits) {
    throw new Error("Fee amount must be less than total amount");
  }

  // Amount going to fee recipient (fixed fee)
  // Remainder goes to main recipient
  const recipientAmount = totalAmountBaseUnits - feeAmountBaseUnits;

  if (recipientAmount <= BigInt(0)) {
    throw new Error("Recipient amount must be > 0 after fee split");
  }

  const instructions: TransactionInstruction[] = [];

  // 1. Resolve payer's ATA for USDC (must already exist + have balance)
  const payerTokenAta = await getAssociatedTokenAddress(tokenMint, payer, true);

  // 2. Resolve / create recipient ATA
  const recipientTokenAta = await getAssociatedTokenAddress(
    tokenMint,
    recipient
  );

  const recipientAtaInfo = await connection.getAccountInfo(recipientTokenAta);
  if (!recipientAtaInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payer, // payer (funds account creation)
        recipientTokenAta, // ATA to be created
        recipient, // owner of the ATA
        tokenMint // token mint
      )
    );
  }

  // 3. Resolve / create fee recipient ATA
  const feeRecipientUsdcAta = await getAssociatedTokenAddress(
    tokenMint,
    feeRecipient,
    true
  );

  const feeRecipientAtaInfo = await connection.getAccountInfo(
    feeRecipientUsdcAta
  );
  if (!feeRecipientAtaInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        feeRecipientUsdcAta,
        feeRecipient,
        tokenMint
      )
    );
  }

  // 4. Transfer to recipient
  instructions.push(
    createTransferInstruction(
      payerTokenAta, // source
      recipientTokenAta, // destination
      payer, // owner of source
      Number(recipientAmount), // amount (must fit in number; use BigInt-safe logic if extremely large)
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // 5. Transfer fee to fee recipient (if non-zero)
  if (feeAmountBaseUnits > BigInt(0)) {
    console.log("Transferring fee to fee recipient", feeAmountBaseUnits);
    instructions.push(
      createTransferInstruction(
        payerTokenAta,
        feeRecipientUsdcAta,
        payer,
        Number(feeAmountBaseUnits),
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  const { blockhash } = await connection.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  return tx;
}
