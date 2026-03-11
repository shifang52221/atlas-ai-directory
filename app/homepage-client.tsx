"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { HomepageData } from "@/lib/homepage-data";
import { getVisibleTools } from "@/lib/tool-query";
import { SiteFooter } from "@/components/site-footer";

type SortMode = "Popular" | "Newest";

type HomepageClientProps = {
  data: HomepageData;
};

export default function HomepageClient({ data }: HomepageClientProps) {
  const hubGuides = [
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

  const reveal = (delay: string): CSSProperties =>
    ({ "--reveal-delay": delay }) as CSSProperties;
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("Popular");

  const visibleTools = useMemo(
    () =>
      getVisibleTools(data.featuredTools, {
        searchTerm,
        activeFilter,
        sortMode,
      }),
    [activeFilter, data.featuredTools, searchTerm, sortMode],
  );

  const newestTools = useMemo(
    () =>
      [...data.featuredTools]
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
        )
        .slice(0, 5),
    [data.featuredTools],
  );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.ambientLayer} data-motion="ambient-layer" aria-hidden>
          <span className={styles.grain} />
        </div>

        <header className={styles.topbar} data-ui="topbar">
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Primary">
            {data.mainNav.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className={styles.submitBtn} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.megaNav} aria-label="Directory channels">
          <p>Today&apos;s channels</p>
          <div className={styles.megaNavTrack}>
            <Link className={styles.megaNavItem} href="/tools">
              New AI tools
            </Link>
            <Link className={styles.megaNavItem} href="/tools">
              Most used this month
            </Link>
            <Link className={styles.megaNavItem} href="/compare">
              Top by category
            </Link>
            <Link className={styles.megaNavItem} href="/use-cases">
              Browse by use case
            </Link>
            <Link className={styles.megaNavItem} href="/workflows">
              Workflow templates
            </Link>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.reveal}`}
          style={reveal("20ms")}
          data-motion="section-reveal"
          aria-labelledby="buying-guides-title"
        >
          <div className={styles.sectionHead}>
            <h2 id="buying-guides-title">Best AI buying guides</h2>
            <Link href="/affiliate-disclosure">Disclosure standard</Link>
          </div>
          <div className={styles.hubGuideGrid}>
            {hubGuides.map((hub) => (
              <Link key={hub.href} className={styles.hubGuideCard} href={hub.href}>
                {hub.label}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.hero}>
          <div className={styles.heroRing} data-motion="hero-ring" aria-hidden />
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <div className={styles.heroBadge}>English AI Tool Navigation</div>
              <h1>AI Agents Decision Hub</h1>
              <p className={styles.subtitle}>
                High-signal AI navigation for operators. Search by use case,
                compare tools, and move from discovery to deployment quickly.
              </p>

              <div className={styles.searchWrap}>
                <label className={styles.searchLabel} htmlFor="search-tools">
                  Search tools
                </label>
                <input
                  id="search-tools"
                  aria-label="Search tools"
                  className={styles.searchInput}
                  type="search"
                  placeholder="Search tools, categories, use cases"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button
                  className={styles.searchButton}
                  type="button"
                  onClick={() => null}
                >
                  Search
                </button>
              </div>

              <div className={styles.filterRow}>
                <button
                  className={`${styles.filterChip} ${activeFilter === "All" ? styles.filterChipActive : ""}`}
                  type="button"
                  aria-pressed={activeFilter === "All"}
                  onClick={() => setActiveFilter("All")}
                >
                  All
                </button>
                {data.quickFilters.map((item) => (
                  <button
                    className={`${styles.filterChip} ${activeFilter === item ? styles.filterChipActive : ""}`}
                    key={item}
                    type="button"
                    aria-pressed={activeFilter === item}
                    onClick={() => setActiveFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className={styles.metrics}>
                <article>
                  <p>2,300+</p>
                  <span>Curated tools</span>
                </article>
                <article>
                  <p>180+</p>
                  <span>Use-case categories</span>
                </article>
                <article>
                  <p>Weekly</p>
                  <span>Price and feature updates</span>
                </article>
              </div>
            </div>

            <aside className={styles.heroPanelWrap}>
              <div className={styles.heroPanel}>
                <p className={styles.panelKicker}>Market signal</p>
                <h2>Where operators are getting ROI right now</h2>
                <ul>
                  {data.marketSignals.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className={styles.panelLink} href="/compare">
                  Open benchmark view
                </Link>
              </div>
              <div className={styles.panelBlock}>
                <p>Recently indexed</p>
                <ul>
                  {newestTools.slice(0, 3).map((tool) => (
                    <li key={tool.name}>
                      <Link href={tool.href}>
                        <span>{tool.name}</span>
                        <em>{formatDate(tool.updatedAt)}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.reveal}`}
          style={reveal("30ms")}
          data-motion="section-reveal"
          aria-labelledby="featured-tools-title"
        >
          <div className={styles.sectionHead}>
            <h2 id="featured-tools-title">Featured tools</h2>
            <Link href="/tools">View all tools</Link>
          </div>
          <div className={styles.controlsRow}>
            <p className={styles.resultMeta}>
              {visibleTools.length} tool{visibleTools.length === 1 ? "" : "s"} shown
            </p>
            <div className={styles.sortGroup} role="group" aria-label="Sort tools">
              <button
                type="button"
                className={`${styles.sortButton} ${sortMode === "Popular" ? styles.sortButtonActive : ""}`}
                aria-pressed={sortMode === "Popular"}
                onClick={() => setSortMode("Popular")}
              >
                Popular
              </button>
              <button
                type="button"
                className={`${styles.sortButton} ${sortMode === "Newest" ? styles.sortButtonActive : ""}`}
                aria-pressed={sortMode === "Newest"}
                onClick={() => setSortMode("Newest")}
              >
                Newest
              </button>
            </div>
          </div>
          <div className={styles.featureLayout}>
            <div className={styles.cardGrid}>
              {visibleTools.length === 0 && (
                <article className={styles.emptyState}>
                  <h3>No tools matched your filters</h3>
                  <p>Try clearing search or switching to a broader category.</p>
                </article>
              )}
              {visibleTools.map((tool) => (
                <article className={styles.toolCard} data-ui="tool-card" key={tool.name}>
                  <p className={styles.toolTag}>{tool.tag}</p>
                  <h3>{tool.name}</h3>
                  <p>{tool.blurb}</p>
                  <Link href={tool.href}>Open profile</Link>
                </article>
              ))}
            </div>
            <aside className={styles.sideStack}>
              <div className={styles.sidePanel}>
                <h3>Top this week</h3>
                <ul>
                  {data.topThisWeek.map((item) => (
                    <li key={item}>
                      <Link href="/compare">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.pulsePanel}>
                <h3>Fresh arrivals</h3>
                <ul className={styles.pulseList}>
                  {newestTools.map((tool) => (
                    <li key={tool.name}>
                      <Link href={tool.href}>
                        <span>{tool.name}</span>
                        <time className={styles.pulseDate}>
                          {formatDate(tool.updatedAt)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.reveal}`}
          style={reveal("90ms")}
          data-motion="section-reveal"
          aria-labelledby="browse-category-title"
        >
          <div className={styles.sectionHead}>
            <h2 id="browse-category-title">Browse by category</h2>
            <Link href="/use-cases">Explore all</Link>
          </div>
          <div className={styles.categoryLayout}>
            <div className={styles.categoryGrid}>
              {data.categories.map((item) => (
                <Link
                  className={styles.categoryCard}
                  href={item.href}
                  key={item.name}
                >
                  <h3>{item.name}</h3>
                  <p>{item.count} tools</p>
                </Link>
              ))}
            </div>
            <aside className={styles.categoryInsights}>
              <div className={styles.insightBlock}>
                <h3>Popular intents</h3>
                <div className={styles.miniTags}>
                  {data.quickFilters.map((item) => (
                    <Link key={item} href="/use-cases">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
              <div className={styles.insightBlock}>
                <h3>Browse alphabet</h3>
                <div className={styles.alphaRow}>
                  {"ABCDEFGHIKLMNOPRSTUVW".split("").map((item) => (
                    <Link key={item} href="/tools">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.reveal}`}
          style={reveal("140ms")}
          data-motion="section-reveal"
          aria-labelledby="recent-updates-title"
        >
          <div className={styles.sectionHead}>
            <h2 id="recent-updates-title">Recently updated</h2>
            <Link href="/compare">Open comparisons</Link>
          </div>
          <div className={styles.updatesLayout}>
            <ul className={styles.updateList}>
              {data.updates.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className={styles.compareStack}>
              {data.topThisWeek.slice(0, 3).map((item) => (
                <Link className={styles.compareCard} href="/compare" key={item}>
                  {item}
                </Link>
              ))}
            </div>
            <div className={styles.sponsorPanel}>
              <p className={styles.panelKicker}>Monetization slots</p>
              <h3>Affiliate + AdSense ready</h3>
              <p>
                Reserve these blocks for high-CTR placements: top comparison
                picks, sponsored tools, and in-feed ad units.
              </p>
              <Link href="/tools">Open placement map</Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
