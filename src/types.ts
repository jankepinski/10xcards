/*
 * DTO and Command Model definitions for the API.
 * These types are derived from the database models defined in src/db/database.types.ts
 * and reflect the structures required by the API plan.
 */

import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

/**
 * FlashcardDTO: Represents a flashcard entity as returned in API responses.
 * Derived from the DB model for flashcards (Tables<"flashcards">).
 */
export type FlashcardDTO = Tables<"flashcards">;

/**
 * CreateFlashcardCommand: Represents the required data to create a flashcard.
 * Excludes system-generated fields (id, created_at, updated_at, user_id).
 */
export type CreateFlashcardCommand = Omit<TablesInsert<"flashcards">, "id" | "created_at" | "updated_at" | "user_id">;

/**
 * CreateFlashcardsCommand: Represents the payload to create one or multiple flashcards.
 */
export interface CreateFlashcardsCommand {
  flashcards: CreateFlashcardCommand[];
}

/**
 * UpdateFlashcardCommand: Represents the data to update an existing flashcard.
 * For the PUT /flashcards/{id} endpoint, only these fields are updatable.
 */
export type UpdateFlashcardCommand = Pick<TablesUpdate<"flashcards">, "front" | "back" | "source">;

/**
 * FlashcardsResponseDTO: Represents the response format for retrieving flashcards with pagination.
 */
export interface FlashcardsResponseDTO {
  flashcards: FlashcardDTO[];
  pagination: Pagination;
}

/**
 * Pagination: Pagination metadata for API responses.
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

/**
 * GenerationDTO: Represents a flashcard generation session, derived from the DB model.
 */
export type GenerationDTO = Tables<"generations">;

/**
 * CreateGenerationCommand: Represents the payload to initiate a new generation session.
 * Note: The source_text provided here is processed server-side to compute its hash and length.
 */
export interface CreateGenerationCommand {
  source_text: string;
}

/**
 * GenerationResultDTO: Represents the response after initiating a generation session,
 * including both the generation details and the generated flashcards.
 */
export interface GenerationResultDTO {
  generation: GenerationDTO;
  flashcards: FlashcardDTO[];
}

/**
 * GenerationsResponseDTO: Represents the response for retrieving multiple generation sessions.
 */
export interface GenerationsResponseDTO {
  generations: GenerationDTO[];
}

/**
 * GenerationErrorLogDTO: Represents an error log entry for a generation session.
 * Only essential fields are exposed in the API response.
 */
export type GenerationErrorLogDTO = Pick<
  Tables<"generation_error_logs">,
  "id" | "error_code" | "error_message" | "created_at"
>;

/**
 * GenerationErrorLogsResponseDTO: Represents the response for retrieving multiple generation error logs.
 */
export interface GenerationErrorLogsResponseDTO {
  error_logs: GenerationErrorLogDTO[];
}

/**
 * DeleteResponseDTO: Represents a standard delete confirmation response.
 */
export interface DeleteResponseDTO {
  message: string;
}
