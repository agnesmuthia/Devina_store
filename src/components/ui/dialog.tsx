"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

/**
 * Accessible modal. `side="right" | "left"` renders a drawer (mobile menus, filters);
 * the default is a centered dialog that becomes a bottom sheet on small screens.
 */
export function DialogContent({
  title,
  description,
  side = "center",
  children,
  className,
}: {
  title: string;
  description?: string;
  side?: "center" | "left" | "right";
  children: ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink-950/40" />
      <RadixDialog.Content
        className={cn(
          "fixed z-50 flex flex-col bg-surface shadow-[var(--shadow-raised)] focus:outline-none",
          side === "center" &&
            "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[var(--radius-card)] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-card)]",
          side === "left" && "inset-y-0 left-0 w-[86vw] max-w-sm",
          side === "right" && "inset-y-0 right-0 w-[86vw] max-w-sm",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div>
            <RadixDialog.Title className="text-base font-semibold text-ink-950">{title}</RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="mt-0.5 text-sm text-ink-600">{description}</RadixDialog.Description>
            ) : (
              <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close className="-m-2 grid size-10 place-items-center rounded-full text-ink-600 hover:bg-ink-100" aria-label="Tutup">
            <X aria-hidden className="size-5" />
          </RadixDialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
