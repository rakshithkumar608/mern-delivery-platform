import { Document, Schema, Types, model } from "mongoose";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

export interface IOrderStatusHistory {
  status: OrderStatus;
  title: string;
  note?: string;
  timestamp: Date;
}

export interface IDriverInfo {
  id: string;
  name: string;
  role?: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRatings: number;
  vehicleType?: string;
  plateNumber?: string;
}

export interface IOrderItem {
  name: string;
  subtitle?: string;
  image: string;
  price: number; // in INR
  quantity: number;
  selectedSize?: {
    label: string;
    price: number;
  };
  selectedExtras?: Array<{
    label: string;
    price: number;
  }>;
  selectedRemovals?: string[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface IDriverPayout {
  baseFee: number;
  distanceFee: number;
  grossFee?: number;
  commissionRate?: number;
  commissionFee?: number;
  totalFee: number;
  distanceKm?: number;
  currency?: string;
}

export interface IOrder {
  orderNumber: string; // e.g. "CH-2481"
  userId?: Types.ObjectId | string;
  sessionId?: string;
  restaurantId?: string;
  restaurantName: string;
  restaurantAddress: string;
  items: IOrderItem[];
  deliveryAddress: {
    label: string;
    fullAddress: string;
    contactPhone: string;
    instructions?: string;
  };
  arrivalEstimate: string; // e.g. "25-35 min"
  estimatedDeliveryTime: Date;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
    currency: "INR";
  };
  payment: {
    method: "card";
    status: PaymentStatus;
    amountInPaise: number;
    stripePaymentIntentId?: string;
    stripeClientSecret?: string;
    cardBrand?: string;
    cardLast4?: string;
  };
  status: OrderStatus;
  statusHistory: IOrderStatusHistory[];
  driver?: IDriverInfo;
  driverPayout?: IDriverPayout;
  deliveryOtp?: string;
  includeCutlery: boolean;
  orderNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const orderItemSchema = new Schema<IOrderItem>(
  {
    name: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: {
      label: { type: String },
      price: { type: Number },
    },
    selectedExtras: [
      {
        label: { type: String },
        price: { type: Number },
      },
    ],
    selectedRemovals: [String],
    specialInstructions: { type: String, default: "" },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
    },
    title: { type: String, required: true },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: false,
      index: true,
    },
    restaurantId: {
      type: String,
      required: true,
      default: "bella-italia",
    },
    restaurantName: {
      type: String,
      required: true,
      default: "Bella Italia",
    },
    restaurantAddress: {
      type: String,
      required: true,
      default: "221B Baker Street, London",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v: IOrderItem[]) => v.length > 0, "Order must have at least one item"],
    },
    deliveryAddress: {
      label: { type: String, default: "Home" },
      fullAddress: { type: String, required: true },
      contactPhone: { type: String, required: true },
      instructions: { type: String, default: "Leave at the door" },
    },
    arrivalEstimate: {
      type: String,
      default: "25-35 min",
    },
    estimatedDeliveryTime: {
      type: Date,
      required: true,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      serviceFee: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    payment: {
      method: { type: String, enum: ["card"], default: "card" },
      status: {
        type: String,
        enum: ["pending", "succeeded", "failed", "cancelled"],
        default: "pending",
        index: true,
      },
      amountInPaise: { type: Number, required: true },
      stripePaymentIntentId: { type: String, sparse: true, index: true },
      stripeClientSecret: { type: String },
      cardBrand: { type: String, default: "visa" },
      cardLast4: { type: String, default: "4242" },
    },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "placed",
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    driver: {
      id: { type: String },
      name: { type: String },
      role: { type: String, default: "Your courier" },
      phone: { type: String },
      avatar: { type: String },
      rating: { type: Number, default: 4.8 },
      totalRatings: { type: Number, default: 320 },
      vehicleType: { type: String, default: "Scooter" },
      plateNumber: { type: String },
    },
    driverPayout: {
      baseFee: { type: Number },
      distanceFee: { type: Number },
      grossFee: { type: Number },
      commissionRate: { type: Number },
      commissionFee: { type: Number },
      totalFee: { type: Number },
      distanceKm: { type: Number },
      currency: { type: String, default: "£" },
    },
    deliveryOtp: {
      type: String,
      index: true,
    },
    includeCutlery: {
      type: Boolean,
      default: true,
    },
    orderNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user's orders sorted by date
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ sessionId: 1, createdAt: -1 });

export const Order = model<IOrderDocument>("Order", orderSchema);
