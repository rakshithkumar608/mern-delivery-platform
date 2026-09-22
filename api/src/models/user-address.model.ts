import { Document, Model, Schema, Types, model } from "mongoose";

export type AddressLabel = "Home" | "Work" | "Other";

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IUserAddress {
  userId: Types.ObjectId;
  label: AddressLabel;
  street: string;
  unit?: string;
  city: string;
  state?: string;
  zipCode?: string;
  formattedAddress: string;
  location?: IGeoPoint;
  instructions?: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserAddressDocument extends IUserAddress, Document {}

const userAddressSchema = new Schema<IUserAddressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    zipCode: {
      type: String,
      trim: true,
      default: "",
    },
    formattedAddress: {
      type: String,
      required: [true, "Formatted address is required"],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// 2dsphere index for location queries
userAddressSchema.index({ location: "2dsphere" });

export const UserAddress: Model<IUserAddressDocument> =
  model<IUserAddressDocument>("UserAddress", userAddressSchema);
