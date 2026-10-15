import Link from "next/link";

/** Text wordmark until the owner uploads a logo in admin settings. */
export function Logo({ name }: { name: string }) {
  const [first, ...rest] = name.split(" ");
  return (
    <Link href="/" className="inline-flex items-baseline gap-1.5 rounded-sm" aria-label={`${name} — beranda`}>
      <span className="font-display text-[26px] leading-none font-semibold tracking-tight text-brand-800">{first}</span>
      {rest.length > 0 && (
        <span className="text-[11px] font-semibold tracking-[0.2em] text-ink-600 uppercase">{rest.join(" ")}</span>
      )}
    </Link>
  );
}
