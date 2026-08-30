import { payfastConfig } from "../config/payfast.js";

export const initiatePayment = async (order, payment) => {
  if (!payfastConfig.enabled) {
    // Sandbox / mock response
    return {
      success: true,
      checkoutUrl: `/payment/success?order_id=${order._id}`,
      token: "mock_token_123",
      paymentId: payment._id,
    };
  }

  // TODO: Actual implementation
  return {
    success: true,
    checkoutUrl: `https://payfast.example.com/checkout?token=real_token`,
    token: "real_token",
    paymentId: payment._id,
  };
};

export const verifySignature = (payload) => {
  if (!payfastConfig.enabled) {
    return true; // Mock verification
  }
  
  // TODO: Actual signature verification
  return true;
};
