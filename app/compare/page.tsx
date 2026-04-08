import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { getComparePageData } from "@/lib/compare-page-data";
import { getCanonicalToolVsHref } from "@/lib/tool-vs-pages";
import styles from "./page.module.css";

const nav = [
  { label: "Categories", href: "/use-cases" },
  { label: "Popular", href: "/tools" },
  { label: "New", href: "/tools" },
  { label: "Compare", href: "/compare" },
  { label: "Workflows", href: "/workflows" },
];

const evaluationCriteria = [
  "Setup speed for the first production workflow",
  "Workflow depth, branching control, and team ownership fit",
  "Total cost at realistic monthly usage, not only starter pricing",
  "Operational reliability, fallbacks, and governance clarity before scale",
];

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

type ComparePageProps = {
  searchParams: Promise<{
    tool?: string | string[];
    vs?: string | string[];
  }>;
};

function getSingleQueryValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatGuideType(value: "best_of" | "alternatives" | "vs"): string {
  if (value === "best_of") {
    return "Best-of guide";
  }

  if (value === "alternatives") {
    return "Alternatives";
  }

  return "VS guide";
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const query = await searchParams;
  const toolSlug = getSingleQueryValue(query.tool);
  const vsToolSlug = getSingleQueryValue(query.vs);

  if (toolSlug && vsToolSlug) {
    const canonicalHref = getCanonicalToolVsHref(toolSlug, vsToolSlug);
    redirect(canonicalHref ?? "/compare");
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const comparePageData = getComparePageData();
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
    <main className={styles.page} data-ui="compare-page">
      <div className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
        />

        <header className={styles.topbar} data-ui="compare-topbar">
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Compare navigation">
            {nav.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className={styles.submitBtn} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Comparison-intent hub</p>
            <h1>Compare Tools</h1>
            <p className={styles.subtitle}>
              Start with the highest-signal AI tool matchups, then move into use
              case clusters and commercial buying guides without losing context.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} href="/tools">
                Browse all tools
              </Link>
              <Link className={styles.secondaryCta} href="/use-cases">
                Explore use cases
              </Link>
            </div>
          </div>

          <div className={styles.heroStats}>
            <article className={styles.statCard}>
              <span>Head-to-heads</span>
              <strong>{comparePageData.headToHeadComparisons.length}</strong>
              <p>High-frequency pairs supported by existing tool and hub relationships.</p>
            </article>
            <article className={styles.statCard}>
              <span>Use cases</span>
              <strong>{comparePageData.useCaseComparisons.length}</strong>
              <p>Scenario-led comparison paths for sales, support, ops, and research teams.</p>
            </article>
            <article className={styles.statCard}>
              <span>Buying guides</span>
              <strong>{comparePageData.buyingGuideShortcuts.length}</strong>
              <p>Commercial pages that help buyers narrow a shortlist before visiting vendors.</p>
            </article>
          </div>
        </section>

        <section className={styles.section} data-ui="compare-head-to-head">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Pair-driven entry points</p>
            <h2>Popular Head-to-Head Comparisons</h2>
            <p>
              These matchups appear repeatedly across tool detail pages and editorial
              buying guides, which makes them the strongest entry points for
              comparison-intent traffic.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {comparePageData.headToHeadComparisons.map((item) => (
              <article className={styles.card} key={item.title}>
                <p className={styles.cardEyebrow}>Head-to-head</p>
                <h3>
                  <Link href={item.href}>{item.title}</Link>
                </h3>
                <p>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span>{item.signalCount} comparison signals</span>
                  <Link href={item.href}>Open comparison path</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} data-ui="compare-use-cases">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Scenario-led shortlists</p>
            <h2>Compare by Use Case</h2>
            <p>
              Start from the workflow you need to improve, then compare the tools
              already clustered around that operational outcome.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {comparePageData.useCaseComparisons.map((item) => (
              <article className={styles.card} key={item.href}>
                <p className={styles.cardEyebrow}>Use-case cluster</p>
                <h3>
                  <Link href={item.href}>{item.title}</Link>
                </h3>
                <p>{item.description}</p>
                <div className={styles.tagRow}>
                  {item.toolNames.map((toolName) => (
                    <span key={`${item.href}-${toolName}`}>{toolName}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} data-ui="compare-buying-guides">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Commercial navigation</p>
            <h2>Best Buying Guides Before You Compare</h2>
            <p>
              Use these pages when you need stronger shortlist framing, budget
              context, or alternatives guidance before drilling into individual tools.
            </p>
          </div>

          <div className={styles.cardGrid}>
            {comparePageData.buyingGuideShortcuts.map((item) => (
              <article className={styles.card} key={item.href}>
                <p className={styles.cardEyebrow}>{formatGuideType(item.guideType)}</p>
                <h3>
                  <Link href={item.href}>{item.title}</Link>
                </h3>
                <p>{item.description}</p>
                <div className={styles.cardFooter}>
                  <span>{formatGuideType(item.guideType)}</span>
                  <Link href={item.href}>Read guide</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} data-ui="compare-methodology">
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>Methodology</p>
            <h2>How We Evaluate</h2>
            <p>
              We compare AI tools using operator-first criteria designed to help
              buyers move from shortlist to implementation without relying on
              surface-level feature tables.
            </p>
          </div>

          <div className={styles.methodologyGrid}>
            <article className={styles.methodCard}>
              <h3>Decision criteria</h3>
              <ul className={styles.criteriaList}>
                {evaluationCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={styles.methodCard}>
              <h3>Methodology references</h3>
              <p>
                Our commercial pages link monetization disclosures separately from
                editorial ranking logic so compare-intent traffic still sees clear,
                trustworthy buying guidance.
              </p>
              <div className={styles.methodLinks}>
                <Link href="/editorial-policy">Editorial Policy</Link>
                <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
                <Link href="/best-ai-automation-tools">Best AI Automation Tools</Link>
                <Link href="/best-ai-agents-for-sales">Best AI Agents for Sales</Link>
              </div>
            </article>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
