import { Request, Response } from "express";

import { HttpStatus } from "../config/http-status.config";
import { UserAddress } from "../models/user-address.model";
import { authService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const { user, token, hasAddress } = await authService.register(input);

    setJwtAuthCookie(res, token);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
      hasAddress,
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    const { user, token, hasAddress } = await authService.login(input);

    setJwtAuthCookie(res, token);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Logged in successfully",
      user,
      token,
      hasAddress,
    });
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    clearJwtAuthCookie(res);

    res.status(HttpStatus.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    const hasAddress = req.user
      ? (await UserAddress.countDocuments({ userId: req.user._id })) > 0
      : false;

    res.status(HttpStatus.OK).json({
      success: true,
      user: req.user,
      hasAddress,
    });
  };
}

export const authController = new AuthController();
