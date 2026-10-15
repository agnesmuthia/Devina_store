import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function ContentShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <Breadcrumbs items={[{ label: "Beranda", href: "/" }, { label: title }]} />
      <h1 className="mt-4 font-display text-3xl font-medium text-ink-950 sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-ink-600">{intro}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function ContentPending() {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-ink-50 p-6 text-sm text-ink-600">
      Konten halaman ini sedang disiapkan oleh pemilik toko dan akan segera diperbarui.
    </div>
  );
}
