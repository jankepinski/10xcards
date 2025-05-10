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
import { OpenRouterService, OpenRouterServiceError } from "../openrouter.service";

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
    if (!import.meta.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    // Create OpenRouter service instance with a configuration for flashcard generation
    const openRouterService = new OpenRouterService(import.meta.env.OPENROUTER_API_KEY, {
      systemMessage: `You are an educational assistant specialized in creating flashcards from text. 
Create a comprehensive set of flashcards based on the provided text. 
Each flashcard should have a front side with a concise question or term, and a back side with a complete explanation or definition.
The front side should be under 200 characters, and the back side should be under 500 characters.
Focus on key concepts, important terminology, and fundamental ideas in the text.

Your response must be in valid JSON format with this structure:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    },
    ...more flashcards
  ]
}`,
      modelName: "openai/gpt-4o-mini",
      modelParams: {
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.95,
      },
      responseFormat: {
        type: "json_object",
      },
    });

    // Send the request to OpenRouter
    const response = await openRouterService.sendRequest(sourceText);

    // Handle different possible response formats
    let flashcardsData;

    try {
      // If we got a direct response object with flashcards
      if (response.flashcards && Array.isArray(response.flashcards)) {
        flashcardsData = response;
      }
      // If the response came as content string (common with some providers)
      else if (response.content && typeof response.content === "string") {
        const parsed = JSON.parse(response.content);
        flashcardsData = parsed;
      }
      // If the response is nested in a choices array (standard OpenAI format)
      else if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        const message = response.choices[0].message;
        if (message && typeof message.content === "string") {
          flashcardsData = JSON.parse(message.content);
        } else if (message && message.content && message.content.flashcards) {
          flashcardsData = message.content;
        }
      }

      // Fallback for other response structures
      if (!flashcardsData || !flashcardsData.flashcards || !Array.isArray(flashcardsData.flashcards)) {
        console.error("Unexpected response structure:", JSON.stringify(response));
        throw new Error("Could not extract flashcards from the API response");
      }
    } catch (parseError) {
      console.error("Failed to parse response from OpenRouter:", parseError, response);
      throw new Error("Failed to parse the AI response into valid flashcards");
    }

    // Map the response to FlashcardDTO objects
    const flashcards: FlashcardDTO[] = flashcardsData.flashcards.map(
      (card: { front: string; back: string }, index: number) => ({
        id: index + 1, // Temporary ID for the response
        user_id: "placeholder-user-id", // Will be replaced with actual user ID
        front: card.front,
        back: card.back,
        source: "ai-full",
        generation_id: null, // Will be set after generation is saved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );

    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards from AI:", error);

    if (error instanceof OpenRouterServiceError) {
      throw new Error(`OpenRouter error (${error.code}): ${error.message}`);
    }

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
  const modelUsed = "gpt-4"; // Default model

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
        model: modelUsed,
        generation_duration: processingTimeMs,
        generated_count: generatedFlashcards.length,
        accepted_unedited_count: 0, // These will be updated when user accepts flashcards
        accepted_edited_count: 0,
      })
      .select()
      .single();

    if (generationError) {
      throw generationError;
    }

    // Update the generation_id on all flashcards
    const flashcardsWithGenerationId = generatedFlashcards.map((card) => ({
      ...card,
      generation_id: generationData.id,
      user_id: userId,
    }));

    return {
      generation: generationData as GenerationDTO,
      flashcards: flashcardsWithGenerationId,
    };
  } catch (error) {
    // Log the error to the generation_error_logs table
    await supabase.from("generation_error_logs").insert({
      user_id: userId,
      error_code: "GENERATION_FAILED",
      error_message: error instanceof Error ? error.message : String(error),
      model: modelUsed,
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
