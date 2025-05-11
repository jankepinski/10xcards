import type { APIRoute } from "astro";
import { createGenerationSchema, paginationSchema } from "../../lib/schemas/generationSchemas";
import { createGeneration, getGenerations } from "../../lib/services/generationService";
import type { CreateGenerationCommand, GenerationResultDTO, GenerationsResponseDTO } from "../../types";

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

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  // Get authenticated user ID
  const userId = user.id;
  console.log("userId", userId);

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
    const result: GenerationResultDTO = await createGeneration(supabase, command, userId);

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

/**
 * GET /generations
 *
 * Retrieves a list of generation sessions for the authenticated user with pagination support.
 * This endpoint requires authentication and filters results to only show the user's own data.
 */
export const GET: APIRoute = async ({ request, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  // Get authenticated user ID
  const userId = user.id;

  try {
    // Extract and validate pagination parameters from the URL
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const validationResult = paginationSchema.safeParse({
      page: pageParam,
      limit: limitParam,
    });

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid pagination parameters",
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

    // Get the user's generations with pagination
    const result: GenerationsResponseDTO = await getGenerations(supabase, userId, validationResult.data);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error retrieving generations:", error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to retrieve generations",
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
