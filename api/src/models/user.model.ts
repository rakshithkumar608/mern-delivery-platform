import { Document, Model, Schema, model } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export type UserRole = "customer" | "rider" | "restaurant_owner" | "admin";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  pushToken?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "rider", "restaurant_owner", "admin"],
      default: "customer",
    },
    avatar: {
      type: String,
      default: "",
    },
    pushToken: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await hashValue(this.password);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return compareValue(candidatePassword, this.password);
};

export const User: Model<IUserDocument> = model<IUserDocument>(
  "User",
  userSchema,
);
