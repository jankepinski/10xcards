import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateFlashcardCommand,
  FlashcardDTO,
  FlashcardsResponseDTO,
  Pagination,
  UpdateFlashcardCommand,
} from "../../types";
import type { GetFlashcardsQueryParams } from "../schemas/flashcardSchemas";

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

/**
 * Retrieves flashcards from the database with pagination, sorting, and filtering.
 *
 * @param supabase The Supabase client from context.locals
 * @param params Query parameters for pagination, sorting, and filtering
 * @returns Object containing the flashcards and pagination metadata
 * @throws FlashcardServiceError if operation fails
 */
export async function getFlashcards(
  supabase: SupabaseClient,
  params: GetFlashcardsQueryParams
): Promise<FlashcardsResponseDTO> {
  try {
    // Calculate offset based on page and limit
    const offset = (params.page - 1) * params.limit;

    // Build the query
    let query = supabase.from("flashcards").select("*", { count: "exact" });

    // Apply filter if provided
    if (params.filter) {
      query = query.eq("source", params.filter);
    }

    // Apply sorting
    query = query.order(params.sort, { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + params.limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    // Handle database error
    if (error) {
      handleDatabaseError(error);
    }

    // Create pagination metadata
    const pagination: Pagination = {
      page: params.page,
      limit: params.limit,
      total: count || 0,
    };

    // Return the response DTO
    return {
      flashcards: data as FlashcardDTO[],
      pagination,
    };
  } catch (error) {
    // If it's already a FlashcardServiceError, rethrow it
    if (error instanceof FlashcardServiceError) {
      throw error;
    }

    // Otherwise wrap it
    console.error("Error fetching flashcards:", error);
    throw new FlashcardServiceError(
      "Failed to fetch flashcards",
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Retrieves a single flashcard by ID.
 *
 * @param supabase The Supabase client from context.locals
 * @param flashcardId The ID of the flashcard to retrieve
 * @returns The requested flashcard or null if not found
 * @throws FlashcardServiceError if operation fails
 */
export async function getFlashcardById(supabase: SupabaseClient, flashcardId: number): Promise<FlashcardDTO | null> {
  try {
    // Query the database for the flashcard with the specified ID
    // Supabase RLS will automatically filter by user_id
    const { data, error } = await supabase.from("flashcards").select("*").eq("id", flashcardId).single();

    // Handle database error
    if (error) {
      // If the error is a "not found" error, return null
      if (error.code === "PGRST116") {
        return null;
      }

      // Otherwise, handle other database errors
      handleDatabaseError(error);
    }

    // Return the flashcard (or null if not found, although this should be caught above)
    return data as FlashcardDTO;
  } catch (error) {
    // If it's already a FlashcardServiceError, rethrow it
    if (error instanceof FlashcardServiceError) {
      throw error;
    }

    // Otherwise wrap it
    console.error("Error fetching flashcard by ID:", error);
    throw new FlashcardServiceError(
      "Failed to fetch flashcard",
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Updates a flashcard by ID.
 *
 * @param supabase The Supabase client from context.locals
 * @param flashcardId The ID of the flashcard to update
 * @param updateData The data to update the flashcard with (front and back text)
 * @returns The updated flashcard or null if not found
 * @throws FlashcardServiceError if operation fails
 */
export async function updateFlashcardById(
  supabase: SupabaseClient,
  flashcardId: number,
  updateData: {
    front: string;
    back: string;
  }
): Promise<FlashcardDTO | null> {
  try {
    // First, fetch the existing flashcard to check if it exists and determine source
    const existingFlashcard = await getFlashcardById(supabase, flashcardId);

    // If flashcard doesn't exist or doesn't belong to user (handled by RLS), return null
    if (!existingFlashcard) {
      return null;
    }

    // Determine the source value for the update
    // If original source was 'ai-full', change to 'ai-edited'
    // Otherwise, keep the original source value
    const source = existingFlashcard.source === "ai-full" ? "ai-edited" : existingFlashcard.source;

    // Prepare update data including the determined source
    const updateCommand: UpdateFlashcardCommand = {
      ...updateData,
      source,
    };

    // Update the flashcard in the database
    // RLS will ensure user can only update their own flashcards
    const { data, error } = await supabase
      .from("flashcards")
      .update(updateCommand)
      .eq("id", flashcardId)
      .select()
      .single();

    // Handle database error
    if (error) {
      // If the error is a "not found" error, return null
      if (error.code === "PGRST116") {
        return null;
      }

      // Otherwise, handle other database errors
      handleDatabaseError(error);
    }

    // Return the updated flashcard
    return data as FlashcardDTO;
  } catch (error) {
    // If it's already a FlashcardServiceError, rethrow it
    if (error instanceof FlashcardServiceError) {
      throw error;
    }

    // Otherwise wrap it
    console.error("Error updating flashcard by ID:", error);
    throw new FlashcardServiceError(
      "Failed to update flashcard",
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Deletes a flashcard by ID.
 *
 * @param supabase The Supabase client from context.locals
 * @param flashcardId The ID of the flashcard to delete
 * @returns true if the flashcard was deleted, false if not found
 * @throws FlashcardServiceError if operation fails
 */
export async function deleteFlashcardById(supabase: SupabaseClient, flashcardId: number): Promise<boolean> {
  try {
    // First check if the flashcard exists and belongs to the user
    // This is handled by Row-Level Security in Supabase
    const exists = await getFlashcardById(supabase, flashcardId);

    // If the flashcard doesn't exist or doesn't belong to the user, return false
    if (!exists) {
      return false;
    }

    // Delete the flashcard
    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId);

    // Handle database error
    if (error) {
      handleDatabaseError(error);
    }

    // Return true to indicate success
    return true;
  } catch (error) {
    // If it's already a FlashcardServiceError, rethrow it
    if (error instanceof FlashcardServiceError) {
      throw error;
    }

    // Otherwise wrap it
    console.error("Error deleting flashcard by ID:", error);
    throw new FlashcardServiceError(
      "Failed to delete flashcard",
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}
