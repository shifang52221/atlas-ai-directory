import { LinkKind, ToolStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  buildAdminToolsBackHref,
  formatAdminToolsFilterLabel,
  parseAdminToolsStatusFilter,
} from "@/lib/admin-tools-status-filter";
import { getDb } from "@/lib/db";
import styles from "../../../admin.module.css";
import { deleteToolAction, publishToolAction, updateToolAction } from "../actions";

type AdminToolDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    published?: string;
    publish_error?: string;
    status?: string;
  }>;
};

function getFlashMessage(query: {
  error?: string;
  saved?: string;
  published?: string;
}): { type: "success" | "error"; text: string } | null {
  if (query.published === "1") {
    return { type: "success", text: "Tool published successfully." };
  }
  if (query.saved === "1") {
    return { type: "success", text: "Tool changes saved." };
  }
  if (query.error) {
    return { type: "error", text: `Update failed (${query.error}).` };
  }
  return null;
}

const publishErrorLabels: Record<string, string> = {
  name: "Name",
  website_url: "Website URL",
  description: "Description",
  categories: "At least one category",
  primary_link: "Primary tracking link",
};

function parsePublishMissing(query: {
  publish_error?: string;
}): string[] {
  const raw = query.publish_error?.trim();
  if (!raw) {
    return [];
  }

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => decodeURIComponent(item).trim())
        .filter(Boolean),
    ),
  )
    .map((code) => publishErrorLabels[code] || code)
    .filter(Boolean);
}

export default async function AdminToolDetailPage({
  params,
  searchParams,
}: AdminToolDetailPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const statusFilter = parseAdminToolsStatusFilter(query.status);
  const backHref = buildAdminToolsBackHref(statusFilter);
  const filterLabel = formatAdminToolsFilterLabel(statusFilter);
  const flash = getFlashMessage(query);
  const publishMissing = parsePublishMissing(query);
  const db = getDb();

  const tool = await db.tool.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      tagline: true,
      websiteUrl: true,
      description: true,
      status: true,
      setupMinutes: true,
      pricingFrom: true,
      currency: true,
      categories: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      affiliateLinks: {
        where: {
          isPrimary: true,
        },
        select: {
          trackingUrl: true,
          linkKind: true,
        },
        take: 1,
      },
    },
  });

  if (!tool) {
    notFound();
  }

  const primaryLink = tool.affiliateLinks[0];
  const categoriesValue = tool.categories
    .map((item) => item.category.name)
    .join(", ");

  return (
    <>
      <section className={styles.panel}>
        <h1>Edit Tool</h1>
        <p>
          Update core fields, category bindings, and primary affiliate link for
          <strong> {tool.name}</strong>.
        </p>
        <p>
          <Link href={backHref}>Back to Tool List</Link>
          {filterLabel && <span className={styles.filterTag}>{filterLabel}</span>}
        </p>
        {flash && (
          <p
            className={
              flash.type === "success" ? styles.flashSuccess : styles.flashError
            }
          >
            {flash.text}
          </p>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Tool Details</h2>
        {publishMissing.length > 0 && (
          <div className={styles.publishBlockError}>
            <p>Cannot publish yet. Complete these items first:</p>
            <ul className={styles.publishMissingList}>
              {publishMissing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <form action={updateToolAction} className={styles.formGrid}>
          <input type="hidden" name="currentSlug" value={tool.slug} />
          <input
            type="hidden"
            name="currentStatusFilter"
            value={statusFilter || ""}
          />
          <div className={styles.field}>
            <label htmlFor="edit-tool-name">Name *</label>
            <input
              id="edit-tool-name"
              name="name"
              defaultValue={tool.name}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-slug">Slug *</label>
            <input
              id="edit-tool-slug"
              name="slug"
              defaultValue={tool.slug}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-website">Website URL *</label>
            <input
              id="edit-tool-website"
              name="websiteUrl"
              defaultValue={tool.websiteUrl}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-tagline">Tagline</label>
            <input
              id="edit-tool-tagline"
              name="tagline"
              defaultValue={tool.tagline || ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-status">Status</label>
            <select id="edit-tool-status" name="status" defaultValue={tool.status}>
              <option value={ToolStatus.ACTIVE}>ACTIVE</option>
              <option value={ToolStatus.INACTIVE}>INACTIVE</option>
              <option value={ToolStatus.ARCHIVED}>ARCHIVED</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-setup">Setup Minutes</label>
            <input
              id="edit-tool-setup"
              name="setupMinutes"
              type="number"
              min="0"
              defaultValue={tool.setupMinutes ?? ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-pricing">Pricing From</label>
            <input
              id="edit-tool-pricing"
              name="pricingFrom"
              defaultValue={tool.pricingFrom?.toString() ?? ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-currency">Currency</label>
            <input
              id="edit-tool-currency"
              name="currency"
              defaultValue={tool.currency}
            />
          </div>
          <div className={styles.fieldFull}>
            <label htmlFor="edit-tool-description">Description</label>
            <textarea
              id="edit-tool-description"
              name="description"
              rows={4}
              defaultValue={tool.description || ""}
            />
          </div>
          <div className={styles.fieldFull}>
            <label htmlFor="edit-tool-categories">
              Categories (comma-separated)
            </label>
            <input
              id="edit-tool-categories"
              name="categories"
              defaultValue={categoriesValue}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-tracking">Primary Tracking URL</label>
            <input
              id="edit-tool-tracking"
              name="trackingUrl"
              defaultValue={primaryLink?.trackingUrl || ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edit-tool-link-kind">Primary Link Type</label>
            <select
              id="edit-tool-link-kind"
              name="linkKind"
              defaultValue={primaryLink?.linkKind || LinkKind.AFFILIATE}
            >
              <option value={LinkKind.AFFILIATE}>AFFILIATE</option>
              <option value={LinkKind.SPONSORED}>SPONSORED</option>
              <option value={LinkKind.DIRECT}>DIRECT</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Publishing</h2>
        <p>
          Publish will validate required fields and switch status to ACTIVE when
          all checks pass.
        </p>
        <form action={publishToolAction}>
          <input type="hidden" name="slug" value={tool.slug} />
          <input
            type="hidden"
            name="currentStatusFilter"
            value={statusFilter || ""}
          />
          <button
            className={styles.publishButton}
            type="submit"
            disabled={tool.status === ToolStatus.ACTIVE}
          >
            {tool.status === ToolStatus.ACTIVE ? "Already Published" : "Publish Tool"}
          </button>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Danger Zone</h2>
        <p>
          Delete this tool permanently. This removes related records through
          cascading deletes where configured.
        </p>
        <form action={deleteToolAction}>
          <input type="hidden" name="slug" value={tool.slug} />
          <input
            type="hidden"
            name="currentStatusFilter"
            value={statusFilter || ""}
          />
          <button className={styles.dangerButton} type="submit">
            Delete Tool
          </button>
        </form>
      </section>
    </>
  );
}
