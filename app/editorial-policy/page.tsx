import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import styles from "../policy-pages.module.css";

export const metadata: Metadata = {
  title: "Editorial Policy | Atlas AI Directory",
  description:
    "How Atlas AI Directory evaluates tools, updates rankings, and handles corrections.",
};

export default function EditorialPolicyPage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/editorial-policy`;
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Editorial Policy",
    url: canonicalUrl,
    description:
      "How Atlas AI Directory evaluates tools, updates rankings, and handles corrections.",
    isPartOf: {
      "@type": "WebSite",
      name: "Atlas AI Directory",
      url: baseUrl,
    },
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.nav} aria-label="Policy navigation">
            <Link href="/use-cases">Use cases</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          </nav>
          <Link className={styles.submit} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Methodology and quality</p>
          <h1>Editorial Policy</h1>
          <p className={styles.subtitle}>
            We evaluate AI tools for real operator use cases with a
            decision-first methodology focused on implementation risk, speed, and
            measurable outcomes.
          </p>
          <p className={styles.meta}>Last updated: March 10, 2026</p>
        </section>

        <section className={styles.content}>
          <article className={styles.section}>
            <h2>Evaluation framework</h2>
            <p>Each tool profile is assessed against practical criteria:</p>
            <ul>
              <li>Use-case fit and expected outcome quality.</li>
              <li>Setup effort for non-technical teams.</li>
              <li>Pricing clarity and total cost risk.</li>
              <li>Integration depth and workflow reliability.</li>
              <li>Long-term scale fit and vendor lock-in risk.</li>
            </ul>
          </article>

          <article className={styles.section}>
            <h2>Sources and evidence</h2>
            <p>
              We synthesize public product documentation, pricing pages, release
              notes, and workflow-level implementation patterns. We prioritize
              user decision utility over feature list volume.
            </p>
            <p>
              When data is uncertain, we state limits directly instead of
              inferring claims.
            </p>
          </article>

          <article className={styles.section}>
            <h2>Ranking and recommendations</h2>
            <p>
              Rankings are editorial decisions based on scenario fit. Commercial
              relationships do not guarantee placement or position.
            </p>
            <p>
              Affiliate relationships are disclosed in{" "}
              <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>.
            </p>
          </article>

          <article className={styles.section}>
            <h2>Updates and corrections</h2>
            <ul>
              <li>We refresh key pages as market conditions change.</li>
              <li>Material changes are reflected on-page with updated dates.</li>
              <li>Reported factual errors are reviewed and corrected.</li>
            </ul>
            <p>
              You can request corrections through{" "}
              <Link href="/submit">the submission channel</Link>.
            </p>
          </article>

          <article className={styles.section}>
            <h2>Use of AI in content workflow</h2>
            <p>
              We may use AI assistance for drafting and structuring, but final
              publication decisions remain human-reviewed and user-outcome
              focused.
            </p>
          </article>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
