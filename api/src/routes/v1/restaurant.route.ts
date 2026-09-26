import { Router } from "express";
import { restaurantController } from "../../controllers/restaurant.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const restaurantRoutes = Router();

// Public routes
restaurantRoutes.get("/", asyncHandler(restaurantController.getRestaurants));
restaurantRoutes.get(
  "/featured",
  asyncHandler(restaurantController.getFeaturedRestaurants)
);
restaurantRoutes.get(
  "/menu/:id",
  asyncHandler(restaurantController.getMenuItemById)
);
restaurantRoutes.get("/:id", asyncHandler(restaurantController.getRestaurantById));

// Admin/Management endpoints
restaurantRoutes.post("/", asyncHandler(restaurantController.createRestaurant));
restaurantRoutes.put("/:id", asyncHandler(restaurantController.updateRestaurant));
restaurantRoutes.delete("/:id", asyncHandler(restaurantController.deleteRestaurant));

// Menu items
restaurantRoutes.post(
  "/:id/menu",
  asyncHandler(restaurantController.createMenuItem)
);
restaurantRoutes.put(
  "/menu/:id",
  asyncHandler(restaurantController.updateMenuItem)
);
restaurantRoutes.delete(
  "/menu/:id",
  asyncHandler(restaurantController.deleteMenuItem)
);
