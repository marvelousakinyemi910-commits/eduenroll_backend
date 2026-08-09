import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

// Must be used after `authenticate`. Restricts a route to one or more roles.
export const authorize = (...allowed: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!allowed.includes(req.user.role)) {
    return next(ApiError.forbidden(`Requires role: ${allowed.join(" or ")}`));
  }
  next();
};
