"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type AdminSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type AdminSelectProps = {
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  value: string | number | undefined;
};

export function AdminSelect({ className = "", disabled = false, onChange, options, value }: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const stringValue = String(value ?? "");
  const selected = useMemo(
    () => options.find((option) => option.value === stringValue) ?? options[0],
    [options, stringValue]
  );

  useEffect(() => {
    if (!open) return;

    function updateMenuRect() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuRect({
        left: rect.left,
        top: rect.bottom + 6,
        width: rect.width
      });
    }

    updateMenuRect();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuRect);
    window.addEventListener("scroll", updateMenuRect, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuRect);
      window.removeEventListener("scroll", updateMenuRect, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        aria-expanded={open}
        className={`premium-input flex items-center justify-between gap-3 text-left ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        disabled={disabled}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Chọn"}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition duration-200 ${open ? "rotate-180 text-blue-600" : ""}`} />
      </button>

      {open && menuRect && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[90] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-blue-500/5 backdrop-blur animate-slide-down"
              style={{ left: menuRect.left, top: menuRect.top, width: menuRect.width }}
            >
              <div className="max-h-72 overflow-auto">
                {options.map((option) => {
                  const active = option.value === stringValue;
                  return (
                    <button
                      key={option.value}
                      className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition duration-150 ${
                        active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      } ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                      disabled={option.disabled}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

type AdminConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  danger?: boolean;
  description: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function AdminConfirmDialog({
  cancelLabel = "Hủy",
  confirmLabel,
  danger = false,
  description,
  icon,
  loading = false,
  onCancel,
  onConfirm,
  open,
  title
}: AdminConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => confirmRef.current?.focus(), 80);
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Đóng hộp xác nhận" onClick={onCancel} />
      <section className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] animate-slide-down">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${danger ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
                {icon}
              </div>
            ) : null}
            <div>
              <h2 id="admin-confirm-title" className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          <button className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" type="button" onClick={onCancel}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="secondary-button min-h-10 px-4 py-2 text-sm" disabled={loading} type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={`premium-button min-h-10 px-4 py-2 text-sm ${danger ? "bg-rose-600 hover:bg-rose-700" : ""}`}
            disabled={loading}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
