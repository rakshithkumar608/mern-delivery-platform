import { Router } from "express";
import { paymentController } from "../../controllers/payment.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const paymentRoutes = Router();

// Dev simulator for webhook events (only allowed when NODE_ENV !== "production")
paymentRoutes.post("/simulate-webhook", asyncHandler(paymentController.simulateWebhookSuccess));
