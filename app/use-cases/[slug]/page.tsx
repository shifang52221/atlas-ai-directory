import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdsenseSlotCard } from "@/components/adsense-slot-card";
import { SiteFooter } from "@/components/site-footer";
import {
  getFallbackUseCaseSlugs,
  getUseCaseProfileBySlug,
} from "@/lib/use-case-data";
import styles from "./page.module.css";

type UseCaseDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getFallbackUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: UseCaseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getUseCaseProfileBySlug(slug);
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  if (!profile) {
    return {
      title: "Use Case Not Found | Atlas AI Directory",
      alternates: {
        canonical: new URL(`/use-cases/${slug}`, baseUrl).toString(),
      },
    };
  }

  return {
    title: `${profile.name} Tools | Atlas AI Directory`,
    description: profile.description,
    alternates: {
      canonical: new URL(`/use-cases/${profile.slug}`, baseUrl).toString(),
    },
  };
}

export default async function UseCaseDetailPage({
  params,
}: UseCaseDetailPageProps) {
  const { slug } = await params;
  const profile = await getUseCaseProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const canonicalUrl = new URL(`/use-cases/${profile.slug}`, baseUrl).toString();
  const useCaseJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: profile.name,
        description: profile.description,
        url: canonicalUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "Atlas AI Directory",
          url: baseUrl,
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: profile.tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: new URL(tool.profileHref, baseUrl).toString(),
          })),
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
            name: "Use cases",
            item: new URL("/use-cases", baseUrl).toString(),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(useCaseJsonLd) }}
        />
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Use case navigation">
            <Link href="/use-cases">All use cases</Link>
            <Link href="/tools">Tools</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/workflows">Workflows</Link>
          </nav>
          <Link className={styles.submitBtn} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>Use-case landing page</p>
          <h1>{profile.name}</h1>
          <p className={styles.description}>{profile.description}</p>
          <p className={styles.summary}>{profile.summary}</p>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.card}>
            <div className={styles.sectionHead}>
              <h2>Recommended tools</h2>
              <Link href="/tools">View all tools</Link>
            </div>
            <div className={styles.toolGrid}>
              {profile.tools.map((tool) => (
                <article className={styles.toolCard} key={tool.slug}>
                  <p className={styles.toolTag}>{tool.tag}</p>
                  <h3>{tool.name}</h3>
                  <p>{tool.blurb}</p>
                  <div className={styles.cardActions}>
                    <Link href={tool.profileHref}>Open profile</Link>
                    <a
                      href={tool.outboundHref}
                      rel="nofollow sponsored"
                      target="_blank"
                    >
                      Visit website
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className={styles.sideStack}>
            <article className={styles.card}>
              <h2>Evaluation checklist</h2>
              <ul>
                {profile.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={styles.card}>
              <h2>Related use cases</h2>
              <div className={styles.relatedLinks}>
                {profile.relatedUseCases.map((item) => (
                  <Link key={item.name} href={item.href}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </article>

            <AdsenseSlotCard
              className={styles.card}
              labelClassName={styles.adLabel}
              slotKey="useCaseSidebar"
              title="Google AdSense Placement"
              fallbackBody="Place intent-matched in-feed ad units here for high relevance traffic from use-case searches."
            />
          </aside>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
