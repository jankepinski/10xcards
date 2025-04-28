import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerationErrorLogDTO } from "../../types";

/**
 * Retrieves generation error logs for a specific user
 * @param supabase The Supabase client instance
 * @param userId The ID of the user whose logs to retrieve
 * @returns Object containing either the error logs or an error
 */
export async function getUserGenerationErrorLogs(
  supabase: SupabaseClient,
  userId: string
): Promise<{ data: GenerationErrorLogDTO[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("generation_error_logs")
      .select("id, error_code, error_message, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error occurred"),
    };
  }
}

/**
 * Retrieves a single generation error log by ID for a specific user
 * @param supabase The Supabase client instance
 * @param errorLogId The ID of the error log to retrieve
 * @param userId The ID of the user requesting the log
 * @returns Object containing either the error log or an error
 */
export async function getGenerationErrorLogById(
  supabase: SupabaseClient,
  errorLogId: number,
  userId: string
): Promise<{ data: GenerationErrorLogDTO | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("generation_error_logs")
      .select("id, error_code, error_message, created_at")
      .eq("id", errorLogId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // Check if the error is a "not found" error
      if (error.code === "PGRST116") {
        return { data: null, error: null }; // Return null data to indicate not found
      }
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error occurred"),
    };
  }
}
