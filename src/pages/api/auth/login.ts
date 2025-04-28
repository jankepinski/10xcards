import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Schema for login request validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * POST /api/auth/login
 *
 * A simple login endpoint that returns a session token for testing with Postman.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    // Handle validation errors
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid login credentials",
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

    // Extract validated credentials
    const { email, password } = validationResult.data;

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication error
    if (error) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid email or password",
          details: error.message,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return session data with access token
    return new Response(
      JSON.stringify({
        message: "Login successful",
        session: data.session,
        // Include specific instructions for Postman users
        postman_instructions: "For testing, add the Authorization header with value: 'Bearer ' + access_token",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);

    // Generic error response
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to process login request",
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
