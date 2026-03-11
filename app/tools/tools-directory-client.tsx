"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { getVisibleTools, type ToolSortMode } from "@/lib/tool-query";
import type { ToolsDirectoryData } from "@/lib/tools-directory-data";
import styles from "./page.module.css";

type ToolsDirectoryClientProps = {
  data: ToolsDirectoryData;
};

const pageSize = 4;

export default function ToolsDirectoryClient({ data }: ToolsDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortMode, setSortMode] = useState<ToolSortMode>("Popular");
  const [currentPage, setCurrentPage] = useState(1);

  const visibleTools = useMemo(
    () =>
      getVisibleTools(data.tools, {
        searchTerm,
        activeFilter,
        sortMode,
      }),
    [activeFilter, data.tools, searchTerm, sortMode],
  );

  const totalPages = Math.max(1, Math.ceil(visibleTools.length / pageSize));
  const normalizedPage = Math.min(currentPage, totalPages);
  const startIndex = (normalizedPage - 1) * pageSize;
  const pagedTools = visibleTools.slice(startIndex, startIndex + pageSize);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar} data-ui="tools-topbar">
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Tools">
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

        <section className={styles.hero}>
          <p className={styles.kicker}>Live tool index</p>
          <h1>Tools</h1>
          <p className={styles.subtitle}>
            Browse curated AI tools with filters, sorting, and profile-first
            navigation designed for quick shortlisting.
          </p>

          <div className={styles.searchWrap}>
            <label className={styles.searchLabel} htmlFor="tools-search">
              Search tools
            </label>
            <input
              id="tools-search"
              aria-label="Search tools"
              className={styles.searchInput}
              type="search"
              placeholder="Search by tool name, category, or use case"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className={styles.controls}>
            <div className={styles.filterRow}>
              <button
                className={`${styles.filterChip} ${activeFilter === "All" ? styles.filterChipActive : ""}`}
                type="button"
                aria-pressed={activeFilter === "All"}
                onClick={() => {
                  setActiveFilter("All");
                  setCurrentPage(1);
                }}
              >
                All
              </button>
              {data.quickFilters.map((filter) => (
                <button
                  className={`${styles.filterChip} ${activeFilter === filter ? styles.filterChipActive : ""}`}
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setCurrentPage(1);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className={styles.sortGroup} role="group" aria-label="Sort tools">
              <button
                type="button"
                className={`${styles.sortButton} ${sortMode === "Popular" ? styles.sortButtonActive : ""}`}
                aria-pressed={sortMode === "Popular"}
                onClick={() => {
                  setSortMode("Popular");
                  setCurrentPage(1);
                }}
              >
                Popular
              </button>
              <button
                type="button"
                className={`${styles.sortButton} ${sortMode === "Newest" ? styles.sortButtonActive : ""}`}
                aria-pressed={sortMode === "Newest"}
                onClick={() => {
                  setSortMode("Newest");
                  setCurrentPage(1);
                }}
              >
                Newest
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="directory-results-title">
          <div className={styles.sectionHead}>
            <h2 id="directory-results-title">Directory Results</h2>
            <p>
              {visibleTools.length} tools · page {normalizedPage} of {totalPages}
            </p>
          </div>

          <div className={styles.cardGrid}>
            {pagedTools.length === 0 && (
              <article className={styles.emptyState}>
                <h3>No tools matched this search</h3>
                <p>Try a broader query or clear category filters.</p>
              </article>
            )}
            {pagedTools.map((tool) => (
              <article className={styles.toolCard} data-ui="tool-directory-card" key={tool.slug}>
                <p className={styles.toolTag}>{tool.tag}</p>
                <h3>{tool.name}</h3>
                <p className={styles.toolBlurb}>{tool.blurb}</p>
                <div className={styles.metaRow}>
                  <span>{tool.setupLabel}</span>
                  <span>{tool.pricingLabel}</span>
                </div>
                <div className={styles.cardActions}>
                  <Link href={tool.href}>Open profile</Link>
                  <a href={tool.outboundHref} target="_blank" rel="nofollow sponsored">
                    Visit website
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              disabled={normalizedPage <= 1}
            >
              Previous
            </button>
            <span data-ui="tools-page-indicator">
              Page {normalizedPage} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              onClick={() =>
                setCurrentPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={normalizedPage >= totalPages}
            >
              Next
            </button>
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
