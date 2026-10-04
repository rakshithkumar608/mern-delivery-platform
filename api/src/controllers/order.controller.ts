import { Request, Response } from "express";
import { HttpStatus } from "../config/http-status.config";
import { orderService } from "../services/order.service";
import { BadRequestException } from "../utils/app-error";

export class OrderController {
  private getIdentifier(req: Request): string {
    const user = (req as any).user;
    if (user && user._id) return String(user._id);
    if (user && user.id) return String(user.id);
    const headerSession = req.headers["x-session-id"];
    if (typeof headerSession === "string" && headerSession.trim()) {
      return headerSession.trim();
    }
    return "guest_default_session";
  }

  createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const user = (req as any).user;
    const session = await orderService.createCheckoutSession(
      identifier,
      req.body,
      user
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: session,
    });
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    if (!orderId) {
      throw new BadRequestException("Order ID is required");
    }

    const order = await orderService.getOrderById(orderId);
    res.status(HttpStatus.OK).json({
      success: true,
      order,
    });
  };

  listUserOrders = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const orders = await orderService.getUserOrders(identifier);

    res.status(HttpStatus.OK).json({
      success: true,
      count: orders.length,
      orders,
    });
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const { status, title, note } = req.body;

    if (!orderId) {
      throw new BadRequestException("Order ID is required");
    }
    if (!status) {
      throw new BadRequestException("Status is required");
    }

    const order = await orderService.updateOrderStatus(orderId, status, title, note);
    res.status(HttpStatus.OK).json({
      success: true,
      order,
    });
  };

  getReadyOrders = async (_req: Request, res: Response): Promise<void> => {
    const orders = await orderService.getReadyOrders();
    res.status(HttpStatus.OK).json({
      success: true,
      count: orders.length,
      orders,
    });
  };

  claimOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    if (!orderId) {
      throw new BadRequestException("Order ID is required");
    }

    const user = (req as any).user;
    const driverData = user ? {
      id: user._id || user.id,
      name: user.name || "Tunde A.",
      phone: user.phone || "+44 7700 900111",
      avatar: user.avatar,
    } : undefined;

    const order = await orderService.claimOrder(orderId, driverData);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Delivery claimed successfully",
      order,
    });
  };

  updateDriverStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const { status, note } = req.body;

    if (!orderId) {
      throw new BadRequestException("Order ID is required");
    }
    if (!status) {
      throw new BadRequestException("Status is required");
    }

    const order = await orderService.updateDriverOrderStatus(orderId, status, note);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Delivery updated to ${status}`,
      order,
    });
  };

  getDriverHistory = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    const driverName = user?.name || "Tunde A.";
    const orders = await orderService.getDriverHistory(driverName);
    res.status(HttpStatus.OK).json({
      success: true,
      count: orders.length,
      orders,
    });
  };
}

export const orderController = new OrderController();
