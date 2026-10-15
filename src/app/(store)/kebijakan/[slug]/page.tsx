import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPending, ContentShell } from "@/components/store/content-shell";
import { getPolicyPage, policyPages } from "@/lib/content/pages";

export function generateStaticParams() {
  return policyPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/kebijakan/[slug]">): Promise<Metadata> {
  const page = getPolicyPage((await params).slug);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/kebijakan/${page.slug}` } };
}

export default async function PolicyPage({ params }: PageProps<"/kebijakan/[slug]">) {
  // Every valid slug is prerendered, so awaiting params here keeps the page fully static.
  const page = getPolicyPage((await params).slug);
  if (!page) notFound();
  return (
    <ContentShell title={page.title} intro={page.description}>
      <ContentPending />
    </ContentShell>
  );
}
