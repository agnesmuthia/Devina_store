import type { Metadata } from "next";
import { ContentShell } from "@/components/store/content-shell";
import { getStoreSettings } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Devina Store.",
  alternates: { canonical: "/kontak" },
};

export default async function ContactPage() {
  const { contact } = await getStoreSettings();
  const rows = [
    { label: "WhatsApp", value: contact.whatsapp },
    { label: "Email", value: contact.email },
    { label: "Alamat", value: contact.address },
    { label: "Jam layanan", value: contact.hours },
  ].filter((r) => r.value);

  return (
    <ContentShell title="Hubungi kami" intro="Ada pertanyaan tentang produk atau pesanan? Hubungi kami melalui kontak berikut.">
      {rows.length > 0 ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="rounded-[var(--radius-card)] border border-ink-200 p-5">
              <dt className="text-sm text-ink-600">{r.label}</dt>
              <dd className="mt-1 font-semibold text-ink-950">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-ink-50 p-6 text-sm text-ink-600">
          Informasi kontak akan segera ditambahkan oleh pemilik toko.
        </div>
      )}
    </ContentShell>
  );
}
