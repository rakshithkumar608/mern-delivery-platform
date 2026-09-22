import { CookieOptions, Response } from "express";

import { Env } from "../config/env.config";

export const JWT_COOKIE_NAME = "accessToken";

const getCookieOptions = (): CookieOptions => {
  const isProduction = Env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

export const setJwtAuthCookie = (res: Response, token: string): void => {
  res.cookie(JWT_COOKIE_NAME, token, getCookieOptions());
};

export const clearJwtAuthCookie = (res: Response): void => {
  const options = getCookieOptions();
  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
};
