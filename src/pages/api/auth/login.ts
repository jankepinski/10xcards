import type { APIRoute } from "astro";
import { z } from "zod";
import { authService } from "../../../lib/services/authService";

// Schemat walidacji danych wejściowych
const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parsowanie danych wejściowych
    const body = await request.json();

    // Walidacja danych
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nieprawidłowe dane logowania",
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

    // Próba logowania użytkownika
    const { email, password } = result.data;
    const { user, session, error } = await authService.login({ email, password });

    // Jeśli wystąpił błąd podczas logowania
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Nieprawidłowy email lub hasło",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Jeśli logowanie się powiodło
    if (session) {
      // Ustawienie ciasteczek z tokenami sesji
      const { access_token, refresh_token } = session;

      cookies.set("sb-access-token", access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      });

      cookies.set("sb-refresh-token", refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30, // 30 dni
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
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Jeśli logowanie się nie powiodło, ale nie ma konkretnego błędu
    return new Response(
      JSON.stringify({
        success: false,
        error: "Nie udało się zalogować",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Login endpoint error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd podczas logowania",
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

// Ustawienie opcji prerenderowania na false dla tego endpointu
export const prerender = false;
