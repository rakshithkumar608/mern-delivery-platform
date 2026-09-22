import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { IUserDocument, UserRole } from "../models/user.model";
import { ForbiddenException, UnauthorizedException } from "../utils/app-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error | null, user: IUserDocument | false) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(
          new UnauthorizedException("You must be logged in to access this resource"),
        );
      }
      req.user = user;
      next();
    },
  )(req, res, next);
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedException("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenException(
          `User role '${req.user.role}' is not authorized to access this resource`,
        ),
      );
    }

    next();
  };
};
