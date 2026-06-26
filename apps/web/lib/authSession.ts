import { supabase } from "./supabase";

const PROFILE_CACHE_KEY = "cnl.currentUserProfile";

export function clearLocalAuthProfile() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
}

export async function signOutAndRedirect(path = "/login") {
  clearLocalAuthProfile();
  await supabase.auth.signOut();
  window.location.href = path;
}
