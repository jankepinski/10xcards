import { supabaseClient } from "../../db/supabase.client";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const authService = {
  /**
   * Loguje użytkownika używając Supabase Auth
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      return {
        user: data?.user || null,
        session: data?.session || null,
        error,
      };
    } catch (err) {
      console.error("Login error:", err);
      return {
        user: null,
        session: null,
        error: err as AuthError,
      };
    }
  },

  /**
   * Wylogowuje użytkownika
   */
  async logout(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabaseClient.auth.signOut();
      return { error };
    } catch (err) {
      console.error("Logout error:", err);
      return { error: err as AuthError };
    }
  },

  /**
   * Sprawdza, czy użytkownik jest zalogowany
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      return {
        session: data?.session || null,
        error,
      };
    } catch (err) {
      console.error("Get session error:", err);
      return { session: null, error: err as AuthError };
    }
  },
};
