import type { Metadata } from "next";
import { SubpageShell } from "@/components/subpage-shell";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return {
    title: "AI Workflow Templates | Atlas AI Directory",
    description:
      "Execution-ready AI workflow playbooks for support, sales, and internal operations teams.",
    alternates: {
      canonical: new URL("/workflows", baseUrl).toString(),
    },
  };
}

export default function WorkflowsPage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const workflowsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "AI Workflow Templates",
        description:
          "Execution-ready AI workflow playbooks for support, sales, and internal operations teams.",
        url: new URL("/workflows", baseUrl).toString(),
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
            name: "Workflows",
            item: new URL("/workflows", baseUrl).toString(),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workflowsJsonLd) }}
      />
      <SubpageShell
        title="Workflows"
        kicker="Execution templates"
        subtitle="Use practical playbooks to deploy AI automation in support, sales, and internal operations with less trial-and-error."
        quickCards={[
          {
            title: "Inbound Support",
            description: "Classify, prioritize, and draft responses with guardrails.",
          },
          {
            title: "Outbound Pipeline",
            description: "Research accounts, enrich leads, and trigger outreach loops.",
          },
          {
            title: "Ops Reporting",
            description: "Aggregate metrics and publish weekly executive summaries.",
          },
        ]}
        sectionTitle="Workflow quality standard"
        sectionBody="Templates are built for real teams and document trigger logic, handoff points, fallback rules, and required integrations before production rollout."
        sectionLinks={[
          { label: "Best AI Tools for Customer Support", href: "/best-ai-tools-for-support" },
          { label: "Best AI Agents for Sales", href: "/best-ai-agents-for-sales" },
          { label: "Editorial Policy", href: "/editorial-policy" },
          { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
        ]}
      />
    </>
  );
}
