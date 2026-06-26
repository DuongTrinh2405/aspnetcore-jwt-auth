"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallMethod = "browser" | "ios";

type PwaInstallState = {
  canInstall: boolean;
  closeIosInstructions: () => void;
  dismiss: () => void;
  install: () => Promise<void>;
  installMethod: InstallMethod | null;
  installed: boolean;
  iosInstructionsOpen: boolean;
  resetDismissed: () => void;
  showIosHint: boolean;
};

const DISMISS_STORAGE_KEY = "pwa-install-dismissed-at";
const LEGACY_DISMISS_STORAGE_KEY = "cnl:pwa-install-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const PwaInstallContext = createContext<PwaInstallState | null>(null);

function isBeforeInstallPromptEvent(event: Event): event is BeforeInstallPromptEvent {
  return "prompt" in event && "userChoice" in event;
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform ?? "";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneMedia = typeof window.matchMedia === "function" ? window.matchMedia("(display-mode: standalone)").matches : false;
  return standaloneMedia || window.navigator.standalone === true;
}

function isPrivateLanHost(hostname: string) {
  return (
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function isValidInstallEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname, protocol } = window.location;
  if (protocol !== "https:") return false;
  if (hostname === "localhost" || hostname === "127.0.0.1" || isPrivateLanHost(hostname)) return false;
  return true;
}

function readDismissedAt(): number | null {
  try {
    const value = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (value) {
      const timestamp = Number(value);
      return Number.isFinite(timestamp) ? timestamp : null;
    }

    return window.localStorage.getItem(LEGACY_DISMISS_STORAGE_KEY) === "1" ? Date.now() : null;
  } catch {
    return null;
  }
}

function isDismissedRecently(): boolean {
  const dismissedAt = readDismissedAt();
  return dismissedAt !== null && Date.now() - dismissedAt < DISMISS_DURATION_MS;
}

function writeDismissedAt() {
  try {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage may be blocked; install UI should still remain safe.
  }
}

function clearDismissedAt() {
  try {
    window.localStorage.removeItem(DISMISS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_DISMISS_STORAGE_KEY);
  } catch {
    // Storage may be blocked; install UI should still remain safe.
  }
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function usePwaInstallPrompt() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstallPrompt must be used inside PwaInstallProvider");
  }
  return context;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [validEnvironment, setValidEnvironment] = useState(false);
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false);

  useEffect(() => {
    setValidEnvironment(isValidInstallEnvironment());
    setDismissed(isDismissedRecently());
    setInstalled(isStandaloneMode());

    function handleBeforeInstallPrompt(event: Event) {
      if (!isBeforeInstallPromptEvent(event)) return;
      event.preventDefault();
      if (!isValidInstallEnvironment() || isStandaloneMode()) return;
      setInstallPrompt(event);
      setDismissed(isDismissedRecently());
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      writeDismissedAt();
      setDismissed(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showIosHint = useMemo(() => validEnvironment && !dismissed && !installed && isIosDevice(), [dismissed, installed, validEnvironment]);
  const canInstall = validEnvironment && !dismissed && !installed && (installPrompt !== null || showIosHint);
  const installMethod: InstallMethod | null = installPrompt ? "browser" : showIosHint ? "ios" : null;

  async function install() {
    if (showIosHint && !installPrompt) {
      setIosInstructionsOpen(true);
      return;
    }

    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      writeDismissedAt();
      setDismissed(true);
    } else {
      writeDismissedAt();
      setDismissed(true);
    }
    setInstallPrompt(null);
  }

  function dismiss() {
    writeDismissedAt();
    setDismissed(true);
    setIosInstructionsOpen(false);
  }

  function resetDismissed() {
    clearDismissedAt();
    setDismissed(false);
  }

  const value = useMemo<PwaInstallState>(
    () => ({
      canInstall,
      closeIosInstructions: () => setIosInstructionsOpen(false),
      dismiss,
      install,
      installMethod,
      installed,
      iosInstructionsOpen,
      resetDismissed,
      showIosHint
    }),
    [canInstall, installMethod, installed, iosInstructionsOpen, showIosHint]
  );

  return createElement(PwaInstallContext.Provider, { value }, children);
}
