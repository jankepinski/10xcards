import { z } from "zod";

/**
 * Schema for validating generation error log ID
 */
export const errorLogIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .transform((val) => parseInt(val.toString(), 10)),
});

export type ErrorLogIdParams = z.infer<typeof errorLogIdSchema>;
