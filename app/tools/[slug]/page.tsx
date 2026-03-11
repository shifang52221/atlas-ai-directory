import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdsenseSlotCard } from "@/components/adsense-slot-card";
import { SiteFooter } from "@/components/site-footer";
import { isToolDetailAdsEligible } from "@/lib/adsense-policy";
import { getToolDetailSeoContent } from "@/lib/tool-detail-seo-content";
import { getFallbackToolProfiles, getToolProfileBySlug } from "@/lib/tool-profile-data";
import styles from "./page.module.css";

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getToolProfileBySlug(slug);
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  if (!profile) {
    return {
      title: "Tool Not Found | Atlas AI Directory",
      alternates: {
        canonical: new URL(`/tools/${slug}`, baseUrl).toString(),
      },
    };
  }

  return {
    title: `${profile.name} | Atlas AI Directory`,
    description: profile.description,
    alternates: {
      canonical: new URL(`/tools/${profile.slug}`, baseUrl).toString(),
    },
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDisplayNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const profile = await getToolProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(`/tools/${profile.slug}`, baseUrl).toString();
  const seoContent = getToolDetailSeoContent({
    slug: profile.slug,
    name: profile.name,
    categories: profile.categories,
    highlights: profile.highlights,
    comparisonNotes: profile.comparisonNotes,
    setupLabel: profile.setupLabel,
    pricingLabel: profile.pricingLabel,
  });
  const reviewScore = seoContent.reviewScore;
  const fitSignals = seoContent.fitSignals;
  const avoidSignals = seoContent.avoidSignals;
  const implementationPlan = seoContent.implementationPlan;
  const riskControls = seoContent.riskControls;
  const faqItems = seoContent.faqItems;
  const useCaseLinks = seoContent.useCaseLinks;
  const isAdsEligible = isToolDetailAdsEligible({
    description: profile.description,
    highlights: profile.highlights,
    comparisonNotes: profile.comparisonNotes,
    faqCount: faqItems.length,
  });
  const fallbackToolMap = new Map(
    getFallbackToolProfiles().map((tool) => [tool.slug, tool]),
  );
  const alternatives = seoContent.alternativeSlugs
    .filter((alternativeSlug) => alternativeSlug !== profile.slug)
    .map((alternativeSlug) => ({
      slug: alternativeSlug,
      name: fallbackToolMap.get(alternativeSlug)?.name || toDisplayNameFromSlug(alternativeSlug),
    }));
  const compareFaqItems = faqItems.filter((item) => /\bvs\b/i.test(item.question)).slice(0, 3);
  const compareItems =
    compareFaqItems.length > 0
      ? compareFaqItems
      : alternatives.slice(0, 3).map((tool) => ({
          question: `${profile.name} vs ${tool.name}: what should teams compare first?`,
          answer:
            profile.comparisonNotes[0] ||
            "Compare setup friction, reliability, and cost at your expected usage.",
        }));
  const editorialHubLinks = [
    {
      label: "Best AI Automation Tools for Ops Teams",
      href: "/best-ai-automation-tools",
    },
    {
      label: "Best AI Agents for Sales Teams",
      href: "/best-ai-agents-for-sales",
    },
    {
      label: "Best AI Tools for Customer Support",
      href: "/best-ai-tools-for-support",
    },
    {
      label: "Best AI Tools for Marketing Teams",
      href: "/best-ai-tools-for-marketing",
    },
  ];
  const toolJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: profile.name,
        description: profile.description,
        applicationCategory: profile.tagline,
        url: canonicalUrl,
        sameAs: profile.websiteUrl,
        keywords: profile.categories.join(", "),
        dateModified: profile.updatedAt,
        isPartOf: {
          "@type": "WebSite",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
      },
      {
        "@type": "Review",
        name: `${profile.name} Editorial Review`,
        itemReviewed: {
          "@type": "SoftwareApplication",
          name: profile.name,
          url: canonicalUrl,
        },
        author: {
          "@type": "Organization",
          name: "Atlas AI Directory Editorial Team",
        },
        reviewBody: seoContent.reviewSummary,
        reviewRating: {
          "@type": "Rating",
          ratingValue: reviewScore,
          bestRating: 5,
          worstRating: 1,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
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
            name: "Tools",
            item: new URL("/tools", baseUrl).toString(),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: profile.name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
        />
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Tool detail navigation">
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
          <p className={styles.kicker}>Tool profile</p>
          <h1>{profile.name}</h1>
          <p className={styles.tagline}>{profile.tagline}</p>
          <p className={styles.description}>{profile.description}</p>

          <div className={styles.metaChips}>
            <span>Updated {formatDate(profile.updatedAt)}</span>
            <span>{profile.setupLabel}</span>
            <span>{profile.pricingLabel}</span>
          </div>

          <div className={styles.heroActions}>
            <a
              className={styles.visitButton}
              href={profile.outboundHref}
              rel="nofollow sponsored"
              target="_blank"
            >
              Visit Website
            </a>
            <Link className={styles.secondaryButton} href="/compare">
              Compare Alternatives
            </Link>
          </div>

          <p className={styles.disclosure}>
            {profile.outboundDisclosure}{" "}
            <span className={styles.policyLinks}>
              See our <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>{" "}
              and <Link href="/editorial-policy">Editorial Policy</Link>.
            </span>
          </p>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.card}>
            <h2>Best-fit categories</h2>
            <div className={styles.tagGrid}>
              {profile.categories.map((category) => (
                <Link key={category} href="/use-cases">
                  {category}
                </Link>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <h2>What teams like</h2>
            <ul>
              {profile.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Decision checklist</h2>
            <ul>
              {profile.comparisonNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Who this tool fits</h2>
            <ul>
              {fitSignals.map((item) => (
                <li key={`fit-${item}`}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Avoid this tool if</h2>
            <ul>
              {avoidSignals.map((item) => (
                <li key={`avoid-${item}`}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Implementation playbook</h2>
            <ol className={styles.numberList}>
              {implementationPlan.map((item) => (
                <li key={`implementation-${item}`}>{item}</li>
              ))}
            </ol>
          </article>

          <article className={styles.card}>
            <h2>Risk controls</h2>
            <ul>
              {riskControls.map((item) => (
                <li key={`risk-${item}`}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Editorial Review</h2>
            <p className={styles.reviewScore}>
              Score: <strong>{reviewScore.toFixed(1)}/5.0</strong>
            </p>
            <p>{seoContent.reviewSummary}</p>
            <ul>
              {profile.highlights.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>FAQ</h2>
            <div className={styles.faqList}>
              {faqItems.map((item) => (
                <details key={item.question} className={styles.faqItem}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <h2>Compare {profile.name} Against Alternatives</h2>
            <ul className={styles.compareList}>
              {compareItems.map((item) => (
                <li key={`compare-${item.question}`} className={styles.compareItem}>
                  <p className={styles.compareQuestion}>{item.question}</p>
                  <p>{item.answer}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Top Alternatives</h2>
            <ul className={styles.linkList}>
              {alternatives.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                </li>
              ))}
            </ul>
            <ul className={styles.linkList}>
              {alternatives.map((tool) => (
                <li key={`${tool.slug}-compare`}>
                  <Link href={`/compare?tool=${profile.slug}&vs=${tool.slug}`}>
                    Compare {profile.name} vs {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className={styles.linkList}>
              <li>
                <Link href="/use-cases">
                  Best use cases for {profile.name}
                </Link>
              </li>
              {useCaseLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Best-of Buying Guides</h2>
            <ul className={styles.linkList}>
              {editorialHubLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </article>

          {isAdsEligible ? (
            <>
              <AdsenseSlotCard
                className={styles.card}
                labelClassName={styles.adLabel}
                pagePath={`/tools/${profile.slug}`}
                slotKey="toolDetailPrimary"
                title="Google AdSense Placement"
                fallbackBody="Reserve this block for in-content ad units. Best position: after key value proposition and before alternative comparisons."
              />

              <AdsenseSlotCard
                className={styles.card}
                labelClassName={styles.adLabel}
                pagePath={`/tools/${profile.slug}`}
                slotKey="toolDetailSecondary"
                title="Sponsored Alternatives"
                placementLabel="Affiliate slot"
                fallbackBody="Use this area for sponsored comparison cards with clear disclosure and higher-intent outbound links."
              />
            </>
          ) : (
            <article className={styles.card}>
              <h2>Monetization Safety Gate</h2>
              <p>
                Ads are disabled on this profile until content depth and review coverage meet our
                policy threshold. See our{" "}
                <Link href="/affiliate-disclosure">Affiliate Disclosure</Link> and{" "}
                <Link href="/editorial-policy">Editorial Policy</Link>.
              </p>
            </article>
          )}
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
