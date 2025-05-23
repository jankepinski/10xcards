import { z } from "zod";

/**
 * Schema for validating a single flashcard creation request
 */
export const createFlashcardSchema = z
  .object({
    front: z.string().max(200, "Front text must not exceed 200 characters"),
    back: z.string().max(500, "Back text must not exceed 500 characters"),
    source: z.enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
    }),
    generation_id: z.number().int().nullable(),
  })
  .superRefine((data, ctx) => {
    // Check if generation_id is required based on source
    if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "generation_id is required when source is 'ai-full' or 'ai-edited'",
        path: ["generation_id"],
      });
    }
  });

/**
 * Schema for validating flashcard updates
 * For the PUT /flashcards/{id} endpoint
 */
export const updateFlashcardSchema = z
  .object({
    front: z.string().max(200, "Front text must not exceed 200 characters"),
    back: z.string().max(500, "Back text must not exceed 500 characters"),
  })
  .required();

/**
 * Schema for validating a request to create multiple flashcards
 */
export const createFlashcardsSchema = z.object({
  flashcards: z.array(createFlashcardSchema).min(1, "At least one flashcard is required"),
});

/**
 * Schema for validating query parameters for retrieving flashcards
 */
export const getFlashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["created_at", "updated_at", "front", "back"]).optional().default("created_at"),
  filter: z.enum(["manual", "ai-full", "ai-edited"]).optional(),
});

/**
 * Schema for validating the flashcard ID parameter
 */
export const flashcardIdSchema = z.object({
  id: z.coerce.number().int().positive("Flashcard ID must be a positive integer"),
});

/**
 * Type for validated query parameters for retrieving flashcards
 */
export type GetFlashcardsQueryParams = z.infer<typeof getFlashcardsQuerySchema>;

/**
 * Type for validated flashcard ID parameter
 */
export type FlashcardIdParam = z.infer<typeof flashcardIdSchema>;

/**
 * Type for validated update flashcard data
 */
export type UpdateFlashcardData = z.infer<typeof updateFlashcardSchema>;
