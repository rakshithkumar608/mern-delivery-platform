export const ErrorCodes = {
  ERR_INTERNAL: "ERR_INTERNAL",
  ERR_BAD_REQUEST: "ERR_BAD_REQUEST",
  ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
  ERR_FORBIDDEN: "ERR_FORBIDDEN",
  ERR_NOT_FOUND: "ERR_NOT_FOUND",
  ERR_VALIDATION: "ERR_VALIDATION",
  ERR_TOO_MANY_REQUESTS: "ERR_TOO_MANY_REQUESTS",
} as const;

export type ErrorCodeType = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCodeType;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCodeType = ErrorCodes.ERR_INTERNAL,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, ErrorCodes.ERR_INTERNAL);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, ErrorCodes.ERR_NOT_FOUND);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, ErrorCodes.ERR_BAD_REQUEST);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, ErrorCodes.ERR_UNAUTHORIZED);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, ErrorCodes.ERR_FORBIDDEN);
  }
}
