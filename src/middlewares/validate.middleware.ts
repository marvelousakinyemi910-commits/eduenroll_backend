import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

interface Schemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

// Validates req.body / req.query / req.params against Zod schemas and
// replaces them with the parsed (typed, coerced) result. Throws (via next)
// on failure -- caught by the global error handler which formats ZodErrors.
export const validate = (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query) as any;
    if (schemas.params) req.params = schemas.params.parse(req.params) as any;
    next();
  } catch (err) {
    next(err);
  }
};
