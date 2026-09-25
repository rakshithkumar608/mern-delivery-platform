import { Document, Model, Schema, model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  image: string;
  cloudinaryPublicId?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, "Category image URL is required"],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    backgroundColor: {
      type: String,
      trim: true,
      default: "#F3F4F6",
    },
    textColor: {
      type: String,
      trim: true,
      default: "#374151",
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
  },
  {
    timestamps: true,
  },
);

export const Category: Model<ICategoryDocument> = model<ICategoryDocument>(
  "Category",
  categorySchema,
);
