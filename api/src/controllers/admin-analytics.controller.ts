import { Request, Response } from "express";
import { adminAnalyticsService } from "../services/admin-analytics.service";

export class AdminAnalyticsController {
  /**
   * GET /api/v1/admin/analytics/overview
   * Returns aggregated KPI metrics, status distribution, recent orders, and live events.
   */
  async getOverview(_req: Request, res: Response): Promise<void> {
    const data = await adminAnalyticsService.getDashboardOverview();
    res.status(200).json({
      success: true,
      data,
    });
  }

  /**
   * GET /api/v1/admin/analytics/revenue-chart?timeframe=7d|30d|90d
   * Returns time-series revenue and commission data points.
   */
  async getRevenueChart(req: Request, res: Response): Promise<void> {
    const timeframe = typeof req.query.timeframe === "string" ? req.query.timeframe : "7d";
    const data = await adminAnalyticsService.getRevenueChart(timeframe);
    res.status(200).json({
      success: true,
      data,
    });
  }
}

export const adminAnalyticsController = new AdminAnalyticsController();
