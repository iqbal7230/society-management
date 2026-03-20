import { ZodError } from "zod";

/**
 * Validate and coerce request parts using Zod.
 * On success, parses and coerces parts; assigns `req.body`/`req.params`,
 * and mutates `req.query` in-place (Express exposes it via a getter).
 */
export function validateRequest({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body ?? {});
      }
      if (query) {
        const parsedQuery = query.parse(req.query ?? {});
        // Express exposes req.query via a getter (read-only). Mutate in-place
        // so downstream handlers still use `req.query` normally.
        if (req.query && typeof req.query === "object") {
          Object.assign(req.query, parsedQuery);
        } else {
          // Fallback: attach to a separate property (should be rare).
          req.validatedQuery = parsedQuery;
        }
      }
      if (params) {
        req.params = params.parse(req.params ?? {});
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          issues: err.issues,
        });
      }
      next(err);
    }
  };
}

