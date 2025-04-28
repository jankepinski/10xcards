import { type APIContext } from "astro";
import type { GenerationErrorLogsResponseDTO } from "../../types";
import { getUserGenerationErrorLogs } from "../../lib/services/errorLogsService";

export const prerender = false;

export async function GET(context: APIContext): Promise<Response> {
  try {
    // Step 1: Verify user authentication
    const supabase = context.locals.supabase;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized - Please log in to access error logs" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;

    // Step 2: Query generation_error_logs using the service
    const { data: errorLogs, error } = await getUserGenerationErrorLogs(supabase, userId);

    if (error) {
      console.error("Error fetching generation error logs:", error);
      return new Response(JSON.stringify({ error: "Failed to retrieve error logs" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Format and return the response
    const response: GenerationErrorLogsResponseDTO = {
      error_logs: errorLogs || [],
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Unexpected error in generation-error-logs endpoint:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
