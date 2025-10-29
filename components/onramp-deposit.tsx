"use client";

import React from "react";
import { Order } from "@/lib/types";
import Tooltip from "@/components/tooltip";

type Props = {
  amountUsd: string;
  setAmountUsd: (v: string) => void;
  order: Order;
  onContinue: () => void;
  children?: React.ReactNode;
};


function PricingInfo({ effectiveAmount, totalUsd }: { effectiveAmount: string | null; totalUsd: string | null }) {
  if (effectiveAmount === null || totalUsd === null) return null;

  const addedToBalance = parseFloat(effectiveAmount);
  const totalAmountUsd = parseFloat(totalUsd);
  const feesUsd = totalAmountUsd - addedToBalance;

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Added to your balance</span>
          <span className="text-gray-900 font-medium">${addedToBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Fees</span>
          <div className="flex items-center gap-2">
            {feesUsd <= 0.01 && (
              <Tooltip 
                content="No fees in staging. Contact sales to discuss rates for production."
                className="text-xs w-5 h-5 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 cursor-default"
              >
                ?
              </Tooltip>
            )}
            <span className="text-gray-900 font-medium">${feesUsd.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-900 font-medium">Total amount</span>
          <span className="text-gray-900 font-semibold text-lg">${totalAmountUsd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OnrampDeposit({
  amountUsd,
  setAmountUsd,
  order,
  onContinue,
  children,
}: Props) {
  return (
    <div className="px-6">
      <h2 className="text-lg font-semibold text-center">Deposit</h2>

      {children}

      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="text-5xl text-gray-500">$</div>
        <input
          className="text-5xl font-semibold text-gray-800 text-center outline-none min-w-[120px] max-w-[300px] w-auto"
          type="number"
          min={0}
          step={1}
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          disabled={order.status !== "not-created"}
        />
      </div>

      {order.error != null && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{order.error}</p>
            </div>
          </div>
        </div>
      )}

      <PricingInfo effectiveAmount={order.effectiveAmount} totalUsd={order.totalUsd} />

      {order.totalUsd == null && (
        <div className="mt-6">
          <button
            className="bg-black text-white rounded-full px-5 py-2 text-sm w-full disabled:opacity-50"
            onClick={onContinue}
            disabled={order.status === "creating-order"}
          >
            {order.status === "creating-order" 
              ? "Creating order..." 
              : order.error
                ? "Try Again" 
                : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}


