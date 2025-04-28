import { z } from "zod";

/**
 * Schema for validating the request body for the POST /generations endpoint
 * Enforces constraints like minimum and maximum text length
 */
export const createGenerationSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text must not exceed 10000 characters"),
});

/**
 * Type derived from the Zod schema for TypeScript validation
 */
export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;

/**
 * Schema for validating pagination query parameters
 * Used for GET /generations endpoint
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Type derived from the pagination schema
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Schema for validating the generation ID parameter
 * Used for GET /generations/{id} endpoint
 */
export const generationIdSchema = z.object({
  id: z.coerce.number().int().positive("Generation ID must be a positive integer"),
});
