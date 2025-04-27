import type { APIRoute } from "astro";
import { createFlashcardsSchema } from "../../lib/schemas/flashcardSchemas";
import { createFlashcards, FlashcardServiceError } from "../../lib/services/flashcardService";
import type { CreateFlashcardsCommand, FlashcardDTO } from "../../types";
import type { Session } from "@supabase/supabase-js";

export const prerender = false;

/**
 * POST /flashcards
 *
 * Creates one or multiple flashcards based on the provided data.
 * Validates input parameters and ensures that generation_id is provided
 * when required based on the source value.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the session from Supabase client
  const { data } = await supabase.auth.getSession();
  const session: Session | null = data.session;

  // Validate authentication
  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "You must be logged in to use this endpoint",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Parse and validate the request body
    const body = await request.json();
    const validationResult = createFlashcardsSchema.safeParse(body);

    // Handle validation errors
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid input data",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Extract the validated command
    const command: CreateFlashcardsCommand = validationResult.data;

    // Process the flashcards creation
    const createdFlashcards: FlashcardDTO[] = await createFlashcards(supabase, command.flashcards, session.user.id);

    // Return successful response
    return new Response(
      JSON.stringify({
        flashcards: createdFlashcards,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing flashcards request:", error);

    // Handle specific error types
    if (error instanceof FlashcardServiceError) {
      const statusCode = getStatusCodeForErrorType(error.code);

      return new Response(
        JSON.stringify({
          error: error.code,
          message: error.message,
          details: error.details,
        }),
        {
          status: statusCode,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Generic error response
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to process the flashcards request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

/**
 * Maps error codes to HTTP status codes
 */
function getStatusCodeForErrorType(errorCode: string): number {
  switch (errorCode) {
    case "ACCESS_DENIED":
      return 403;
    case "DUPLICATE_RECORD":
      return 409;
    case "FOREIGN_KEY_VIOLATION":
    case "NOT_FOUND":
      return 404;
    case "INVALID_INPUT":
      return 400;
    case "DB_ERROR":
    case "DB_CONFIGURATION_ERROR":
    case "INTERNAL_ERROR":
    default:
      return 500;
  }
}
