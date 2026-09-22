import { Request } from "express";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { Env } from "./env.config";
import { User, IUserDocument } from "../models/user.model";
import { JWT_COOKIE_NAME } from "../utils/cookie";

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies[JWT_COOKIE_NAME] ?? null;
  }
  return null;
};

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const configurePassport = (): void => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      cookieExtractor,
      ExtractJwt.fromAuthHeaderAsBearerToken(),
    ]),
    secretOrKey: Env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload: JwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.sub).select("-password");
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );
};

// Extend Express Request interface for TypeScript
declare global {
  namespace Express {
    interface User extends IUserDocument {}
  }
}
