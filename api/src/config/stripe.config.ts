import Stripe from "stripe";
import { Env, validateStripeEnv } from "./env.config";
import { logger } from "../utils/logger";

// Enforce production validation immediately on module load
validateStripeEnv();

export const isStripeMock =
  Env.NODE_ENV !== "production" &&
  (!Env.STRIPE_SECRET_KEY ||
    Env.STRIPE_SECRET_KEY.includes("mock") ||
    !Env.STRIPE_SECRET_KEY.startsWith("sk_"));

if (isStripeMock) {
  logger.warn(
    "Running in DEVELOPMENT with Stripe mock/simulator mode. Set valid STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to test live Stripe."
  );
}

// Initialize Stripe SDK instance
export const stripe = new Stripe(
  isStripeMock ? "sk_test_mock_secret_key_1234567890" : Env.STRIPE_SECRET_KEY,
  {
    apiVersion: "2025-02-24.acacia" as any,
    typescript: true,
  }
);
