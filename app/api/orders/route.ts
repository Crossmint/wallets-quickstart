import { NextRequest, NextResponse } from "next/server";

const CROSSMINT_SERVER_SIDE_API_KEY = process.env.CROSSMINT_SERVER_SIDE_API_KEY as string;
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";
const USDC_STAGING = "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_PROD = "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function POST(req: NextRequest) {
  try {
    if (!CROSSMINT_SERVER_SIDE_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: CROSSMINT_SERVER_SIDE_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      amount,
      receiptEmail,
      walletAddress,
    } = body;

    const tokenLocator =
      (CROSSMINT_ENV === "production" ? USDC_PROD : USDC_STAGING);

      console.log("URL: ", `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09/orders`);
    const response = await fetch(
      `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CROSSMINT_SERVER_SIDE_API_KEY,
        },
        body: JSON.stringify({
          lineItems: [
            {
              tokenLocator,
              executionParameters: {
                mode: "exact-in",
                amount,
              },
            },
          ],
          payment: {
            method: "basis-theory",
            receiptEmail,
          },
          recipient: {
            walletAddress,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to create order", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error creating order", details: error?.message },
      { status: 500 }
    );
  }
}


