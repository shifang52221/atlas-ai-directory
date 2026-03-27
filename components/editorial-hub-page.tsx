import Link from "next/link";
import { HubImpressionTracker } from "./hub-impression-tracker";
import { SiteFooter } from "./site-footer";
import {
  buildEditorialHubExperimentView,
  getEditorialHubConfig,
  getEditorialHubPaths,
  type EditorialHubConfig,
  type EditorialHubVariant,
} from "@/lib/editorial-hubs";
import { buildToolCompareSectionHref } from "@/lib/tool-detail-seo-content";
import styles from "./editorial-hub-page.module.css";

type EditorialHubPageProps = {
  config: EditorialHubConfig;
  variant?: EditorialHubVariant;
};

function normalizeCompareToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getComparisonQuestionLinks(
  question: string,
  rankedTools: Array<{ slug: string; name: string }>,
) {
  const normalizedQuestion = normalizeCompareToken(question);

  return rankedTools
    .filter((tool) => {
      const normalizedName = normalizeCompareToken(tool.name);
      const normalizedSlug = normalizeCompareToken(tool.slug);

      return (
        normalizedQuestion.includes(normalizedName) ||
        normalizedQuestion.includes(normalizedSlug)
      );
    })
    .slice(0, 2)
    .map((tool) => ({
      href: buildToolCompareSectionHref(tool.slug),
      label: `Open ${tool.name} compare block`,
    }));
}

export function EditorialHubPage({ config, variant = "A" }: EditorialHubPageProps) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(config.path, baseUrl).toString();
  const view = buildEditorialHubExperimentView({ config, variant });
  const rankedTools = view.rankedTools;
  const primaryTools = view.primaryTools;
  const alternativeTools = rankedTools.slice(primaryTools.length);
  const relatedCommercialGuides = getEditorialHubPaths()
    .filter((path) => path !== config.path)
    .map((path) => getEditorialHubConfig(path))
    .filter((hub): hub is EditorialHubConfig => Boolean(hub))
    .slice(0, 8)
    .map((hub) => ({
      href: hub.path,
      label: hub.title,
    }));
  const sectionLinks = [
    { href: "#top-picks", label: "Top picks" },
    ...(alternativeTools.length > 0
      ? [{ href: "#alternative-picks", label: "Alternative picks" }]
      : []),
    { href: "#who-this-fits", label: "Who this fits" },
    { href: "#implementation-playbook", label: "Implementation playbook" },
    { href: "#buying-mistakes", label: "Buying mistakes" },
    { href: "#rollout-checklist", label: "90-day checklist" },
    { href: "#comparison-table", label: "Comparison table" },
    { href: "#faq", label: "FAQ" },
  ];
  const softwareApplications = rankedTools.map((tool) => {
    const toolUrl = new URL(`/tools/${tool.slug}`, baseUrl).toString();
    return {
      "@type": "SoftwareApplication",
      "@id": `${toolUrl}#software`,
      name: tool.name,
      url: toolUrl,
      description: tool.description,
      applicationCategory: tool.categories[0] || "BusinessApplication",
      operatingSystem: "Web",
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: config.title,
        description: config.metadataDescription,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        inLanguage: "en-US",
        about: softwareApplications.map((item) => ({
          "@id": item["@id"],
        })),
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
          item: {
            "@id": new URL(`/tools/${tool.slug}#software`, baseUrl).toString(),
          },
        })),
      },
      ...softwareApplications,
      {
        "@type": "FAQPage",
        mainEntity: [...config.faqItems, ...config.comparisonQuestions].map((item) => ({
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

        <nav className={styles.breadcrumbTrail} aria-label="Hub breadcrumbs">
          <Link href="/">Home</Link>
          <span className={styles.crumbSep}>/</span>
          <Link href="/tools">Commercial guides</Link>
          <span className={styles.crumbSep}>/</span>
          <span>{config.title}</span>
        </nav>

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

        <nav className={styles.toc} aria-label="On this page">
          <p>On this page</p>
          <div className={styles.tocLinks}>
            {sectionLinks.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="top-picks" className={styles.section}>
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
                  <a href={tool.heroOutboundHref} rel="nofollow sponsored" target="_blank">
                    {view.ctaPrimaryLabel} {tool.name}
                  </a>
                  <Link href={`/tools/${tool.slug}`}>{view.ctaSecondaryLabel}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {alternativeTools.length > 0 ? (
          <section id="alternative-picks" className={styles.section}>
            <h2>Alternative picks worth testing</h2>
            <div className={styles.topPicksGrid}>
              {alternativeTools.map((tool, index) => (
                <article key={`alternative-${tool.slug}`} className={styles.pickCard}>
                  <p className={styles.rank}>#{primaryTools.length + index + 1}</p>
                  <h3>{tool.name}</h3>
                  <p className={styles.tagline}>{tool.tagline}</p>
                  <p className={styles.summary}>{tool.description}</p>
                  <p className={styles.evidence}>{tool.evidence}</p>
                  <div className={styles.badges}>
                    {tool.categories.map((category) => (
                      <span key={`alternative-${tool.slug}-${category}`}>{category}</span>
                    ))}
                  </div>
                  <div className={styles.pickMeta}>
                    <p>{tool.setupLabel}</p>
                    <p>{tool.pricingLabel}</p>
                  </div>
                  <div className={styles.pickActions}>
                    <a
                      href={tool.alternativeOutboundHref}
                      rel="nofollow sponsored"
                      target="_blank"
                    >
                      {view.ctaPrimaryLabel} {tool.name}
                    </a>
                    <Link href={`/tools/${tool.slug}`}>{view.ctaSecondaryLabel}</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section id="who-this-fits" className={styles.section}>
          <h2>Who this shortlist fits</h2>
          <ul className={styles.list}>
            {config.whoFits.map((item) => (
              <li key={`fit-${item}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="avoid-this-shortlist" className={styles.section}>
          <h2>Avoid this shortlist if</h2>
          <ul className={styles.list}>
            {config.avoidIf.map((item) => (
              <li key={`avoid-${item}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="implementation-playbook" className={styles.section}>
          <h2>Implementation playbook</h2>
          <ol className={styles.list}>
            {config.implementationPlan.map((item) => (
              <li key={`implementation-${item}`}>{item}</li>
            ))}
          </ol>
        </section>

        <section id="kpi-scorecard" className={styles.section}>
          <h2>KPI scorecard</h2>
          <ul className={styles.list}>
            {config.kpiScorecard.map((item) => (
              <li key={`kpi-${item}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="buying-mistakes" className={styles.section}>
          <h2>Buying mistakes to avoid</h2>
          <ul className={styles.list}>
            {config.buyingMistakes.map((item) => (
              <li key={`mistake-${item}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="rollout-checklist" className={styles.section}>
          <h2>90-day rollout checklist</h2>
          <ol className={styles.list}>
            {config.rolloutChecklist.map((item) => (
              <li key={`rollout-${item}`}>{item}</li>
            ))}
          </ol>
        </section>

        <section id="comparison-questions" className={styles.section}>
          <h2>Comparison questions</h2>
          <div className={styles.faqList}>
            {config.comparisonQuestions.map((item) => {
              const questionLinks = getComparisonQuestionLinks(item.question, rankedTools);

              return (
                <details key={`comparison-${item.question}`} className={styles.faqItem} open>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                  {questionLinks.length > 0 ? (
                    <div className={styles.questionLinks} data-ui="comparison-question-links">
                      {questionLinks.map((link) => (
                        <Link key={`${item.question}-${link.href}`} href={link.href}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </details>
              );
            })}
          </div>
        </section>

        <section id="evidence-review-basis" className={styles.section}>
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

        <section id="comparison-table" className={styles.section}>
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
                        <a href={tool.tableOutboundHref} rel="nofollow sponsored" target="_blank">
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

        <section id="faq" className={styles.section}>
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

        <section id="continue-shortlist" className={styles.section}>
          <h2>Continue your shortlist</h2>
          <div className={styles.links}>
            {config.continueLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section} data-ui="related-commercial-guides">
          <h2>Related commercial guides</h2>
          <div className={styles.links}>
            {relatedCommercialGuides.map((item) => (
              <Link key={`related-guide-${item.href}`} href={item.href}>
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

