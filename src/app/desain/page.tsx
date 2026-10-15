import type { Metadata } from "next";
import { Heart, PackageOpen } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Td, Th } from "@/components/ui/table";
import { InteractiveDemos } from "./interactive-demos";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const swatches = [
  ["ink-950", "bg-ink-950"], ["ink-600", "bg-ink-600"], ["ink-200", "bg-ink-200"], ["ink-50", "bg-ink-50"],
  ["brand-800", "bg-brand-800"], ["brand-700", "bg-brand-700"], ["brand-100", "bg-brand-100"], ["brand-50", "bg-brand-50"],
  ["success", "bg-success-700"], ["warning", "bg-warning-700"], ["danger", "bg-danger-700"],
];

/** Internal reference page for the component library (not linked, not indexed). */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:px-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">Devina Store</p>
        <h1 className="mt-2 font-display text-4xl font-medium">Design system</h1>
        <p className="mt-2 text-ink-600">Token warna, tipografi, dan komponen yang dipakai di toko dan dashboard admin.</p>
      </header>

      <Section title="Warna">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {swatches.map(([name, cls]) => (
            <div key={name}>
              <div className={`h-14 rounded-[var(--radius-control)] border border-ink-200 ${cls}`} />
              <p className="mt-1.5 text-xs text-ink-600">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografi">
        <p className="font-display text-[56px] leading-none font-medium tracking-[-0.02em]">Display 56</p>
        <p className="font-display text-4xl font-medium">Heading 40 / 32</p>
        <p className="font-display text-2xl font-medium">Section 24</p>
        <p className="text-lg font-semibold">Title 18 — Plus Jakarta Sans</p>
        <p className="max-w-prose text-base text-ink-800">Body 16. Teks utama memakai line-height lega agar nyaman dibaca di layar ponsel.</p>
        <p className="text-sm text-ink-600">Small 14 — keterangan dan label.</p>
        <p className="text-xs text-ink-500">Caption 12</p>
      </Section>

      <Section title="Tombol">
        <div className="flex flex-wrap gap-3">
          <Button>Utama</Button>
          <Button variant="secondary">Sekunder</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Hapus</Button>
          <Button loading>Menyimpan</Button>
          <Button disabled>Nonaktif</Button>
          <Button variant="outline" size="icon" aria-label="Wishlist"><Heart aria-hidden className="size-4" /></Button>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <Input label="Nama lengkap" placeholder="Nama sesuai KTP" />
          <Input label="Nomor HP" hint="Dipakai kurir untuk menghubungimu." inputMode="tel" />
          <Input label="Email" error="Format email tidak valid." defaultValue="devina@" />
          <Select label="Kurir" defaultValue="jne">
            <option value="jne">JNE</option>
            <option value="jnt">J&T</option>
          </Select>
        </div>
      </Section>

      <Section title="Badge & harga">
        <div className="flex flex-wrap gap-2">
          <Badge>Draft</Badge><Badge tone="brand">Unggulan</Badge><Badge tone="sale">Hemat 13%</Badge>
          <Badge tone="success">Dibayar</Badge><Badge tone="warning">Menunggu pembayaran</Badge><Badge tone="danger">Kedaluwarsa</Badge>
        </div>
        <Price price={{ current: 39000, original: 45000, onSale: true, discountPercent: 13 }} size="lg" />
      </Section>

      <Section title="Notifikasi, dialog, jumlah">
        <div className="grid gap-3">
          <Alert tone="info">Ongkir dihitung otomatis saat checkout.</Alert>
          <Alert tone="success" title="Pembayaran diterima">Pesanan sedang dikemas.</Alert>
          <Alert tone="warning">Stok tersisa 3.</Alert>
          <Alert tone="danger" title="Gagal menghitung ongkir">Layanan kurir sedang tidak tersedia. Coba lagi.</Alert>
        </div>
        <InteractiveDemos />
      </Section>

      <Section title="Kartu & tabel">
        <Card className="max-w-sm">
          <CardHeader><p className="font-semibold">Ringkasan</p></CardHeader>
          <CardBody className="text-sm text-ink-600">Kartu dipakai hanya untuk konten yang dikelompokkan.</CardBody>
        </Card>
        <Table>
          <thead><tr><Th>Pesanan</Th><Th>Status</Th><Th className="text-right">Total</Th></tr></thead>
          <tbody>
            <tr><Td>DVS-251015-7K3Q</Td><Td><Badge tone="warning">Menunggu pembayaran</Badge></Td><Td className="text-right tabular-nums">Rp 84.000</Td></tr>
            <tr><Td>DVS-251015-9P2A</Td><Td><Badge tone="success">Dibayar</Badge></Td><Td className="text-right tabular-nums">Rp 59.000</Td></tr>
          </tbody>
        </Table>
      </Section>

      <Section title="Loading & kosong">
        <div className="flex gap-4"><Skeleton className="size-20" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/3" /></div></div>
        <EmptyState icon={PackageOpen} title="Belum ada pesanan" description="Pesanan yang masuk akan muncul di sini." className="rounded-[var(--radius-card)] border border-dashed border-ink-200" />
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h2 className="border-b border-ink-100 pb-2 text-sm font-semibold tracking-[0.12em] text-ink-500 uppercase">{title}</h2>
      {children}
    </section>
  );
}
