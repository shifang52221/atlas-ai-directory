import { SubmissionStatus } from "@prisma/client";
import { getDb } from "@/lib/db";
import styles from "../../admin.module.css";
import {
  convertSubmissionToToolAction,
  updateSubmissionStatusAction,
} from "./actions";

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ status?: string; error?: string; updated?: string }>;
};

type SubmissionRow = {
  id: string;
  toolName: string;
  companyName: string | null;
  contactEmail: string;
  websiteUrl: string;
  message: string | null;
  status: SubmissionStatus;
  createdAt: string;
};

async function getSubmissionsData(statusFilter: SubmissionStatus | null): Promise<{
  dbAvailable: boolean;
  submissions: SubmissionRow[];
}> {
  try {
    const db = getDb();
    const submissions = await db.submission.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        toolName: true,
        companyName: true,
        contactEmail: true,
        websiteUrl: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      dbAvailable: true,
      submissions: submissions.map((submission) => ({
        ...submission,
        createdAt: submission.createdAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    return {
      dbAvailable: false,
      submissions: [],
    };
  }
}

function parseStatusFilter(value?: string): SubmissionStatus | null {
  if (value === SubmissionStatus.PENDING) {
    return SubmissionStatus.PENDING;
  }
  if (value === SubmissionStatus.APPROVED) {
    return SubmissionStatus.APPROVED;
  }
  if (value === SubmissionStatus.REJECTED) {
    return SubmissionStatus.REJECTED;
  }
  return null;
}

function getFlashMessage(query: {
  error?: string;
  updated?: string;
}): { type: "success" | "error"; text: string } | null {
  if (query.updated === "1") {
    return { type: "success", text: "Submission status updated." };
  }
  if (query.error) {
    return { type: "error", text: `Update failed (${query.error}).` };
  }
  return null;
}

export default async function AdminSubmissionsPage({
  searchParams,
}: AdminSubmissionsPageProps) {
  const query = await searchParams;
  const statusFilter = parseStatusFilter(query.status);
  const data = await getSubmissionsData(statusFilter);
  const flash = getFlashMessage(query);

  return (
    <>
      <section className={styles.panel}>
        <h1>Submission Review</h1>
        <p>
          Review incoming tool submissions and set status to approved, rejected,
          or pending.
        </p>
        {!data.dbAvailable && (
          <p className={styles.infoNote}>
            Database is currently unavailable. Submission review actions are paused.
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
          <a href="/admin/submissions">All</a>
          <a href="/admin/submissions?status=PENDING">Pending</a>
          <a href="/admin/submissions?status=APPROVED">Approved</a>
          <a href="/admin/submissions?status=REJECTED">Rejected</a>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Submissions</h2>
        {data.submissions.length === 0 ? (
          <p>No submissions found for this filter.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Contact</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <strong>{submission.toolName}</strong>
                      {submission.companyName && (
                        <p className={styles.inlineNote}>{submission.companyName}</p>
                      )}
                      {submission.message && (
                        <p className={styles.inlineNote}>{submission.message}</p>
                      )}
                    </td>
                    <td>{submission.contactEmail}</td>
                    <td>
                      <a href={submission.websiteUrl} target="_blank" rel="noreferrer">
                        {submission.websiteUrl}
                      </a>
                    </td>
                    <td>{submission.status}</td>
                    <td>{submission.createdAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <form action={updateSubmissionStatusAction}>
                          <input
                            type="hidden"
                            name="submissionId"
                            value={submission.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value={SubmissionStatus.APPROVED}
                          />
                          <button type="submit">Approve</button>
                        </form>
                        <form action={updateSubmissionStatusAction}>
                          <input
                            type="hidden"
                            name="submissionId"
                            value={submission.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value={SubmissionStatus.REJECTED}
                          />
                          <button type="submit">Reject</button>
                        </form>
                        <form action={updateSubmissionStatusAction}>
                          <input
                            type="hidden"
                            name="submissionId"
                            value={submission.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value={SubmissionStatus.PENDING}
                          />
                          <button type="submit">Set Pending</button>
                        </form>
                        <form action={convertSubmissionToToolAction}>
                          <input
                            type="hidden"
                            name="submissionId"
                            value={submission.id}
                          />
                          <button type="submit">Convert to Tool</button>
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
