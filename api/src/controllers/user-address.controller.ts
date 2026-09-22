import { Request, Response } from "express";

import { HttpStatus } from "../config/http-status.config";
import { userAddressService } from "../services/user-address.service";
import { BadRequestException, UnauthorizedException } from "../utils/app-error";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator";

const getUserId = (req: Request): string => {
  if (!req.user?._id) {
    throw new UnauthorizedException("Authentication required");
  }
  return req.user._id.toString();
};

const getParamId = (req: Request): string => {
  const value = req.params.id;
  if (!value || typeof value !== "string") {
    throw new BadRequestException("Invalid address ID parameter");
  }
  return value;
};

export class UserAddressController {
  createAddress = async (req: Request, res: Response): Promise<void> => {
    const input = createAddressSchema.parse(req.body);
    const address = await userAddressService.createAddress(
      getUserId(req),
      input,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Address saved successfully",
      address,
    });
  };

  getMyAddresses = async (req: Request, res: Response): Promise<void> => {
    const addresses = await userAddressService.getUserAddresses(
      getUserId(req),
    );

    res.status(HttpStatus.OK).json({
      success: true,
      addresses,
    });
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    const address = await userAddressService.setDefaultAddress(
      getUserId(req),
      getParamId(req),
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Default address updated",
      address,
    });
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    const input = updateAddressSchema.parse(req.body);
    const address = await userAddressService.updateAddress(
      getUserId(req),
      getParamId(req),
      input,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    await userAddressService.deleteAddress(
      getUserId(req),
      getParamId(req),
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Address deleted successfully",
    });
  };
}

export const userAddressController = new UserAddressController();
