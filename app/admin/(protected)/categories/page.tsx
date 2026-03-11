import Link from "next/link";
import { getDb } from "@/lib/db";
import styles from "../../admin.module.css";
import { createCategoryAction, deleteCategoryAction } from "./actions";

type AdminCategoriesPageProps = {
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string }>;
};

type CategoryRow = {
  slug: string;
  name: string;
  description: string | null;
  toolCount: number;
  updatedAt: string;
};

async function getCategoryData(): Promise<{
  dbAvailable: boolean;
  categories: CategoryRow[];
}> {
  try {
    const db = getDb();
    const categories = await db.category.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        slug: true,
        name: true,
        description: true,
        updatedAt: true,
        _count: {
          select: {
            tools: true,
          },
        },
      },
    });

    return {
      dbAvailable: true,
      categories: categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        toolCount: category._count.tools,
        updatedAt: category.updatedAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    return {
      dbAvailable: false,
      categories: [],
    };
  }
}

function getFlashMessage(query: {
  error?: string;
  saved?: string;
  deleted?: string;
}): { type: "success" | "error"; text: string } | null {
  if (query.saved === "1") {
    return { type: "success", text: "Category saved successfully." };
  }
  if (query.deleted === "1") {
    return { type: "success", text: "Category deleted successfully." };
  }
  if (query.error) {
    return { type: "error", text: `Operation failed (${query.error}).` };
  }
  return null;
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const [query, data] = await Promise.all([searchParams, getCategoryData()]);
  const flash = getFlashMessage(query);

  return (
    <>
      <section className={styles.panel}>
        <h1>Category Management</h1>
        <p>
          Maintain use-case categories used by homepage navigation and use-case
          landing pages.
        </p>
        {!data.dbAvailable && (
          <p className={styles.infoNote}>
            Database is currently unavailable. Category actions are paused.
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
      </section>

      <section className={styles.panel}>
        <h2>Create / Update Category</h2>
        <form action={createCategoryAction} className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="category-name">Name *</label>
            <input id="category-name" name="name" placeholder="Support Automation" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="category-slug">Slug</label>
            <input id="category-slug" name="slug" placeholder="support-automation (optional)" />
          </div>
          <div className={styles.fieldFull}>
            <label htmlFor="category-description">Description</label>
            <textarea
              id="category-description"
              name="description"
              rows={3}
              placeholder="Short use-case description"
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit">Save Category</button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Existing Categories</h2>
        {data.categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Tools</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((category) => (
                  <tr key={category.slug}>
                    <td>
                      <strong>{category.name}</strong>
                      {category.description && (
                        <p className={styles.inlineNote}>{category.description}</p>
                      )}
                    </td>
                    <td>{category.slug}</td>
                    <td>{category.toolCount}</td>
                    <td>{category.updatedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link href={`/use-cases/${category.slug}`} target="_blank">
                          View page
                        </Link>
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="slug" value={category.slug} />
                          <button type="submit">Delete</button>
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
