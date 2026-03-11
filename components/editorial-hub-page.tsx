import Link from "next/link";
import { HubImpressionTracker } from "./hub-impression-tracker";
import { SiteFooter } from "./site-footer";
import {
  buildEditorialHubExperimentView,
  type EditorialHubConfig,
  type EditorialHubVariant,
} from "@/lib/editorial-hubs";
import styles from "./editorial-hub-page.module.css";

type EditorialHubPageProps = {
  config: EditorialHubConfig;
  variant?: EditorialHubVariant;
};

export function EditorialHubPage({ config, variant = "A" }: EditorialHubPageProps) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(config.path, baseUrl).toString();
  const view = buildEditorialHubExperimentView({ config, variant });
  const rankedTools = view.rankedTools;
  const primaryTools = view.primaryTools;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: config.title,
        description: config.metadataDescription,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
      },
      {
        "@type": "ItemList",
        name: `${config.title} picks`,
        itemListElement: rankedTools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: new URL(`/tools/${tool.slug}`, baseUrl).toString(),
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: config.faqItems.map((item) => ({
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
            name: config.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <HubImpressionTracker pagePath={config.path} variant={view.variant} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Best tools navigation">
            <Link href="/tools">All tools</Link>
            <Link href="/use-cases">Use cases</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/workflows">Workflows</Link>
          </nav>
          <Link className={styles.submitBtn} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Commercial intent hub</p>
          <h1>{config.title}</h1>
          <p className={styles.subtitle}>{view.heroSubtitle}</p>
          <div className={styles.heroMeta}>
            <span>{config.heroMeta[0]}</span>
            <span>{config.heroMeta[1]}</span>
            <span>{config.heroMeta[2]}</span>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Top picks</h2>
          <div className={styles.topPicksGrid}>
            {primaryTools.map((tool, index) => (
              <article key={tool.slug} className={styles.pickCard}>
                <p className={styles.rank}>#{index + 1}</p>
                <h3>{tool.name}</h3>
                <p className={styles.tagline}>{tool.tagline}</p>
                <p className={styles.summary}>{tool.description}</p>
                <p className={styles.evidence}>{tool.evidence}</p>
                <div className={styles.badges}>
                  {tool.categories.map((category) => (
                    <span key={`${tool.slug}-${category}`}>{category}</span>
                  ))}
                </div>
                <div className={styles.pickMeta}>
                  <p>{tool.setupLabel}</p>
                  <p>{tool.pricingLabel}</p>
                </div>
                <div className={styles.pickActions}>
                  <a href={tool.outboundHref} rel="nofollow sponsored" target="_blank">
                    {view.ctaPrimaryLabel} {tool.name}
                  </a>
                  <Link href={`/tools/${tool.slug}`}>{view.ctaSecondaryLabel}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Evidence and review basis</h2>
          <ul className={styles.evidenceList}>
            {rankedTools.map((tool) => (
              <li key={`evidence-${tool.slug}`} className={styles.evidenceItem}>
                <p>
                  <strong>{tool.name}</strong>
                </p>
                <p>{tool.evidence}</p>
              </li>
            ))}
          </ul>
          <p className={styles.disclosure}>
            Evidence notes summarize public documentation review and operator-fit scoring. Monetary
            relationships are disclosed separately and never override ranking logic.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Comparison table</h2>
          <div className={styles.tableWrap}>
            <table>
              <caption>Operator-focused scorecard for buying decisions</caption>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Best for</th>
                  <th>Setup speed</th>
                  <th>Pricing</th>
                  <th>Trade-off</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rankedTools.map((tool) => (
                  <tr key={`table-${tool.slug}`}>
                    <td>
                      <strong>{tool.name}</strong>
                      <p className={styles.score}>Score {tool.score.toFixed(2)}</p>
                    </td>
                    <td>{tool.bestFor}</td>
                    <td>{tool.setupLabel}</td>
                    <td>{tool.pricingLabel}</td>
                    <td>{tool.tradeoff}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <a href={tool.outboundHref} rel="nofollow sponsored" target="_blank">
                          {view.tableCtaLabel}
                        </a>
                        <Link href={`/tools/${tool.slug}`}>Profile</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.disclosure}>
            Some outbound links may include affiliate tracking. Read our{" "}
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> and{" "}
            <Link href="/editorial-policy">Editorial Policy</Link> for ranking and monetization
            rules.
          </p>
        </section>

        <section className={styles.section}>
          <h2>FAQ</h2>
          <div className={styles.faqList}>
            {config.faqItems.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Continue your shortlist</h2>
          <div className={styles.links}>
            {config.continueLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
