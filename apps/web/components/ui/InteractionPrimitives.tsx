"use client";

import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export type AppSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export function AppSelect({
  className = "",
  disabled = false,
  onChange,
  options,
  value
}: {
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  value: string | number | undefined;
}) {
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
        top: rect.bottom + 8,
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
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition duration-150 ${
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
