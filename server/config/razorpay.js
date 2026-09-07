
import Razorpay from "razorpay";

let razorpayClient = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Online payment is optional until configured
  if (!keyId || !keySecret) {
    console.warn(
      "Razorpay is not configured. Online payments are disabled."
    );

    return null;
  }

  // Create the client only once
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}