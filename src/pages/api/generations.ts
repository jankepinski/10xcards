import type { APIRoute } from "astro";
import { createGenerationSchema } from "../../lib/schemas/generationSchemas";
import { createGeneration } from "../../lib/services/generationService";
import type { CreateGenerationCommand, GenerationResultDTO } from "../../types";
import type { Session } from "@supabase/supabase-js";

export const prerender = false;

/**
 * POST /generations
 *
 * Creates a new flashcard generation based on the provided source text.
 * The endpoint validates the input, calls the AI service to generate flashcards,
 * saves the generation record, and returns the generation data with flashcards.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the session from Supabase client
  const { data } = await supabase.auth.getSession();
  const session: Session | null = data.session;

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
    const validationResult = createGenerationSchema.safeParse(body);

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

    const command: CreateGenerationCommand = {
      source_text: validationResult.data.source_text,
    };

    // Process the generation
    const result: GenerationResultDTO = await createGeneration(supabase, command, session.user.id);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to process the generation request",
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
