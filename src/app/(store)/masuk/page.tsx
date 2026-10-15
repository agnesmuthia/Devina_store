import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Masuk", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <EmptyState
        icon={UserRound}
        title="Fitur akun sedang disiapkan"
        description="Pendaftaran, masuk, dan riwayat pesanan akan segera tersedia. Sementara itu, kamu tetap bisa melihat produk dan mengisi keranjang."
        action={
          <Link href="/produk" className={buttonStyles({ variant: "outline" })}>
            Lihat produk
          </Link>
        }
      />
    </div>
  );
}
