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
