import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateGenerationCommand,
  FlashcardDTO,
  GenerationDTO,
  GenerationResultDTO,
  GenerationsResponseDTO,
} from "../../types";
import crypto from "crypto";
import type { PaginationParams } from "../schemas/generationSchemas";

/**
 * Calculates the SHA-256 hash of the provided text
 */
const calculateTextHash = (text: string): string => {
  return crypto.createHash("sha256").update(text).digest("hex");
};

/**
 * Interfaces with the OpenRouter AI service to generate flashcards
 */
export const generateFlashcardsFromAI = async (sourceText: string): Promise<FlashcardDTO[]> => {
  try {
    // TODO: Implement actual OpenRouter.ai integration
    // This is a placeholder implementation that returns mock data

    // For demonstration purposes, use the sourceText length to vary the response
    const flashcardCount = Math.min(5, Math.max(2, Math.floor(sourceText.length / 500)));

    // Mock implementation for testing - will be replaced with actual AI call
    const mockFlashcards: FlashcardDTO[] = [];

    // Generate the requested number of flashcards
    for (let i = 0; i < flashcardCount; i++) {
      mockFlashcards.push({
        id: i + 1,
        user_id: "placeholder-user-id",
        front: `Sample front text ${i + 1}`,
        back: `Sample back text ${i + 1}`,
        source: "ai-full",
        generation_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return mockFlashcards;
  } catch (error) {
    console.error("Error generating flashcards from AI:", error);
    // This will be handled by the caller
    throw error;
  }
};

/**
 * Creates a new generation record in the database
 */
export const createGeneration = async (
  supabase: SupabaseClient,
  command: CreateGenerationCommand,
  userId: string
): Promise<GenerationResultDTO> => {
  // Calculate the hash and length of the source text
  const sourceTextHash = calculateTextHash(command.source_text);
  const sourceTextLength = command.source_text.length;

  const startTime = Date.now();

  try {
    // Call the AI service to generate flashcards
    const generatedFlashcards = await generateFlashcardsFromAI(command.source_text);

    const processingTimeMs = Date.now() - startTime;

    // Create the generation record
    const { data: generationData, error: generationError } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        model: "gpt-4", // Placeholder - should be returned from the AI service
        generation_duration: processingTimeMs,
        generated_count: generatedFlashcards.length,
      })
      .select()
      .single();

    if (generationError) {
      throw generationError;
    }

    return {
      generation: generationData as GenerationDTO,
      flashcards: generatedFlashcards,
    };
  } catch (error) {
    // Log the error to the generation_error_logs table
    await supabase.from("generation_error_logs").insert({
      user_id: userId,
      error_code: "GENERATION_FAILED",
      error_message: error instanceof Error ? error.message : String(error),
      model: "gpt-4", // Using the same model as in the generation record
      source_text_hash: sourceTextHash,
      source_text_length: sourceTextLength,
    });

    throw error;
  }
};

/**
 * Retrieves user generations with pagination support
 */
export const getGenerations = async (
  supabase: SupabaseClient,
  userId: string,
  paginationParams: PaginationParams
): Promise<GenerationsResponseDTO> => {
  const { page, limit } = paginationParams;
  const offset = (page - 1) * limit;

  // Get the total count of records for pagination metadata
  const { count: total, error: countError } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  // Query user generations with pagination
  const { data: generations, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  // Return the paginated results
  return {
    generations: generations as GenerationDTO[],
    pagination: {
      page,
      limit,
      total: total || 0,
    },
  };
};

/**
 * Retrieves a specific generation by ID
 * Ensures that the user has access to this generation
 */
export const getGenerationById = async (
  supabase: SupabaseClient,
  userId: string,
  generationId: number
): Promise<GenerationDTO> => {
  // Query the specific generation by ID and user_id
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found (Postgres code for "no rows returned")
      throw new Error("Generation not found");
    }
    throw error;
  }

  return data as GenerationDTO;
};
