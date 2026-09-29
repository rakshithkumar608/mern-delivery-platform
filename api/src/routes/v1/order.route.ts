import { Router } from "express";
import { orderController } from "../../controllers/order.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const orderRoutes = Router();

// Create checkout session & pre-create order
orderRoutes.post("/checkout-session", asyncHandler(orderController.createCheckoutSession));

// List current user orders
orderRoutes.get("/", asyncHandler(orderController.listUserOrders));

// Get order by ID (with formatted arrival time and tracking statusHistory)
orderRoutes.get("/:id", asyncHandler(orderController.getOrder));

// Guarded order status progression endpoint
orderRoutes.patch("/:id/status", asyncHandler(orderController.updateStatus));
