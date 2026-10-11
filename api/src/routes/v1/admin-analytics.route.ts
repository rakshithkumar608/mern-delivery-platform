import { Router } from "express";
import { adminAnalyticsController } from "../../controllers/admin-analytics.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const adminAnalyticsRoutes = Router();

adminAnalyticsRoutes.get(
  "/overview",
  asyncHandler((req, res) => adminAnalyticsController.getOverview(req, res))
);

adminAnalyticsRoutes.get(
  "/revenue-chart",
  asyncHandler((req, res) => adminAnalyticsController.getRevenueChart(req, res))
);
