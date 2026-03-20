import { z } from "zod";

// Express query params can be `string | string[] | undefined`.
// Zod schemas often expect a single value, so we coerce arrays down to first item.
export const singleValue = (schema) =>
  z.preprocess((v) => (Array.isArray(v) ? v[0] : v), schema);

export const optionalSingleValue = (schema) =>
  singleValue(schema).optional();

