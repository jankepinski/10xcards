import type { APIRoute } from "astro";
import { z } from "zod";

// Schema walidacji danych wejściowych
const registerSchema = z
  .object({
    email: z.string().email("Proszę podać poprawny adres email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      const formattedErrors = parsedData.error.format();
      return new Response(
        JSON.stringify({
          error: "Niepoprawne dane w formularzu",
          details: formattedErrors,
        }),
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    // Pobierz instancję Supabase z locals
    const supabase = locals.supabase;

    // Rejestracja przez Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Sprawdź, czy utworzono użytkownika
    if (data?.user) {
      // Zwróć sukces i ścieżkę do przekierowania
      return new Response(
        JSON.stringify({
          success: true,
          redirectTo: "/generate-flashcards",
          message: "Konto zostało utworzone. Możesz teraz korzystać z aplikacji.",
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Nie udało się utworzyć konta z nieznanych przyczyn.",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd podczas rejestracji." }), { status: 500 });
  }
};
