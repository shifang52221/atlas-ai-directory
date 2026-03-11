import type { Metadata } from "next";
import { SubpageShell } from "@/components/subpage-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    title: "AI Use Cases | Atlas AI Directory",
    description:
      "Intent-first navigation to discover AI tools by outcomes and deployment scenarios.",
    alternates: {
      canonical: new URL("/use-cases", baseUrl).toString(),
    },
  };
}

export default function UseCasesPage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const useCasesJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "AI Use Cases",
        description:
          "Intent-first navigation to discover AI tools by outcomes and deployment scenarios.",
        url: new URL("/use-cases", baseUrl).toString(),
        isPartOf: {
          "@type": "WebSite",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Use Cases",
            item: new URL("/use-cases", baseUrl).toString(),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(useCasesJsonLd) }}
      />
      <SubpageShell
        title="Use Cases"
        kicker="Intent-first navigation"
        subtitle="Find AI tools by outcome instead of brand names so teams can move from idea to execution quickly."
        quickCards={[
          {
            title: "Support Triage",
            description: "Auto-route tickets, summarize context, and trigger replies.",
          },
          {
            title: "Lead Enrichment",
            description: "Append contact and company signals before outbound.",
          },
          {
            title: "Internal Ops",
            description: "Automate recurring tasks across sheets, CRM, and email.",
          },
        ]}
        sectionTitle="How to use this page"
        sectionBody="Start from your team goal, shortlist 2 to 3 tools, then compare setup time, budget fit, and integration depth before selecting a final stack."
        sectionLinks={[
          { label: "Best AI Automation Tools", href: "/best-ai-automation-tools" },
          { label: "Best AI Agents for Sales", href: "/best-ai-agents-for-sales" },
          { label: "Editorial Policy", href: "/editorial-policy" },
          { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
        ]}
      />
    </>
  );
}
