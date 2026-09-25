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
};
