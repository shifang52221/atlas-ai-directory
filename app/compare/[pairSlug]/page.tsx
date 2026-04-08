import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import {
  getToolVsPageBySlug,
  getToolVsPageSlugs,
} from "@/lib/tool-vs-pages";
import styles from "./page.module.css";

type ToolVsPageProps = {
  params: Promise<{ pairSlug: string }>;
};

const nav = [
  { label: "Categories", href: "/use-cases" },
  { label: "Popular", href: "/tools" },
  { label: "Compare", href: "/compare" },
  { label: "Workflows", href: "/workflows" },
];

export function generateStaticParams() {
  return getToolVsPageSlugs().map((pairSlug) => ({ pairSlug }));
}

export async function generateMetadata({
  params,
}: ToolVsPageProps): Promise<Metadata> {
  const { pairSlug } = await params;
  const page = getToolVsPageBySlug(pairSlug);
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  if (!page) {
    return {
      title: "Compare Page Not Found | Atlas AI Directory",
      alternates: {
        canonical: new URL(`/compare/${pairSlug}`, baseUrl).toString(),
      },
    };
  }

  const canonicalUrl = new URL(`/compare/${page.pairSlug}`, baseUrl).toString();
  const title = `${page.title} | Atlas AI Directory`;

  return {
    title,
    description: page.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: page.metaDescription,
      url: canonicalUrl,
      type: "article",
      siteName: "Atlas AI Directory",
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description: page.metaDescription,
    },
  };
}

export default async function ToolVsComparePage({ params }: ToolVsPageProps) {
  const { pairSlug } = await params;
  const page = getToolVsPageBySlug(pairSlug);

  if (!page) {
    notFound();
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(`/compare/${page.pairSlug}`, baseUrl).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: page.title,
        description: page.metaDescription,
        url: canonicalUrl,
        author: {
          "@type": "Organization",
          name: "Atlas AI Directory Editorial Team",
        },
        publisher: {
          "@type": "Organization",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
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
          {
            "@type": "ListItem",
            position: 3,
            name: page.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className={styles.page} data-ui="tool-vs-page">
      <div className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className={styles.topbar} data-ui="tool-vs-topbar">
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Tool compare navigation">
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
          <p className={styles.kicker}>Tool comparison</p>
          <h1>{page.title}</h1>
          <p className={styles.subtitle}>{page.heroVerdict}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href={`/tools/${page.toolASlug}`}>
              Open {page.toolAName}
            </Link>
            <Link className={styles.secondaryCta} href={`/tools/${page.toolBSlug}`}>
              Open {page.toolBName}
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Quick verdict</h2>
          <ul className={styles.bulletGrid}>
            {page.quickVerdicts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Side-by-side comparison</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>Decision area</div>
            <div className={styles.tableHeader}>{page.toolAName}</div>
            <div className={styles.tableHeader}>{page.toolBName}</div>
            {page.comparisonRows.map((row) => (
              <div className={styles.tableRow} key={row.label}>
                <strong>{row.label}</strong>
                <p>{row.toolASummary}</p>
                <p>{row.toolBSummary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dualSection}>
          <article className={styles.card}>
            <h2>Choose {page.toolAName} if</h2>
            <ul className={styles.bulletList}>
              {page.chooseToolA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className={styles.card}>
            <h2>Choose {page.toolBName} if</h2>
            <ul className={styles.bulletList}>
              {page.chooseToolB.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.section}>
          <h2>Detailed comparison</h2>
          <div className={styles.sectionGrid}>
            {page.sections.map((section) => (
              <article className={styles.card} key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.dualSection}>
          <article className={styles.card}>
            <h2>Final recommendation</h2>
            <p>{page.finalRecommendation}</p>
          </article>
          <article className={styles.card}>
            <h2>Methodology and disclosure</h2>
            <p>
              We compare tools using workflow fit, setup speed, ownership model,
              and cost risk. Affiliate relationships never replace editorial
              judgment.
            </p>
            <div className={styles.linkGroup}>
              <Link href="/editorial-policy">Editorial Policy</Link>
              <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
              <Link href="/compare">Compare hub</Link>
            </div>
          </article>
        </section>

        <section className={styles.dualSection}>
          <article className={styles.card}>
            <h2>FAQ</h2>
            <div className={styles.faqList}>
              {page.faqItems.map((item) => (
                <details className={styles.faqItem} key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </article>
          <article className={styles.card}>
            <h2>Keep exploring</h2>
            <div className={styles.linkList}>
              {page.relatedLinks.map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </article>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
