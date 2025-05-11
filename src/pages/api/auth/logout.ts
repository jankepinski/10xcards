import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, redirect }) => {
  try {
    const supabase = locals.supabase;

    // Wylogowanie użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Przekierowanie na stronę główną po wylogowaniu
    return redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd podczas wylogowania." }), { status: 500 });
  }
};
