import { Request, Response } from "express";
import { HttpStatus } from "../config/http-status.config";
import { basketService } from "../services/basket.service";
import { BadRequestException } from "../utils/app-error";

export class BasketController {
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

  getBasket = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const basket = await basketService.getBasket(identifier);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    if (!req.body.name || req.body.price === undefined) {
      throw new BadRequestException("Item name and price are required");
    }
    const basket = await basketService.addItem(identifier, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };

  updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    if (!itemId) {
      throw new BadRequestException("Item ID is required");
    }
    const { quantity } = req.body;
    if (quantity === undefined || typeof quantity !== "number") {
      throw new BadRequestException("Quantity number is required");
    }
    const basket = await basketService.updateItemQuantity(identifier, itemId, quantity);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    if (!itemId) {
      throw new BadRequestException("Item ID is required");
    }
    const basket = await basketService.removeItem(identifier, itemId);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };

  updatePreferences = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const basket = await basketService.updatePreferences(identifier, req.body);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };

  clearBasket = async (req: Request, res: Response): Promise<void> => {
    const identifier = this.getIdentifier(req);
    const basket = await basketService.clearBasket(identifier);
    res.status(HttpStatus.OK).json({
      success: true,
      basket,
    });
  };
}

export const basketController = new BasketController();
