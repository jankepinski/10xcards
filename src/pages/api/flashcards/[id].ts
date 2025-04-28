import type { APIRoute } from "astro";
import { getFlashcardById } from "../../../lib/services/flashcardService";
import { flashcardIdSchema } from "../../../lib/schemas/flashcardSchemas";
import type { Session } from "@supabase/supabase-js";

// Disable prerendering as this is a dynamic API endpoint
export const prerender = false;

/**
 * GET /flashcards/{id} - Retrieves a single flashcard by ID
 *
 * Returns:
 * - 200 OK with the flashcard data
 * - 400 Bad Request if the ID is invalid
 * - 401 Unauthorized if the user is not authenticated
 * - 404 Not Found if the flashcard doesn't exist
 * - 500 Internal Server Error if there's a server error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the session from Supabase client
  const { data } = await supabase.auth.getSession();
  const session: Session | null = data.session;

  // Ensure user is authenticated
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Validate the ID parameter
    const result = flashcardIdSchema.safeParse({ id: params.id });
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the validated ID
    const { id } = result.data;

    // Fetch the flashcard
    const flashcard = await getFlashcardById(supabase, id);

    // Return 404 if the flashcard wasn't found
    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the flashcard
    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving flashcard:", error);

    // Return a 500 internal server error
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
