import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a token amount string to base units (smallest unit) using the token's decimals.
 * Uses string parsing to avoid floating point rounding errors.
 *
 * @param amount   Amount as a string (e.g. "1.5" for 1.5 tokens)
 * @param decimals Number of decimal places for the token
 * @returns Amount in base units as BigInt
 * @throws Error if the amount is invalid
 */
export function convertAmountToBaseUnits(
  amount: string,
  decimals: number
): bigint {
  // Validate and parse the amount string
  const trimmedAmount = amount.trim();
  if (
    !trimmedAmount ||
    trimmedAmount === "." ||
    trimmedAmount.startsWith("-")
  ) {
    throw new Error("amount must be a valid positive number");
  }

  // Split into integer and decimal parts
  const parts = trimmedAmount.split(".");
  if (parts.length > 2) {
    throw new Error("amount must be a valid number");
  }

  const integerPart = parts[0] || "0";
  const decimalPart = parts[1] || "";

  // Validate that both parts contain only digits
  if (
    !/^\d+$/.test(integerPart) ||
    (decimalPart && !/^\d+$/.test(decimalPart))
  ) {
    throw new Error("amount must be a valid positive number");
  }

  // Convert integer part to base units
  const integerBaseUnits =
    BigInt(integerPart) * BigInt(10) ** BigInt(decimals);

  // Convert decimal part to base units
  let decimalBaseUnits = BigInt(0);
  if (decimalPart) {
    // Pad or truncate decimal part to match token decimals
    const paddedDecimal = decimalPart.padEnd(decimals, "0").slice(0, decimals);
    decimalBaseUnits = BigInt(paddedDecimal);
  }

  const totalAmountBaseUnits = integerBaseUnits + decimalBaseUnits;

  if (totalAmountBaseUnits <= BigInt(0)) {
    throw new Error("amount must be greater than 0");
  }

  return totalAmountBaseUnits;
}
