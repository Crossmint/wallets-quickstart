import { OnrampStatus } from "./useCrossmintOnramp";

export type Order = {
  status: OnrampStatus;
  error: string | null;
  totalUsd: string | null;
  effectiveAmount: string | null;
};

// API Response Types
export type CreateOrderResponse = {
  clientSecret: string;
  order: {
    orderId: string;
    payment: {
      status: string;
    };
    lineItems: Array<{
      quote: {
        totalPrice: {
          amount: string;
        };
        quantityRange: {
          lowerBound: string;
          upperBound: string;
        };
      };
    }>;
    quote: {
      totalPrice: {
        amount: string;
      };
    };
  };
};

export type ApiErrorResponse = {
  error: string;
  details?: any;
};
