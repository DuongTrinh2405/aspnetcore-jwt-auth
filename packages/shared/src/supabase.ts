import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CurrentUserProfile, UserRole } from "./types";

const AUTH_REQUEST_TIMEOUT_MS = 6000;

async function withTimeout<T>(task: PromiseLike<T>, timeoutMs = AUTH_REQUEST_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
      })
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(
    url || "http://127.0.0.1:54321",
    anonKey || "missing-supabase-anon-key"
  );
}

export async function getCurrentUserProfile(
  supabase: SupabaseClient
): Promise<CurrentUserProfile | null> {
  const {
    data: { user },
    error: authError
  } = await withTimeout(supabase.auth.getUser());

  if (authError || !user) {
    return null;
  }

  const { data, error } = await withTimeout(
    supabase
      .from("users")
      .select("id, role, full_name, phone, avatar_url, is_active")
      .eq("id", user.id)
      .single()
  );

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: user.email ?? null,
    role: data.role as UserRole,
    fullName: data.full_name,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    isActive: data.is_active
  };
}
