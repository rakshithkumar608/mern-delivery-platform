import { DeliveryRule, IDeliveryRule } from "../models/delivery-rule.model";
import { logger } from "../utils/logger";

const DEFAULT_RULES: IDeliveryRule = {
  driverBasePayout: 4.90,
  driverPerKmRate: 1.20,
  driverMinPayout: 5.00,
  customerBaseDeliveryFee: 1.49,
  freeDeliveryThreshold: 10.00,
  currency: "£",
};

export interface DriverPayoutCalculation {
  baseFee: number;
  distanceFee: number;
  totalFee: number;
  distanceKm: number;
  currency: string;
}

export class DeliveryRuleService {
  /**
   * Get active delivery rules from DB, initializing default if not found
   */
  async getDeliveryRules(): Promise<IDeliveryRule> {
    try {
      let rules = await DeliveryRule.findOne().exec();
      if (!rules) {
        rules = await DeliveryRule.create(DEFAULT_RULES);
        logger.info("Initialized default platform delivery rules", { rules: DEFAULT_RULES });
      }
      return rules.toObject();
    } catch (error) {
      logger.error("Failed to fetch delivery rules, falling back to defaults", { error });
      return DEFAULT_RULES;
    }
  }

  /**
   * Update delivery rules (Admin action)
   */
  async updateDeliveryRules(
    updates: Partial<IDeliveryRule>,
    updatedBy = "admin"
  ): Promise<IDeliveryRule> {
    let rules = await DeliveryRule.findOne().exec();
    if (!rules) {
      rules = new DeliveryRule({ ...DEFAULT_RULES, ...updates, updatedBy });
    } else {
      if (updates.driverBasePayout !== undefined) rules.driverBasePayout = Number(updates.driverBasePayout);
      if (updates.driverPerKmRate !== undefined) rules.driverPerKmRate = Number(updates.driverPerKmRate);
      if (updates.driverMinPayout !== undefined) rules.driverMinPayout = Number(updates.driverMinPayout);
      if (updates.customerBaseDeliveryFee !== undefined) rules.customerBaseDeliveryFee = Number(updates.customerBaseDeliveryFee);
      if (updates.freeDeliveryThreshold !== undefined) rules.freeDeliveryThreshold = Number(updates.freeDeliveryThreshold);
      if (updates.currency !== undefined && updates.currency.trim()) rules.currency = updates.currency.trim();
      rules.updatedBy = updatedBy;
    }

    await rules.save();
    logger.info("Admin updated platform delivery rules", { updatedBy, rules: rules.toObject() });
    return rules.toObject();
  }

  /**
   * Calculate driver payout for a specific distance using current active rules
   */
  async calculateDriverPayout(distanceKm = 1.0): Promise<DriverPayoutCalculation> {
    const rules = await this.getDeliveryRules();
    const distance = Math.max(0.1, Number(distanceKm) || 1.0);
    const baseFee = Number(rules.driverBasePayout) || 4.90;
    const distanceFee = Number((distance * (rules.driverPerKmRate || 1.20)).toFixed(2));
    const rawTotal = Number((baseFee + distanceFee).toFixed(2));
    const minPayout = Number(rules.driverMinPayout) || 5.00;
    const totalFee = Math.max(minPayout, rawTotal);

    return {
      baseFee,
      distanceFee,
      totalFee,
      distanceKm: Number(distance.toFixed(1)),
      currency: rules.currency || "£",
    };
  }
}

export const deliveryRuleService = new DeliveryRuleService();
