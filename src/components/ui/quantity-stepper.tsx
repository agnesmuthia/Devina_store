"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label = "Jumlah",
  size = "md",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const clamp = (n: number) => Math.min(Math.max(n, min), Math.max(min, max));
  const btn = cn(
    "grid place-items-center text-ink-800 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-300",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-[var(--radius-control)] border border-ink-200 bg-surface">
      <button type="button" className={btn} onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label="Kurangi jumlah">
        <Minus aria-hidden className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        className={cn(
          "border-x border-ink-200 text-center text-sm font-semibold tabular-nums focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          size === "sm" ? "h-8 w-10" : "h-10 w-12",
        )}
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (Number.isFinite(n)) onChange(clamp(n));
        }}
      />
      <button type="button" className={btn} onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label="Tambah jumlah">
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}
