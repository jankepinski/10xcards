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
 * Schema for validating a request to create multiple flashcards
 */
export const createFlashcardsSchema = z.object({
  flashcards: z.array(createFlashcardSchema).min(1, "At least one flashcard is required"),
});
