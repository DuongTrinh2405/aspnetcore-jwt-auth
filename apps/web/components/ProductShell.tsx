"use client";

import type { CurrentUserProfile } from "@cnl/shared";
import type React from "react";
import { AppShell } from "./AppShell";

type ProductShellProps = {
  profile: CurrentUserProfile;
  children: React.ReactNode;
};

export function ProductShell({ children, profile }: ProductShellProps) {
  return <AppShell profile={profile}>{children}</AppShell>;
}
