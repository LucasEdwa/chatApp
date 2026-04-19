import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global Express error handling middleware.
 * Catches all errors thrown in route handlers and middleware,
 * returning a consistent JSON response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    console.error(`[AppError] ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Unexpected errors — don't leak internals to the client
  console.error('[UnhandledError]', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

/**
 * Wraps Socket.IO event handlers with try/catch to prevent
 * unhandled exceptions from crashing the server.
 */
export const wrapSocketHandler = <T extends unknown[]>(
  handler: (...args: T) => void
) => {
  return (...args: T): void => {
    try {
      handler(...args);
    } catch (error) {
      console.error('[SocketError]', error);
    }
  };
};
