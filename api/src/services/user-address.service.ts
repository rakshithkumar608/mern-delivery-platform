import { Types } from "mongoose";

import {
  IGeoPoint,
  IUserAddressDocument,
  UserAddress,
} from "../models/user-address.model";
import { NotFoundException } from "../utils/app-error";
import {
  CreateAddressInput,
  UpdateAddressInput,
} from "../validators/address.validator";

export class UserAddressService {
  async createAddress(
    userId: string,
    data: CreateAddressInput,
  ): Promise<IUserAddressDocument> {
    const userObjectId = new Types.ObjectId(userId);

    // Check if this is the user's first address
    const existingCount = await UserAddress.countDocuments({
      userId: userObjectId,
    });
    const shouldBeDefault = data.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await UserAddress.updateMany(
        { userId: userObjectId },
        { $set: { isDefault: false } },
      );
    }

    const location: IGeoPoint | undefined =
      typeof data.longitude === "number" && typeof data.latitude === "number"
        ? {
            type: "Point",
            coordinates: [data.longitude, data.latitude],
          }
        : undefined;

    const address = new UserAddress({
      userId: userObjectId,
      label: data.label,
      street: data.street.trim(),
      unit: data.unit?.trim() || "",
      city: data.city.trim(),
      state: data.state?.trim() || "",
      zipCode: data.zipCode?.trim() || "",
      formattedAddress: data.formattedAddress.trim(),
      location,
      instructions: data.instructions?.trim() || "",
      isDefault: shouldBeDefault,
    });

    return address.save();
  }

  async getUserAddresses(userId: string): Promise<IUserAddressDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    return UserAddress.find({ userId: userObjectId }).sort({
      isDefault: -1,
      createdAt: -1,
    });
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ): Promise<IUserAddressDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const addressObjectId = new Types.ObjectId(addressId);

    const address = await UserAddress.findOne({
      _id: addressObjectId,
      userId: userObjectId,
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    await UserAddress.updateMany(
      { userId: userObjectId },
      { $set: { isDefault: false } },
    );

    address.isDefault = true;
    return address.save();
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const addressObjectId = new Types.ObjectId(addressId);

    const address = await UserAddress.findOne({
      _id: addressObjectId,
      userId: userObjectId,
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If the deleted address was default, promote the next available address
    if (wasDefault) {
      const nextAddress = await UserAddress.findOne({
        userId: userObjectId,
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressInput,
  ): Promise<IUserAddressDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const addressObjectId = new Types.ObjectId(addressId);

    const address = await UserAddress.findOne({
      _id: addressObjectId,
      userId: userObjectId,
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    if (data.isDefault) {
      await UserAddress.updateMany(
        { userId: userObjectId },
        { $set: { isDefault: false } },
      );
      address.isDefault = true;
    }

    if (data.label) address.label = data.label;
    if (data.street !== undefined) address.street = data.street.trim();
    if (data.unit !== undefined) address.unit = data.unit.trim();
    if (data.city !== undefined) address.city = data.city.trim();
    if (data.state !== undefined) address.state = data.state.trim();
    if (data.zipCode !== undefined) address.zipCode = data.zipCode.trim();
    if (data.formattedAddress !== undefined)
      address.formattedAddress = data.formattedAddress.trim();
    if (data.instructions !== undefined)
      address.instructions = data.instructions.trim();

    if (
      typeof data.longitude === "number" &&
      typeof data.latitude === "number"
    ) {
      address.location = {
        type: "Point",
        coordinates: [data.longitude, data.latitude],
      };
    }

    return address.save();
  }
}

export const userAddressService = new UserAddressService();
