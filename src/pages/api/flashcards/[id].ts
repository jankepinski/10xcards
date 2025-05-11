import type { APIRoute } from "astro";
import { getFlashcardById, updateFlashcardById, deleteFlashcardById } from "../../../lib/services/flashcardService";
import { flashcardIdSchema, updateFlashcardSchema } from "../../../lib/schemas/flashcardSchemas";
// import type { Session } from "@supabase/supabase-js";
import type { DeleteResponseDTO } from "../../../types";

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

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ensure user is authenticated
  if (!user) {
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

/**
 * PUT /flashcards/{id} - Updates a single flashcard by ID
 *
 * Returns:
 * - 200 OK with the updated flashcard data
 * - 400 Bad Request if the ID or body data is invalid
 * - 401 Unauthorized if the user is not authenticated
 * - 404 Not Found if the flashcard doesn't exist or belongs to another user
 * - 500 Internal Server Error if there's a server error
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ensure user is authenticated
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Validate the ID parameter
    const idResult = flashcardIdSchema.safeParse({ id: params.id });
    if (!idResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: idResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the validated ID
    const { id } = idResult.data;

    // Parse and validate the request body
    const body = await request.json();
    const bodyResult = updateFlashcardSchema.safeParse(body);

    // Handle validation errors
    if (!bodyResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: bodyResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the validated flashcard update data
    const updateData = bodyResult.data;
    // Update the flashcard
    const updatedFlashcard = await updateFlashcardById(supabase, id, {
      front: updateData.front ?? "",
      back: updateData.back ?? "",
    });

    // Return 404 if the flashcard wasn't found or doesn't belong to user
    if (!updatedFlashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the updated flashcard
    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating flashcard:", error);

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

/**
 * DELETE /flashcards/{id} - Deletes a single flashcard by ID
 *
 * Returns:
 * - 200 OK with a success message
 * - 400 Bad Request if the ID is invalid
 * - 401 Unauthorized if the user is not authenticated
 * - 404 Not Found if the flashcard doesn't exist or belongs to another user
 * - 500 Internal Server Error if there's a server error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ensure user is authenticated
  if (!user) {
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

    // Delete the flashcard
    const deleted = await deleteFlashcardById(supabase, id);

    // Return 404 if the flashcard wasn't found or doesn't belong to user
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success response
    const response: DeleteResponseDTO = {
      message: `Flashcard with ID ${id} successfully deleted`,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting flashcard:", error);

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
