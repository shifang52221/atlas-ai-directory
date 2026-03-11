import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdminAction } from "../login/actions";
import styles from "../admin.module.css";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <main className={styles.adminPage}>
      <div className={styles.adminShell}>
        <header className={styles.adminTopbar}>
          <Link className={styles.adminBrand} href="/admin">
            Atlas Admin
          </Link>
          <nav className={styles.adminNav} aria-label="Admin navigation">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/tools">Tools</Link>
            <Link href="/admin/affiliate">Affiliate</Link>
            <Link href="/admin/categories">Categories</Link>
            <Link href="/admin/submissions">Submissions</Link>
            <Link href="/admin/rate-limit">Rate Limits</Link>
            <Link href="/tools">View site</Link>
          </nav>
          <form action={logoutAdminAction}>
            <button className={styles.logoutBtn} type="submit">
              Log out
            </button>
          </form>
        </header>

        <div className={styles.adminContent}>{children}</div>
      </div>
    </main>
  );
}
