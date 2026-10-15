import { Palette, ScanFace, Snowflake, Sparkles, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "perawatan-wajah": Snowflake,
  "perawatan-hidung": ScanFace,
  makeup: Palette,
};

export function categoryIcon(slug: string): LucideIcon {
  return icons[slug] ?? Sparkles;
}
