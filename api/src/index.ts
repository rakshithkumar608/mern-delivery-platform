import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "passport";

import { connectDatabase, disconnectDatabase } from "./config/database.config";
import { Env } from "./config/env.config";
import { configurePassport } from "./config/passport.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { routes } from "./routes/v1";
import { logger } from "./utils/logger";

const app = express();

// ─── Passport Strategy Configuration ─────────────────────────────────
configurePassport();

// ─── Security ────────────────────────────────────────────────────────
app.use(helmet());

// ─── Body parsing & Auth ─────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

// ─── CORS ────────────────────────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  const allowedOrigins = corsOrigin.split(",").map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(null, true); // Allow mobile app requests
        }
      },
      credentials: true,
    }),
  );
}

// ─── Health check (outside API versioning, not rate-limited) ─────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// ─── API routes ──────────────────────────────────────────────────────
app.use("/api/v1", apiLimiter, routes);

// ─── Error handling (must be last) ───────────────────────────────────
app.use(errorHandler);

// ─── Server lifecycle & Startup ──────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to database before accepting incoming requests
    await connectDatabase();

    const server = app.listen(Env.PORT, () => {
      logger.info("API listening", { port: Env.PORT });
    });

    // ─── Graceful shutdown ───────────────────────────────────────────
    const shutdownSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
    let shuttingDown = false;

    const shutdown = (signal: NodeJS.Signals) => {
      if (shuttingDown) return;
      shuttingDown = true;
      logger.info("Shutting down API", { signal });
      server.close(async (error) => {
        await disconnectDatabase();
        if (error) logger.error("Shutdown failed", { error: error.message });
        process.exitCode = error ? 1 : 0;
      });
    };

    shutdownSignals.forEach((signal) =>
      process.once(signal, () => shutdown(signal)),
    );
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

void startServer();
