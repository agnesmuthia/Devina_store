import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Square product image. Shows a neutral placeholder (never a stock photo)
 * until the owner uploads a real one.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
  compact = false,
  className,
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** Small thumbnails show only the icon. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-ink-50", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div role="img" aria-label={`${alt} (foto belum tersedia)`} className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_25%,var(--brand-50),var(--ink-50)_70%)]">
          <div className="flex flex-col items-center gap-2 text-ink-300">
            <Sparkles aria-hidden className={compact ? "size-5" : "size-8"} strokeWidth={1.25} />
            {!compact && <span className="text-[11px] font-medium tracking-wide text-ink-500 uppercase">Foto segera</span>}
          </div>
        </div>
      )}
    </div>
  );
}
