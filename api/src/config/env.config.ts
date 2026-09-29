import dotenv from "dotenv";

import { getEnv } from "../utils/get-env";

dotenv.config();

export const Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/chowly",
  JWT_SECRET: getEnv("JWT_SECRET", "chowly_jwt_super_secret_key_2026_dev"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),

  
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", ""),

  // Stripe Configuration
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY", ""),
  STRIPE_PUBLISHABLE_KEY: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET", ""),
};

/**
 * Validates Stripe configuration.
 * Mock/placeholder keys are only permitted when NODE_ENV !== "production".
 * In production, missing or mock keys abort startup immediately.
 */
export const validateStripeEnv = (): void => {
  const isProd = Env.NODE_ENV === "production";
  const hasRealSecret = Boolean(
    Env.STRIPE_SECRET_KEY &&
      !Env.STRIPE_SECRET_KEY.includes("mock") &&
      Env.STRIPE_SECRET_KEY.startsWith("sk_")
  );
  const hasRealWebhook = Boolean(
    Env.STRIPE_WEBHOOK_SECRET &&
      !Env.STRIPE_WEBHOOK_SECRET.includes("mock") &&
      Env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")
  );

  if (isProd && (!hasRealSecret || !hasRealWebhook)) {
    throw new Error(
      "FATAL: Valid STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are strictly required in production! Startup aborted."
    );
  }
};
