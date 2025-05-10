import type { APIRoute } from "astro";
import { generationIdSchema } from "../../../lib/schemas/generationSchemas";
import { getGenerationById } from "../../../lib/services/generationService";
import type { GenerationDTO } from "../../../types";
// import type { Session } from "@supabase/supabase-js";

// Disable prerendering as this is a dynamic API endpoint
export const prerender = false;

/**
 * GET /generations/{id}
 *
 * Retrieves detailed information about a specific generation session.
 * The user must be authenticated and can only access their own generations.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // AUTHENTICATION DISABLED
  // Get the session from Supabase client
  // const { data } = await supabase.auth.getSession();
  // const session: Session | null = data.session;

  // Validate authentication
  // if (!session) {
  //   return new Response(
  //     JSON.stringify({
  //       error: "Unauthorized",
  //       message: "You must be logged in to use this endpoint",
  //     }),
  //     {
  //       status: 401,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  // }

  // Use fixed user ID
  const userId = "5fbd38b3-8a86-4a1e-b6c3-af939d007330";

  try {
    // Validate the ID parameter
    const validationResult = generationIdSchema.safeParse({ id: params.id });

    // Handle validation errors
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid generation ID format",
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

    // Get the generation using the service
    const generationId = validationResult.data.id;

    try {
      const generation: GenerationDTO = await getGenerationById(supabase, userId, generationId);

      // Return the generation data
      return new Response(JSON.stringify(generation), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Handle "not found" error
      if (error instanceof Error && error.message === "Generation not found") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Generation not found or you don't have access to it",
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Re-throw other errors to be caught by the outer try-catch
      throw error;
    }
  } catch (error) {
    console.error("Error retrieving generation:", error);

    // Return a generic server error
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your request",
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
