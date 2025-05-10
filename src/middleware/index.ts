import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware(async (context: APIContext, next: () => Promise<Response>) => {
  // Dodanie klienta Supabase do kontekstu
  context.locals.supabase = supabaseClient;

  // Pobieranie tokenów z ciasteczek
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  // Jeśli mamy tokeny, ustawiamy sesję
  if (accessToken && refreshToken) {
    // Ustawienie sesji dla Supabase Auth
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error) {
      // Dodaj dane użytkownika do kontekstu
      context.locals.user = data.user;
      context.locals.session = data.session;

      // Jeśli tokeny zostały odświeżone, aktualizujemy ciasteczka
      if (data.session && accessToken !== data.session.access_token) {
        context.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 dni
        });

        context.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 dni
        });
      }
    } else {
      // W przypadku błędu sesji, usuń ciasteczka
      context.cookies.delete("sb-access-token", { path: "/" });
      context.cookies.delete("sb-refresh-token", { path: "/" });
    }
  }

  // Kontynuuj do następnego middleware lub handlera
  return next();
});
