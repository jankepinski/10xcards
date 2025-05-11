import type { APIRoute } from "astro";
import { z } from "zod";

// Schema walidacji danych wejściowych
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const parsedData = loginSchema.safeParse(body);
    if (!parsedData.success) {
      return new Response(
        JSON.stringify({
          error: "Niepoprawne dane. Email musi być poprawny, a hasło musi mieć co najmniej 6 znaków.",
        }),
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    // Pobierz instancję Supabase z locals
    const supabase = locals.supabase;

    // Logowanie przez Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Zwróć sukces i ścieżkę do przekierowania zamiast bezpośredniego przekierowania
    return new Response(
      JSON.stringify({
        success: true,
        redirectTo: "/generate-flashcards",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd podczas logowania." }), { status: 500 });
  }
};
