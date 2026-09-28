import { Request, Response, Router } from "express";
import { HttpStatus } from "../../config/http-status.config";
import { restaurantService } from "../../services/restaurant.service";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const searchRoutes = Router();

/**
 * GET /api/v1/search
 * Unified search query across restaurants and menu dishes
 * Query params: ?q=pizza (or ?query=pizza), ?limit=15
 */
searchRoutes.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const rawQuery = (req.query.q as string) || (req.query.query as string) || "";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

    const result = await restaurantService.searchUnified(rawQuery, limit);

    res.status(HttpStatus.OK).json({
      success: true,
      query: result.query,
      count: result.total,
      restaurants: result.restaurants,
      dishes: result.dishes,
    });
  })
);
