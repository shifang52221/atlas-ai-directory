import Link from "next/link";
import type { Metadata } from "next";
import { createSubmissionAction } from "./actions";
import styles from "./page.module.css";

type SubmitPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export const metadata: Metadata = {
  title: "Submit Tool | Atlas AI Directory",
  description: "Submit your AI tool for review and inclusion.",
};

function getNotice(query: {
  success?: string;
  error?: string;
}): { type: "success" | "error"; text: string } | null {
  if (query.success === "1") {
    return {
      type: "success",
      text: "Submission received. We will review it shortly.",
    };
  }
  if (query.error === "missing_required") {
    return { type: "error", text: "Please fill all required fields." };
  }
  if (query.error === "invalid_url") {
    return { type: "error", text: "Website URL must start with http:// or https://." };
  }
  if (query.error === "rate_limited") {
    return {
      type: "error",
      text: "Too many submissions from your network. Please try again later.",
    };
  }
  if (query.error) {
    return { type: "error", text: "Unable to save submission right now." };
  }
  return null;
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const query = await searchParams;
  const notice = getNotice(query);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            Atlas AI Directory
          </Link>
          <nav className={styles.topnav} aria-label="Submission navigation">
            <Link href="/tools">Tools</Link>
            <Link href="/use-cases">Use cases</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/workflows">Workflows</Link>
          </nav>
          <Link className={styles.secondaryBtn} href="/">
            Back Home
          </Link>
        </header>

        <section className={styles.card}>
          <h1>Submit Your Tool</h1>
          <p>
            Share your AI product for editorial review. Approved submissions will
            be added to the directory and relevant use-case pages.
          </p>
          {notice && (
            <p
              className={
                notice.type === "success" ? styles.noticeSuccess : styles.noticeError
              }
            >
              {notice.text}
            </p>
          )}

          <form action={createSubmissionAction} className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="tool-name">Tool name *</label>
              <input id="tool-name" name="toolName" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="company-name">Company name</label>
              <input id="company-name" name="companyName" />
            </div>
            <div className={styles.field}>
              <label htmlFor="contact-email">Contact email *</label>
              <input id="contact-email" name="contactEmail" type="email" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="website-url">Website URL *</label>
              <input
                id="website-url"
                name="websiteUrl"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className={styles.fieldFull}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us what use cases and teams your tool serves."
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit">Submit for Review</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
