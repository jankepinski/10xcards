import type { APIRoute } from "astro";
import { authService } from "../../../lib/services/authService";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Wylogowanie użytkownika przez Supabase Auth
    const { error } = await authService.logout();

    if (error) {
      console.error("Logout error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Wystąpił błąd podczas wylogowania",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Usuń ciasteczka sesji
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Logout endpoint error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Wystąpił błąd podczas wylogowania",
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
