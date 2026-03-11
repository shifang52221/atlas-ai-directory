import Link from "next/link";
import styles from "./site-footer.module.css";

const primaryLinks = [
  { label: "Categories", href: "/use-cases" },
  { label: "Tools", href: "/tools" },
  { label: "Compare", href: "/compare" },
  { label: "Workflows", href: "/workflows" },
];

const utilityLinks = [
  { label: "Submit Tool", href: "/submit" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Contact", href: "/submit" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer} data-ui="site-footer">
      <div className={styles.top}>
        <div>
          <p className={styles.kicker}>Atlas AI Directory</p>
          <p className={styles.copy}>
            Decision-first AI navigation for operators focused on adoption,
            deployment speed, and measurable ROI.
          </p>
        </div>

        <div className={styles.linkGroup}>
          {primaryLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.linkGroup}>
          {utilityLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <p>(c) {new Date().getFullYear()} Atlas AI Directory</p>
        <p>Affiliate and ad-supported. Sponsored placements are labeled.</p>
      </div>
    </footer>
  );
}
