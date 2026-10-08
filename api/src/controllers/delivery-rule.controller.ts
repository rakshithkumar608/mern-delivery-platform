import { Request, Response } from "express";
import { deliveryRuleService } from "../services/delivery-rule.service";

export class DeliveryRuleController {
  /**
   * GET /api/v1/delivery-rules
   * Retrieve platform delivery rules and driver payout settings
   */
  async getRules(_req: Request, res: Response): Promise<void> {
    const rules = await deliveryRuleService.getDeliveryRules();
    res.status(200).json({
      success: true,
      rules,
    });
  }

  /**
   * PUT /api/v1/delivery-rules
   * Admin updates driver payout and customer delivery fee configuration
   */
  async updateRules(req: Request, res: Response): Promise<void> {
    const adminUser = (req as any).user;
    const updatedBy = adminUser?.email || adminUser?.name || "admin";

    const rules = await deliveryRuleService.updateDeliveryRules(req.body, updatedBy);
    res.status(200).json({
      success: true,
      message: "Delivery and driver payout rules updated successfully",
      rules,
    });
  }

  /**
   * POST /api/v1/delivery-rules/calculate
   * Compute dynamic driver payout for a given distance
   */
  async calculatePayout(req: Request, res: Response): Promise<void> {
    const { distanceKm } = req.body;
    const payout = await deliveryRuleService.calculateDriverPayout(distanceKm);
    res.status(200).json({
      success: true,
      payout,
    });
  }
}

export const deliveryRuleController = new DeliveryRuleController();
