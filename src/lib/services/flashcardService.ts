import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDTO } from "../../types";

/**
 * Custom error class for flashcard creation errors
 */
export class FlashcardServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "FlashcardServiceError";
  }
}

/**
 * Verifies if a generation belongs to the user before creating flashcards
 * associated with that generation
 */
async function verifyGenerationAccess(
  supabase: SupabaseClient,
  generationId: number,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error verifying generation access:", error);
    return false;
  }

  return data !== null;
}

/**
 * Creates multiple flashcards in the database.
 *
 * @param supabase The Supabase client from context.locals
 * @param flashcards Array of flashcard objects to create
 * @param userId The authenticated user's ID
 * @returns Array of created FlashcardDTO objects
 * @throws FlashcardServiceError if operation fails
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  flashcards: CreateFlashcardCommand[],
  userId: string
): Promise<FlashcardDTO[]> {
  // Early return for empty array
  if (flashcards.length === 0) {
    return [];
  }

  try {
    // Verify generation_id access for AI-generated flashcards
    for (const flashcard of flashcards) {
      if ((flashcard.source === "ai-full" || flashcard.source === "ai-edited") && flashcard.generation_id !== null) {
        // Make sure generation_id is defined and not null before using it
        const generationId = flashcard.generation_id;
        if (generationId !== undefined) {
          const hasAccess = await verifyGenerationAccess(supabase, generationId, userId);
          if (!hasAccess) {
            throw new FlashcardServiceError(`Access denied to generation with ID ${generationId}`, "ACCESS_DENIED", {
              generation_id: generationId,
            });
          }
        }
      }
    }

    // Map each flashcard to include the user_id
    const flashcardsToInsert = flashcards.map((flashcard) => ({
      ...flashcard,
      user_id: userId,
    }));

    // Use batch insert to minimize database calls
    const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

    // Handle database error
    if (error) {
      handleDatabaseError(error);
    }

    if (!data || data.length === 0) {
      throw new FlashcardServiceError("No flashcards were created", "CREATION_FAILED");
    }

    // Return the created flashcards
    return data as FlashcardDTO[];
  } catch (error) {
    // If it's already a FlashcardServiceError, rethrow it
    if (error instanceof FlashcardServiceError) {
      throw error;
    }

    // Otherwise wrap it
    console.error("Error creating flashcards:", error);
    throw new FlashcardServiceError(
      "Failed to create flashcards",
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Helper function to handle database errors and convert them to service errors
 */
function handleDatabaseError(error: PostgrestError): never {
  console.error("Database error:", error);

  // Handle specific database error codes
  switch (error.code) {
    case "23505": // Unique violation
      throw new FlashcardServiceError("A duplicate record already exists", "DUPLICATE_RECORD", error);
    case "23503": // Foreign key violation
      throw new FlashcardServiceError("Related record not found", "FOREIGN_KEY_VIOLATION", error);
    case "42P01": // Undefined table
      throw new FlashcardServiceError("Database configuration error", "DB_CONFIGURATION_ERROR", error);
    default:
      throw new FlashcardServiceError(`Database error: ${error.message}`, "DB_ERROR", error);
  }
}
