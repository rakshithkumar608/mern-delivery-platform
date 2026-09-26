import { Document, Model, Schema, Types, model } from "mongoose";

export interface IItemSize {
  label: string;
  price: number;
}

export interface IItemExtra {
  label: string;
  price: number;
}

export interface IItemTopping {
  label: string;
  price: number;
}

export interface IMenuItem {
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  calories?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  isPopular: boolean;
  isAvailable: boolean;
  sizes: IItemSize[];
  extras?: IItemExtra[];
  toppings: IItemTopping[];
  removables?: string[];
  allergens?: string[];
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMenuItemDocument extends IMenuItem, Document {}

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Item image is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    calories: {
      type: Number,
      default: 0,
    },
    sizes: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    extras: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    toppings: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    removables: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MenuItem: Model<IMenuItemDocument> = model<IMenuItemDocument>(
  "MenuItem",
  menuItemSchema
);
