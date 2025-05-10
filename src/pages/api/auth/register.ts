import type { APIRoute } from "astro";
import { z } from "zod";
import { authService } from "../../../lib/services/authService";

// Schema for validating registration data
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input data
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid registration data",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email, password } = result.data;

    // Register the user with Supabase
    const { user, session, error } = await authService.register({ email, password });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Registration failed",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Registration successful, set session cookies
    if (session) {
      const { access_token, refresh_token } = session;

      cookies.set("sb-access-token", access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user?.id,
            email: user?.email,
          },
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fallback error response
    return new Response(
      JSON.stringify({
        success: false,
        error: "User registration failed with no specific error",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Registration endpoint error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "An error occurred during registration",
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

// Set prerender to false for this endpoint
export const prerender = false;
