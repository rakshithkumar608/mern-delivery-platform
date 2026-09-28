import { Document, Model, Schema, Types, model } from "mongoose";

export interface IBasketItem {
  _id?: Types.ObjectId | string;
  menuItemId?: Types.ObjectId | string;
  name: string;
  subtitle?: string;
  image: string;
  price: number;
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

export interface IBasket {
  userId?: Types.ObjectId | string;
  sessionId?: string;
  restaurantId?: Types.ObjectId | string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLogo: string;
  restaurantDeliveryTime: string;
  currency: string;
  items: IBasketItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  freeDeliveryThreshold: number;
  includeCutlery: boolean;
  promoCode?: string;
  discount: number;
  orderNotes?: string;
  allergyReminder?: string;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBasketDocument extends IBasket, Document {}

const basketItemSchema = new Schema<IBasketItem>(
  {
    menuItemId: {
      type: Schema.Types.Mixed,
      required: false,
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
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
    selectedRemovals: {
      type: [String],
      default: [],
    },
    specialInstructions: {
      type: String,
      default: "",
    },
    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const basketSchema = new Schema<IBasketDocument>(
  {
    userId: {
      type: Schema.Types.Mixed,
      index: true,
      required: false,
    },
    sessionId: {
      type: String,
      index: true,
      required: false,
    },
    restaurantId: {
      type: Schema.Types.Mixed,
      required: false,
    },
    restaurantName: {
      type: String,
      default: "Bella Italia",
      trim: true,
    },
    restaurantAddress: {
      type: String,
      default: "221B Baker Street, London",
      trim: true,
    },
    restaurantLogo: {
      type: String,
      default: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
    },
    restaurantDeliveryTime: {
      type: String,
      default: "25-35 min",
    },
    currency: {
      type: String,
      default: "£",
    },
    items: {
      type: [basketItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 1.49,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0.99,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 10.0,
      min: 0,
    },
    includeCutlery: {
      type: Boolean,
      default: true,
    },
    promoCode: {
      type: String,
      default: "",
      trim: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderNotes: {
      type: String,
      default: "",
      trim: true,
    },
    allergyReminder: {
      type: String,
      default: "",
      trim: true,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Basket: Model<IBasketDocument> = model<IBasketDocument>(
  "Basket",
  basketSchema
);
