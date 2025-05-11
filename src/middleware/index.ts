import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.server";

// Lista ścieżek publicznych, które nie wymagają autoryzacji
const PUBLIC_PATHS = [
  // Strony autoryzacji
  "/login",
  "/register",
  "/reset-password",
  "/forgot-password",
  // Endpointy API autoryzacji
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  // Strony publiczne
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  console.log("Middleware - Ścieżka:", url.pathname);

  // Inicjalizacja instancji Supabase dla SSR
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Przypisanie instancji Supabase do locals
  locals.supabase = supabase;

  // Sprawdź sesję użytkownika - zawsze, dla wszystkich ścieżek
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Middleware - Użytkownik:", user ? "zalogowany" : "niezalogowany");

  // Jeśli użytkownik jest zalogowany, przypisz dane do locals
  if (user) {
    console.log("Middleware - Email użytkownika:", user.email);
    locals.user = {
      email: user.email ?? null,
      id: user.id,
    };
    console.log("Middleware - Ustawiono locals.user");
  }

  // Sprawdź czy ścieżka wymaga autoryzacji
  if (!PUBLIC_PATHS.includes(url.pathname) && !user) {
    // Jeśli ścieżka wymaga autoryzacji i użytkownik nie jest zalogowany,
    // przekieruj na stronę logowania
    console.log("Middleware - Przekierowanie na /login (brak autoryzacji)");
    return redirect("/login");
  }

  // Kontynuuj przetwarzanie żądania
  console.log("Middleware - Kontynuacja przetwarzania");
  return next();
});
