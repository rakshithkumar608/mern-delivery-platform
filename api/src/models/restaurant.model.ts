import { Document, Model, Schema, Types, model } from "mongoose";

export interface IRestaurant {
  name: string;
  slug: string;
  description: string;
  cuisineType: string[];
  coverImage: string;
  logo?: string;
  rating: number;
  totalReviews: number;
  deliveryTime: string;
  distance: string;
  deliveryFee: number;
  minOrder: number;
  currency: string;
  openingHours: string;
  offer?: string;
  offerSubtitle?: string;
  allergensInfo?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRestaurantDocument extends IRestaurant, Document {}

const restaurantSchema = new Schema<IRestaurantDocument>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Restaurant slug is required"],
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    cuisineType: {
      type: [String],
      default: [],
      index: true,
    },
    coverImage: {
      type: String,
      required: [true, "Cover image URL is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: "20-30 min",
    },
    distance: {
      type: String,
      default: "1.0 miles",
    },
    deliveryFee: {
      type: Number,
      default: 1.99,
      min: 0,
    },
    minOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "$",
    },
    openingHours: {
      type: String,
      default: "Open until 10:00 PM",
    },
    offer: {
      type: String,
      default: "",
    },
    offerSubtitle: {
      type: String,
      default: "",
    },
    allergensInfo: {
      type: String,
      default: "Allergen information available on request",
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [-0.1276, 51.5074],
      },
      address: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

restaurantSchema.index({ "location.coordinates": "2dsphere" });

export const Restaurant: Model<IRestaurantDocument> = model<IRestaurantDocument>(
  "Restaurant",
  restaurantSchema
);
