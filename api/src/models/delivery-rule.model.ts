import { Document, Schema, model } from "mongoose";

export interface IDeliveryRule {
  driverBasePayout: number;        // Base courier pay per trip (default £4.90)
  driverPerKmRate: number;         // Rate paid to courier per kilometer (default £1.20)
  driverMinPayout: number;         // Minimum guaranteed courier payout per delivery (default £5.00)
  platformCommissionRate: number;  // Platform commission % deducted (e.g. 15%)
  customerDeliveryFee: number;     // Standard customer delivery fee (default £1.49)
  currency: string;                // Currency symbol (default "£")
  updatedBy?: string;
  updatedAt?: Date;
}

export interface IDeliveryRuleDocument extends IDeliveryRule, Document {}

const deliveryRuleSchema = new Schema<IDeliveryRuleDocument>(
  {
    driverBasePayout: { type: Number, default: 4.90, min: 0 },
    driverPerKmRate: { type: Number, default: 1.20, min: 0 },
    driverMinPayout: { type: Number, default: 5.00, min: 0 },
    platformCommissionRate: { type: Number, default: 15, min: 0, max: 100 },
    customerDeliveryFee: { type: Number, default: 1.49, min: 0 },
    currency: { type: String, default: "£" },
    updatedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export const DeliveryRule = model<IDeliveryRuleDocument>(
  "DeliveryRule",
  deliveryRuleSchema
);
