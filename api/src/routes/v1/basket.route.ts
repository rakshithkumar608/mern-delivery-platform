import { Router } from "express";
import { basketController } from "../../controllers/basket.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const basketRoutes = Router();

// Retrieve current basket
basketRoutes.get("/", asyncHandler(basketController.getBasket));

// Add item to basket
basketRoutes.post("/items", asyncHandler(basketController.addItem));

// Update item quantity
basketRoutes.patch("/items/:itemId", asyncHandler(basketController.updateItemQuantity));

// Remove item from basket
basketRoutes.delete("/items/:itemId", asyncHandler(basketController.removeItem));

// Update order preferences (cutlery, promo code, notes)
basketRoutes.patch("/preferences", asyncHandler(basketController.updatePreferences));

// Clear entire basket
basketRoutes.delete("/", asyncHandler(basketController.clearBasket));
