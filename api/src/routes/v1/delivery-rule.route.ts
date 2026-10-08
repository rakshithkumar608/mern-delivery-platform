import { Router } from "express";
import { deliveryRuleController } from "../../controllers/delivery-rule.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const deliveryRuleRoutes = Router();

// Public / Driver app routes
deliveryRuleRoutes.get("/", asyncHandler(deliveryRuleController.getRules));
deliveryRuleRoutes.post("/calculate", asyncHandler(deliveryRuleController.calculatePayout));

// Admin management routes
deliveryRuleRoutes.put("/", asyncHandler(deliveryRuleController.updateRules));
