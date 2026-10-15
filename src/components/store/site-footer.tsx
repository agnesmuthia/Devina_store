import Link from "next/link";
import { listTopLevelCategories } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/store-config";
import { Logo } from "./logo";

const policyLinks = [
  { href: "/kebijakan/pengiriman", label: "Pengiriman" },
  { href: "/kebijakan/pembatalan", label: "Pembatalan" },
  { href: "/kebijakan/pengembalian", label: "Pengembalian" },
  { href: "/kebijakan/privasi", label: "Privasi" },
  { href: "/kebijakan/syarat-ketentuan", label: "Syarat & ketentuan" },
];

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getStoreSettings(), listTopLevelCategories()]);
  const { contact } = settings;
  const hasContact = contact.whatsapp || contact.email || contact.address;
  const heading = "mb-3 text-xs font-semibold tracking-[0.12em] text-ink-500 uppercase";
  const link = "text-sm text-ink-600 hover:text-ink-950";

  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo name={settings.name} />
          <p className="mt-3 max-w-xs text-sm text-ink-600">{settings.tagline}</p>
        </div>
        <div>
          <h2 className={heading}>Belanja</h2>
          <ul className="space-y-2">
            <li><Link href="/produk" className={link}>Semua produk</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link href={`/kategori/${c.slug}`} className={link}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={heading}>Bantuan</h2>
          <ul className="space-y-2">
            <li><Link href="/faq" className={link}>FAQ</Link></li>
            <li><Link href="/kontak" className={link}>Kontak</Link></li>
            {policyLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className={link}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={heading}>Hubungi kami</h2>
          {hasContact ? (
            <ul className="space-y-2 text-sm text-ink-600">
              {contact.whatsapp && <li>WhatsApp: {contact.whatsapp}</li>}
              {contact.email && <li>Email: {contact.email}</li>}
              {contact.address && <li>{contact.address}</li>}
              {contact.hours && <li>{contact.hours}</li>}
            </ul>
          ) : (
            <p className="text-sm text-ink-600">Informasi kontak akan segera ditambahkan.</p>
          )}
        </div>
      </div>
      <div className="border-t border-ink-200/70">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-500 sm:px-6">
          © {settings.name}. Pembayaran diproses oleh Midtrans; pengiriman melalui mitra kurir.
        </p>
      </div>
    </footer>
  );
}
