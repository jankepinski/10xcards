import type { APIContext } from "astro";
import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware((context: APIContext, next: () => Promise<Response>) => {
  context.locals.supabase = supabaseClient;
  return next();
});
