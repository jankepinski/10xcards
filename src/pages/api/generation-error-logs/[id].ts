import type { APIRoute } from "astro";
import { getGenerationErrorLogById } from "../../../lib/services/errorLogsService";
import { errorLogIdSchema } from "../../../lib/schemas/errorLogSchemas";
import type { Session } from "@supabase/supabase-js";

// Disable prerendering as this is a dynamic API endpoint
export const prerender = false;

/**
 * GET /generation-error-logs/{id} - Retrieves a single generation error log by ID
 *
 * Returns:
 * - 200 OK with the error log data
 * - 400 Bad Request if the ID is invalid
 * - 401 Unauthorized if the user is not authenticated
 * - 404 Not Found if the error log doesn't exist or doesn't belong to the user
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
    return new Response(JSON.stringify({ error: "Unauthorized - Please log in to access error logs" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Validate the ID parameter
    const result = errorLogIdSchema.safeParse({ id: params.id });
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid error log ID",
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
    const userId = session.user.id;

    // Fetch the error log
    const { data: errorLog, error } = await getGenerationErrorLogById(supabase, id, userId);

    if (error) {
      console.error("Error retrieving generation error log:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return 404 if the error log wasn't found
    if (!errorLog) {
      return new Response(JSON.stringify({ error: "Generation error log not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the error log
    return new Response(JSON.stringify(errorLog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in generation-error-logs/[id] endpoint:", error);

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
