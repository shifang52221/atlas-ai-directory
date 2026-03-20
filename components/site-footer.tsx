import Link from "next/link";
import styles from "./site-footer.module.css";

const primaryLinks = [
  { label: "Explore Use Cases", href: "/use-cases" },
  { label: "Browse All Tools", href: "/tools" },
  { label: "Compare Categories", href: "/compare" },
  { label: "Open Workflow Templates", href: "/workflows" },
];

const utilityLinks = [
  { label: "Submit Tool", href: "/submit" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
  { label: "Editorial Policy", href: "/editorial-policy" },
  { label: "Contact", href: "/submit" },
];

const hubLinks = [
  { label: "Best AI Automation Tools for Ops Teams", href: "/best-ai-automation-tools" },
  { label: "Best AI Agents for Sales Teams", href: "/best-ai-agents-for-sales" },
  { label: "Best AI Tools for Customer Support", href: "/best-ai-tools-for-support" },
  { label: "Best AI Tools for Marketing Teams", href: "/best-ai-tools-for-marketing" },
];

const commercialLinks = [
  {
    label: "Best AI Automation Tools for Small Business",
    href: "/best-ai-automation-tools-for-small-business",
  },
  { label: "Make Alternatives", href: "/make-alternatives" },
  { label: "Semrush Alternatives", href: "/semrush-alternatives" },
  { label: "monday vs ClickUp for Ops Teams", href: "/monday-vs-clickup-for-ops" },
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
          <p className={styles.groupTitle}>Directory</p>
          {primaryLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.linkGroup}>
          <p className={styles.groupTitle}>Trust + Submit</p>
          {utilityLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.linkGroup}>
          <p className={styles.groupTitle}>Best-of Hubs</p>
          {hubLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className={styles.linkGroup}>
          <p className={styles.groupTitle}>Commercial Guides</p>
          {commercialLinks.map((item) => (
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
