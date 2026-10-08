import { Document, Schema, model } from "mongoose";

export interface IDeliveryRule {
  driverBasePayout: number;        // Base courier pay per trip (default £4.90)
  driverPerKmRate: number;         // Rate paid to courier per kilometer (default £1.20)
  driverMinPayout: number;         // Minimum guaranteed courier payout per delivery (default £5.00)
  customerBaseDeliveryFee: number; // Base delivery fee charged to customer when below threshold (default £1.49)
  freeDeliveryThreshold: number;   // Customer basket subtotal needed for free delivery (default £10.00)
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
    customerBaseDeliveryFee: { type: Number, default: 1.49, min: 0 },
    freeDeliveryThreshold: { type: Number, default: 10.00, min: 0 },
    currency: { type: String, default: "£" },
    updatedBy: { type: String, default: "system" },
  },
  { timestamps: true }
);

export const DeliveryRule = model<IDeliveryRuleDocument>(
  "DeliveryRule",
  deliveryRuleSchema
);
