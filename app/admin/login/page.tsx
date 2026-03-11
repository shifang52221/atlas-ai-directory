import type { Metadata } from "next";
import { loginAdminAction } from "./actions";
import styles from "../admin.module.css";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "Admin Login | Atlas AI Directory",
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const query = await searchParams;
  const error = query.error;
  const errorText =
    error === "rate_limited"
      ? "Too many login attempts. Please wait and try again."
      : error === "1"
        ? "Invalid email or password. Try again."
        : null;

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <h1>Admin Login</h1>
        <p>Sign in to manage tools, categories, affiliate links, and status.</p>
        {errorText && (
          <p className={styles.loginError}>
            {errorText}
          </p>
        )}
        <form action={loginAdminAction} className={styles.loginForm}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            placeholder="admin@atlas.local"
            defaultValue="admin@atlas.local"
            required
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            placeholder="Enter admin password"
            required
          />
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
