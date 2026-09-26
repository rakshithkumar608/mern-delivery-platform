import { Request, Response } from "express";
import { HttpStatus } from "../config/http-status.config";
import { restaurantService } from "../services/restaurant.service";
import { BadRequestException } from "../utils/app-error";

export class RestaurantController {
  getRestaurants = async (req: Request, res: Response): Promise<void> => {
    const { isFeatured, cuisine, category, search, limit, page } = req.query;

    const options = {
      isFeatured:
        isFeatured !== undefined ? isFeatured === "true" || isFeatured === "1" : undefined,
      cuisine: typeof cuisine === "string" ? cuisine : undefined,
      category: typeof category === "string" ? category : undefined,
      search: typeof search === "string" ? search : undefined,
      limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
      page: typeof page === "string" ? parseInt(page, 10) : undefined,
    };

    const result = await restaurantService.getRestaurants(options);

    res.status(HttpStatus.OK).json({
      success: true,
      count: result.restaurants.length,
      total: result.total,
      restaurants: result.restaurants,
    });
  };

  getFeaturedRestaurants = async (_req: Request, res: Response): Promise<void> => {
    const result = await restaurantService.getRestaurants({ isFeatured: true, limit: 10 });
    res.status(HttpStatus.OK).json({
      success: true,
      count: result.restaurants.length,
      restaurants: result.restaurants,
    });
  };

  getRestaurantById = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Restaurant identifier parameter is required");
    }

    const data = await restaurantService.getRestaurantByIdOrSlug(id);

    res.status(HttpStatus.OK).json({
      success: true,
      ...data,
    });
  };

  createRestaurant = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await restaurantService.createRestaurant(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      restaurant,
    });
  };

  updateRestaurant = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Restaurant ID is required");
    }
    const restaurant = await restaurantService.updateRestaurant(id, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      restaurant,
    });
  };

  deleteRestaurant = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Restaurant ID is required");
    }
    await restaurantService.deleteRestaurant(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  };

  createMenuItem = async (req: Request, res: Response): Promise<void> => {
    const item = await restaurantService.createMenuItem(req.body);
    res.status(HttpStatus.CREATED).json({
      success: true,
      item,
    });
  };

  updateMenuItem = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Menu item ID is required");
    }
    const item = await restaurantService.updateMenuItem(id, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      item,
    });
  };

  deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Menu item ID is required");
    }
    await restaurantService.deleteMenuItem(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  };
}

export const restaurantController = new RestaurantController();
