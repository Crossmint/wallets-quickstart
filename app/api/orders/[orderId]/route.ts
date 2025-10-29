import { NextResponse } from "next/server";

const CROSSMINT_SERVER_SIDE_API_KEY = process.env.CROSSMINT_SERVER_SIDE_API_KEY as string;
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";

export async function GET(
  _req: Request,
  context: any
) {
  try {
    if (!CROSSMINT_SERVER_SIDE_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: CROSSMINT_SERVER_SIDE_API_KEY missing" },
        { status: 500 }
      );
    }

    const { orderId } = (context?.params as { orderId: string });
    const response = await fetch(
      `https://${CROSSMINT_ENV}.crossmint.com/api/2022-06-09/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CROSSMINT_SERVER_SIDE_API_KEY,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch order", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error fetching order", details: error?.message },
      { status: 500 }
    );
  }
}


