import Link from "next/link";
import { LinkKind, ToolStatus } from "@prisma/client";
import {
  buildAdminToolsListHref,
  parseAdminToolsStatusFilter,
} from "@/lib/admin-tools-status-filter";
import { getDb } from "@/lib/db";
import styles from "../../admin.module.css";
import { createToolAction, toggleToolStatusAction } from "./actions";

type AdminToolsPageProps = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    status?: string;
  }>;
};

type ToolRow = {
  slug: string;
  name: string;
  status: ToolStatus;
  updatedAt: string;
  categories: string[];
  hasPrimaryLink: boolean;
};

type StatusCounts = {
  all: number;
  active: number;
  inactive: number;
};

async function getToolsAdminData(statusFilter: ToolStatus | null): Promise<{
  dbAvailable: boolean;
  tools: ToolRow[];
  statusCounts: StatusCounts;
}> {
  try {
    const db = getDb();
    const [tools, allCount, activeCount, inactiveCount] = await Promise.all([
      db.tool.findMany({
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: { updatedAt: "desc" },
        take: 120,
        select: {
          slug: true,
          name: true,
          status: true,
          updatedAt: true,
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
              id: true,
            },
            take: 1,
          },
        },
      }),
      db.tool.count(),
      db.tool.count({ where: { status: ToolStatus.ACTIVE } }),
      db.tool.count({ where: { status: ToolStatus.INACTIVE } }),
    ]);

    return {
      dbAvailable: true,
      tools: tools.map((tool) => ({
        slug: tool.slug,
        name: tool.name,
        status: tool.status,
        updatedAt: tool.updatedAt.toISOString().slice(0, 10),
        categories: tool.categories.map((item) => item.category.name),
        hasPrimaryLink: tool.affiliateLinks.length > 0,
      })),
      statusCounts: {
        all: allCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    };
  } catch {
    return {
      dbAvailable: false,
      tools: [],
      statusCounts: {
        all: 0,
        active: 0,
        inactive: 0,
      },
    };
  }
}

function getNextStatus(status: ToolStatus): ToolStatus {
  if (status === ToolStatus.ACTIVE) {
    return ToolStatus.INACTIVE;
  }
  return ToolStatus.ACTIVE;
}

function getFlashMessage(query: {
  error?: string;
  created?: string;
  updated?: string;
  deleted?: string;
}): { type: "success" | "error"; text: string } | null {
  if (query.created === "1") {
    return { type: "success", text: "Tool created successfully." };
  }
  if (query.updated === "1") {
    return { type: "success", text: "Tool updated successfully." };
  }
  if (query.deleted === "1") {
    return { type: "success", text: "Tool deleted successfully." };
  }
  if (query.error) {
    return { type: "error", text: `Operation failed (${query.error}).` };
  }
  return null;
}

export default async function AdminToolsPage({ searchParams }: AdminToolsPageProps) {
  const query = await searchParams;
  const statusFilter = parseAdminToolsStatusFilter(query.status);
  const data = await getToolsAdminData(statusFilter);
  const flash = getFlashMessage(query);
  const filterLinks = [
    {
      href: buildAdminToolsListHref({ statusFilter: null }),
      label: `All (${data.statusCounts.all})`,
      isActive: statusFilter === null,
    },
    {
      href: buildAdminToolsListHref({ statusFilter: ToolStatus.ACTIVE }),
      label: `Active (${data.statusCounts.active})`,
      isActive: statusFilter === ToolStatus.ACTIVE,
    },
    {
      href: buildAdminToolsListHref({ statusFilter: ToolStatus.INACTIVE }),
      label: `Inactive (${data.statusCounts.inactive})`,
      isActive: statusFilter === ToolStatus.INACTIVE,
    },
  ];

  return (
    <>
      <section className={styles.panel}>
        <h1>Tool Management</h1>
        <p>
          Create and update tool profiles, bind categories, set primary affiliate
          links, and control publish status.
        </p>
        {!data.dbAvailable && (
          <p className={styles.infoNote}>
            Database is currently unavailable. Tool management actions are paused.
          </p>
        )}
        {flash && (
          <p
            className={
              flash.type === "success" ? styles.flashSuccess : styles.flashError
            }
          >
            {flash.text}
          </p>
        )}
        <div className={styles.filterRow}>
          {filterLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.filterRowLink} ${item.isActive ? styles.filterRowLinkActive : ""}`}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Create Tool</h2>
        <form action={createToolAction} className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="tool-name">Name *</label>
            <input id="tool-name" name="name" placeholder="Zapier AI" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-slug">Slug</label>
            <input id="tool-slug" name="slug" placeholder="zapier-ai (optional)" />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-website">Website URL *</label>
            <input
              id="tool-website"
              name="websiteUrl"
              placeholder="https://example.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-tagline">Tagline</label>
            <input
              id="tool-tagline"
              name="tagline"
              placeholder="Workflow Automation"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-status">Status</label>
            <select id="tool-status" name="status" defaultValue={ToolStatus.ACTIVE}>
              <option value={ToolStatus.ACTIVE}>ACTIVE</option>
              <option value={ToolStatus.INACTIVE}>INACTIVE</option>
              <option value={ToolStatus.ARCHIVED}>ARCHIVED</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-setup">Setup Minutes</label>
            <input id="tool-setup" name="setupMinutes" type="number" min="0" />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-pricing">Pricing From</label>
            <input id="tool-pricing" name="pricingFrom" placeholder="19.99" />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-currency">Currency</label>
            <input
              id="tool-currency"
              name="currency"
              placeholder="USD"
              defaultValue="USD"
            />
          </div>
          <div className={styles.fieldFull}>
            <label htmlFor="tool-description">Description</label>
            <textarea
              id="tool-description"
              name="description"
              rows={3}
              placeholder="Short profile summary"
            />
          </div>
          <div className={styles.fieldFull}>
            <label htmlFor="tool-categories">Categories (comma-separated)</label>
            <input
              id="tool-categories"
              name="categories"
              placeholder="Automation, No-Code, Sales Ops"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-tracking-url">Primary Tracking URL</label>
            <input
              id="tool-tracking-url"
              name="trackingUrl"
              placeholder="https://partner.example.com/offer"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tool-link-kind">Primary Link Type</label>
            <select
              id="tool-link-kind"
              name="linkKind"
              defaultValue={LinkKind.AFFILIATE}
            >
              <option value={LinkKind.AFFILIATE}>AFFILIATE</option>
              <option value={LinkKind.SPONSORED}>SPONSORED</option>
              <option value={LinkKind.DIRECT}>DIRECT</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <input
              type="hidden"
              name="currentStatusFilter"
              value={statusFilter || ""}
            />
            <button type="submit">Create Tool</button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Existing Tools</h2>
        {data.tools.length === 0 ? (
          <p>No tools found for this filter.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Status</th>
                  <th>Categories</th>
                  <th>Primary Link</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.tools.map((tool) => (
                  <tr key={tool.slug}>
                    <td>{tool.name}</td>
                    <td>{tool.status}</td>
                    <td>{tool.categories.join(", ") || "N/A"}</td>
                    <td>{tool.hasPrimaryLink ? "Yes" : "No"}</td>
                    <td>{tool.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link
                          href={
                            statusFilter
                              ? `/admin/tools/${tool.slug}?status=${statusFilter}`
                              : `/admin/tools/${tool.slug}`
                          }
                        >
                          Edit
                        </Link>
                        <form action={toggleToolStatusAction}>
                          <input type="hidden" name="slug" value={tool.slug} />
                          <input
                            type="hidden"
                            name="nextStatus"
                            value={getNextStatus(tool.status)}
                          />
                          <input
                            type="hidden"
                            name="currentStatusFilter"
                            value={statusFilter || ""}
                          />
                          <button type="submit">
                            {tool.status === ToolStatus.ACTIVE
                              ? "Set Inactive"
                              : "Set Active"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
