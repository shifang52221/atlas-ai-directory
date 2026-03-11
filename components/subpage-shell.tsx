import Link from "next/link";
import styles from "./subpage-shell.module.css";
import { SiteFooter } from "./site-footer";

type QuickCard = {
  title: string;
  description: string;
};

type SectionLink = {
  label: string;
  href: string;
};

type SubpageShellProps = {
  title: string;
  subtitle: string;
  kicker: string;
  quickCards: QuickCard[];
  sectionTitle: string;
  sectionBody: string;
  sectionLinks?: SectionLink[];
};

const nav = [
  { label: "Categories", href: "/use-cases" },
  { label: "Popular", href: "/tools" },
  { label: "New", href: "/tools" },
  { label: "Compare", href: "/compare" },
  { label: "Workflows", href: "/workflows" },
];

export function SubpageShell({
  title,
  subtitle,
  kicker,
  quickCards,
  sectionTitle,
  sectionBody,
  sectionLinks,
}: SubpageShellProps) {
  return (
    <main className={styles.page} data-ui="subpage-shell">
      <div className={styles.shell}>
        <header className={styles.topbar} data-ui="subpage-topbar">
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.nav} aria-label="Subpage">
            {nav.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className={styles.submit} href="/submit">
            Submit tool
          </Link>
        </header>

        <section className={styles.hero}>
          <p className={styles.kicker}>{kicker}</p>
          <h1>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>

          <div className={styles.quickGrid}>
            {quickCards.map((card) => (
              <article className={styles.quickCard} key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.content}>
          <h2>{sectionTitle}</h2>
          <p>{sectionBody}</p>
          {sectionLinks && sectionLinks.length > 0 && (
            <div className={styles.methodologyCard}>
              <h3>Methodology references</h3>
              <div className={styles.methodologyLinks}>
                {sectionLinks.map((item) => (
                  <Link key={`${item.href}-${item.label}`} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
