import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import styles from "../policy-pages.module.css";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | Atlas AI Directory",
  description:
    "How affiliate relationships, sponsored placements, and outbound links are handled on Atlas AI Directory.",
};

export default function AffiliateDisclosurePage() {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/affiliate-disclosure`;
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Affiliate Disclosure",
    url: canonicalUrl,
    description:
      "How affiliate relationships, sponsored placements, and outbound links are handled on Atlas AI Directory.",
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
            <Link href="/editorial-policy">Editorial policy</Link>
          </nav>
          <Link className={styles.submit} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Trust and disclosure</p>
          <h1>Affiliate Disclosure</h1>
          <p className={styles.subtitle}>
            Atlas AI Directory is affiliate-supported. Some outbound links may
            generate a commission when users sign up or purchase through our
            referral links.
          </p>
          <p className={styles.meta}>Last updated: March 10, 2026</p>
        </section>

        <section className={styles.content}>
          <article className={styles.section}>
            <h2>How compensation works</h2>
            <p>
              We may receive compensation from selected partners when users take
              qualified actions through outbound links on our site.
            </p>
            <ul>
              <li>
                Compensation may be fixed, recurring, or performance-based.
              </li>
              <li>
                Compensation does not grant partners editorial control over our
                reviews or rankings.
              </li>
              <li>
                We do not sell positive coverage or guaranteed rankings.
              </li>
            </ul>
          </article>

          <article className={styles.section}>
            <h2>Link labeling and sponsored status</h2>
            <p>
              Outbound commercial links are labeled as sponsored or affiliate
              where relevant. We apply link attributes intended for paid
              relationships and keep disclosure text near high-intent calls to
              action.
            </p>
            <p>
              Example surfaces include tool detail pages, comparison blocks, and
              sponsored alternative modules.
            </p>
          </article>

          <article className={styles.section}>
            <h2>Editorial independence</h2>
            <p>
              Our editorial process is independent from commercial partnerships.
              Compensation is one business input, not a ranking input. Our
              methodology is published in the{" "}
              <Link href="/editorial-policy">Editorial Policy</Link>.
            </p>
          </article>

          <article className={styles.section}>
            <h2>What users should expect</h2>
            <ul>
              <li>Clear disclosure near affiliate-driven actions.</li>
              <li>Consistent link handling for paid relationships.</li>
              <li>Transparent update and correction practices.</li>
            </ul>
            <p>
              Questions about disclosures can be submitted via{" "}
              <Link href="/submit">our contact and submission channel</Link>.
            </p>
          </article>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
