"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Category } from "@/lib/catalog";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const link = "block rounded-[var(--radius-control)] px-3 py-2.5 text-[15px] text-ink-800 hover:bg-ink-50";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="-ml-2 grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-100 lg:hidden" aria-label="Buka menu">
        <Menu aria-hidden className="size-[22px]" strokeWidth={1.75} />
      </DialogTrigger>
      <DialogContent title="Menu" side="left">
        <nav aria-label="Menu utama" className="-mx-3 flex flex-col">
          <Link href="/produk" onClick={close} className={`${link} font-semibold`}>
            Semua produk
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`} onClick={close} className={link}>
              {c.name}
            </Link>
          ))}
          <hr className="my-3 border-ink-100" />
          <Link href="/masuk" onClick={close} className={link}>
            Masuk / Daftar
          </Link>
          <Link href="/faq" onClick={close} className={link}>
            FAQ
          </Link>
          <Link href="/kontak" onClick={close} className={link}>
            Kontak
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
