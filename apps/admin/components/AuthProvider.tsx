"use client";

import { getCurrentUserProfile, type CurrentUserProfile } from "@cnl/shared";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  loading: boolean;
  profile: CurrentUserProfile | null;
  refreshProfile: () => Promise<CurrentUserProfile | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_CACHE_KEY = "cnl.adminCurrentUserProfile";

function readCachedProfile(): CurrentUserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CurrentUserProfile) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: CurrentUserProfile | null): void {
  if (typeof window === "undefined") return;

  if (!profile) {
    window.sessionStorage.removeItem(PROFILE_CACHE_KEY);
    return;
  }

  window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function applyProfile(nextProfile: CurrentUserProfile | null) {
    writeCachedProfile(nextProfile);
    if (!nextProfile) {
      await supabase.auth.signOut({ scope: "local" });
    }
    setProfile(nextProfile);
    setLoading(false);
  }

  async function refreshProfile() {
    const nextProfile = await getCurrentUserProfile(supabase).catch(() => null);
    await applyProfile(nextProfile);
    return nextProfile;
  }

  useEffect(() => {
    let mounted = true;
    const cachedProfile = readCachedProfile();

    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
    }

    async function loadProfile() {
      const nextProfile = await getCurrentUserProfile(supabase).catch(() => null);
      if (!mounted) return;
      await applyProfile(nextProfile);
    }

    loadProfile();

    const timeout = window.setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 7000);

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event === "SIGNED_OUT") {
        writeCachedProfile(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      window.setTimeout(() => {
        void refreshProfile();
      }, 0);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ loading, profile, refreshProfile }), [loading, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
