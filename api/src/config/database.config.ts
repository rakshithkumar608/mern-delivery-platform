import mongoose from "mongoose";

import { Env } from "./env.config";
import { logger } from "../utils/logger";

// Enable Mongoose query injection defense-in-depth per nodejs-scaffolding rules
mongoose.set("sanitizeFilter", true);

export async function connectDatabase(): Promise<void> {
  try {
    logger.info("Connecting to MongoDB...", {
      uri: Env.MONGO_URI.replace(/\/\/.*@/, "//@***:***@"),
    });
    await mongoose.connect(Env.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("Failed to connect to MongoDB", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected gracefully");
  } catch (error) {
    logger.error("Error during MongoDB disconnection", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
