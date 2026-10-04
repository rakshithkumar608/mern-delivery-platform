import { Router } from "express";
import { orderController } from "../../controllers/order.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const orderRoutes = Router();

// Create checkout session & pre-create order
orderRoutes.post("/checkout-session", asyncHandler(orderController.createCheckoutSession));

// List current user orders
orderRoutes.get("/", asyncHandler(orderController.listUserOrders));

// Driver: list ready orders for claim
orderRoutes.get("/ready", asyncHandler(orderController.getReadyOrders));

// Driver: delivery history
orderRoutes.get("/driver/history", asyncHandler(orderController.getDriverHistory));

// Driver: claim order
orderRoutes.post("/:id/claim", asyncHandler(orderController.claimOrder));

// Driver: update driver progression (picked_up, delivered)
orderRoutes.patch("/:id/driver-status", asyncHandler(orderController.updateDriverStatus));

// Get order by ID (with formatted arrival time and tracking statusHistory)
orderRoutes.get("/:id", asyncHandler(orderController.getOrder));

// Guarded order status progression endpoint
orderRoutes.patch("/:id/status", asyncHandler(orderController.updateStatus));

