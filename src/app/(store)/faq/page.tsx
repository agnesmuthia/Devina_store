import type { Metadata } from "next";
import { ContentPending, ContentShell } from "@/components/store/content-shell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan yang sering diajukan seputar belanja di Devina Store.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <ContentShell title="Pertanyaan yang sering diajukan">
      <ContentPending />
    </ContentShell>
  );
}
