import { Request, Response, Router } from "express";
import { HttpStatus } from "../../config/http-status.config";
import { restaurantService } from "../../services/restaurant.service";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { BadRequestException } from "../../utils/app-error";

export const dishRoutes = Router();

/**
 * GET /api/v1/dishes/:id
 * Retrieve dish customization specifications, sizes, extras, removables, allergens, and restaurant context
 */
dishRoutes.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Dish ID is required");
    }

    const data = await restaurantService.getMenuItemById(id);

    res.status(HttpStatus.OK).json({
      success: true,
      item: data.item,
      restaurant: data.restaurant,
    });
  })
);

/**
 * POST /api/v1/dishes/:id/calculate
 * Calculate price breakdown based on selected size, extras, and quantity
 */
dishRoutes.post(
  "/:id/calculate",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Dish ID is required");
    }

    const { sizeLabel, extras = [], quantity = 1 } = req.body;
    const data = await restaurantService.getMenuItemById(id);
    const item = data.item;

    // Determine base price
    let sizePrice = item.price;
    if (sizeLabel && Array.isArray(item.sizes)) {
      const matched = item.sizes.find(
        (s: any) => s.label.toLowerCase() === sizeLabel.toLowerCase()
      );
      if (matched) {
        sizePrice =
          matched.price === 0 || matched.price < item.price
            ? Number((item.price + matched.price).toFixed(2))
            : matched.price;
      }
    }

    // Determine extras price
    let extrasTotal = 0;
    const resolvedExtras: Array<{ label: string; price: number }> = [];
    if (Array.isArray(extras) && Array.isArray(item.extras)) {
      for (const extraName of extras) {
        const found = item.extras.find(
          (e: any) => e.label.toLowerCase() === String(extraName).toLowerCase()
        );
        if (found) {
          extrasTotal += found.price;
          resolvedExtras.push({ label: found.label, price: found.price });
        }
      }
    }

    const unitPrice = Number((sizePrice + extrasTotal).toFixed(2));
    const finalQuantity = Math.max(1, Number(quantity) || 1);
    const totalPrice = Number((unitPrice * finalQuantity).toFixed(2));

    res.status(HttpStatus.OK).json({
      success: true,
      dishId: id,
      dishName: item.name,
      currency: data.restaurant?.currency || "£",
      size: sizeLabel || "Regular",
      sizePrice,
      extras: resolvedExtras,
      extrasTotal: Number(extrasTotal.toFixed(2)),
      unitPrice,
      quantity: finalQuantity,
      totalPrice,
    });
  })
);
