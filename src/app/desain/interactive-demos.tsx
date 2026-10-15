"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export function InteractiveDemos() {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => toast.success("Berhasil disimpan")}>Toast sukses</Button>
      <Button variant="outline" onClick={() => toast.error("Gagal menyimpan. Coba lagi.")}>Toast error</Button>
      <Dialog>
        <DialogTrigger className="h-11 rounded-[var(--radius-control)] border border-ink-200 px-4 text-sm font-semibold hover:bg-ink-50">
          Buka dialog
        </DialogTrigger>
        <DialogContent title="Hapus produk?" description="Produk yang diarsipkan tidak tampil di toko.">
          <div className="flex justify-end gap-2">
            <DialogClose className="h-11 rounded-[var(--radius-control)] px-4 text-sm font-semibold hover:bg-ink-100">Batal</DialogClose>
            <Button variant="danger">Arsipkan</Button>
          </div>
        </DialogContent>
      </Dialog>
      <QuantityStepper value={qty} max={10} onChange={setQty} />
    </div>
  );
}
