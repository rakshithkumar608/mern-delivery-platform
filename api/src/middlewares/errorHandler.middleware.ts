import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { Env } from "../config/env.config";
import { HttpStatus } from "../config/http-status.config";
import { AppError, ErrorCodes } from "../utils/app-error";
import { logger } from "../utils/logger";

function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Handle Zod validation errors first
  if (err instanceof ZodError) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      errorCode: ErrorCodes.ERR_VALIDATION,
      message: "Validation failed",
      errors: formatZodError(err),
    });
    return;
  }

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    });
    return;
  }

  // Handle unknown errors — do not leak internals in production
  logger.error("Unhandled error", {
    name: err.name,
    message: err.message,
    stack: Env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    errorCode: ErrorCodes.ERR_INTERNAL,
    message:
      Env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
