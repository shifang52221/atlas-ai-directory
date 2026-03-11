import type { Metadata } from "next";
import { SubpageShell } from "@/components/subpage-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    title: "Compare AI Tools | Atlas AI Directory",
    description:
      "Decision-focused AI tool comparisons using setup speed, quality, flexibility, and total cost criteria.",
    alternates: {
      canonical: new URL("/compare", baseUrl).toString(),
    },
  };
}

export default function ComparePage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const compareJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "AI Tool Comparison",
        description:
          "Decision-focused AI tool comparisons using setup speed, quality, flexibility, and total cost criteria.",
        url: new URL("/compare", baseUrl).toString(),
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
            name: "Compare",
            item: new URL("/compare", baseUrl).toString(),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <SubpageShell
        title="Compare Tools"
        kicker="Decision-focused comparison"
        subtitle="Side-by-side comparisons with decision criteria that matter for operators: setup speed, quality, flexibility, and total cost."
        quickCards={[
          {
            title: "Cost Model",
            description: "Free tier limits, seat pricing, usage caps, and hidden fees.",
          },
          {
            title: "Setup Friction",
            description: "How fast non-technical teams can launch in production.",
          },
          {
            title: "Scale Fit",
            description: "Workflow depth, API coverage, and vendor lock-in risk.",
          },
        ]}
        sectionTitle="Comparison methodology"
        sectionBody="Each tool is evaluated across practical implementation factors using public pricing, integration docs, and operator-oriented workflows. Sponsored status is always disclosed."
        sectionLinks={[
          { label: "Best AI Automation Tools", href: "/best-ai-automation-tools" },
          { label: "Best AI Tools for Marketing", href: "/best-ai-tools-for-marketing" },
          { label: "Editorial Policy", href: "/editorial-policy" },
          { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
        ]}
      />
    </>
  );
}
