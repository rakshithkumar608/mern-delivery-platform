import jwt, { SignOptions } from "jsonwebtoken";

import { Env } from "../config/env.config";
import { UserAddress } from "../models/user-address.model";
import { IUserDocument, User } from "../models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

export interface AuthResult {
  user: IUserDocument;
  token: string;
  hasAddress: boolean;
}

export class AuthService {
  private generateToken(user: IUserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: Env.JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, Env.JWT_SECRET, options);
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new BadRequestException("An account with this email already exists");
    }

    const user = new User({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone.trim(),
      role: data.role || "customer",
    });

    await user.save();

    const token = this.generateToken(user);
    const hasAddress = false;
    return { user, token, hasAddress };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select(
      "+password",
    );

    if (!user) {
      // Non-enumerating invalid-credentials message per security requirements
      throw new UnauthorizedException("Invalid email or password");
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = this.generateToken(user);
    const hasAddress =
      (await UserAddress.countDocuments({ userId: user._id })) > 0;

    return { user, token, hasAddress };
  }

  async getMe(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}

export const authService = new AuthService();
