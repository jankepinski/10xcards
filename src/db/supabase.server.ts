import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: process.env.NODE_ENV === "production", // Allow insecure in dev mode
  httpOnly: true,
  sameSite: "lax",
};

// Helper to safely access import.meta.env
const getEnv = (key: string): string => {
  // @ts-expect-error - This is the correct way to access env vars in Astro
  return import.meta.env[key] || "";
};

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  // Using the same env variables that are used in supabase.client.ts
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_KEY");

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      get(name) {
        const cookie = context.cookies.get(name);
        return cookie?.value;
      },
      set(name, value, options) {
        context.cookies.set(name, value, options);
      },
      remove(name, options) {
        context.cookies.delete(name, options);
      },
    },
  });

  return supabase;
};
