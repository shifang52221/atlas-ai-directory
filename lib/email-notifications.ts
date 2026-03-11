type EmailNotificationConfig = {
  resendApiKey: string;
  fromEmail: string;
  adminEmail: string;
  appBaseUrl: string;
};

type SubmissionEmailInput = {
  toolName: string;
  companyName: string;
  contactEmail: string;
  websiteUrl: string;
  message: string;
};

type ConversionEmailInput = {
  toolName: string;
  contactEmail: string;
  toolSlug: string;
};

function normalizeBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "");
  return normalized || "http://localhost:3000";
}

export function getEmailNotificationConfig(): EmailNotificationConfig {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
    fromEmail: process.env.NOTIFY_FROM_EMAIL?.trim() || "",
    adminEmail: process.env.NOTIFY_ADMIN_EMAIL?.trim() || "",
    appBaseUrl: normalizeBaseUrl(process.env.APP_BASE_URL || ""),
  };
}

export function buildAppUrl(path: string): string {
  const config = getEmailNotificationConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.appBaseUrl}${normalizedPath}`;
}

export function isEmailNotificationConfigured(): boolean {
  const config = getEmailNotificationConfig();
  return Boolean(config.resendApiKey && config.fromEmail && config.adminEmail);
}

export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const config = getEmailNotificationConfig();
  if (!config.resendApiKey || !config.fromEmail) {
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function notifyOnSubmissionReceived(
  input: SubmissionEmailInput,
): Promise<void> {
  if (!isEmailNotificationConfigured()) {
    return;
  }

  const config = getEmailNotificationConfig();
  const adminReviewUrl = buildAppUrl("/admin/submissions");
  const safeCompany = input.companyName || "N/A";
  const safeMessage = input.message || "No message provided.";

  await sendEmailNotification({
    to: config.adminEmail,
    subject: `[Atlas] New submission: ${input.toolName}`,
    html: `
      <p>A new tool submission was received.</p>
      <ul>
        <li><strong>Tool:</strong> ${input.toolName}</li>
        <li><strong>Company:</strong> ${safeCompany}</li>
        <li><strong>Contact:</strong> ${input.contactEmail}</li>
        <li><strong>Website:</strong> ${input.websiteUrl}</li>
        <li><strong>Message:</strong> ${safeMessage}</li>
      </ul>
      <p><a href="${adminReviewUrl}">Open submission review</a></p>
    `,
  });

  await sendEmailNotification({
    to: input.contactEmail,
    subject: `We received your submission: ${input.toolName}`,
    html: `
      <p>Thanks for submitting <strong>${input.toolName}</strong> to Atlas AI Directory.</p>
      <p>Our editorial team will review your submission and update you if more information is required.</p>
      <p>Submission summary:</p>
      <ul>
        <li><strong>Website:</strong> ${input.websiteUrl}</li>
        <li><strong>Company:</strong> ${safeCompany}</li>
      </ul>
    `,
  });
}

export async function notifyOnSubmissionConvertedToTool(
  input: ConversionEmailInput,
): Promise<void> {
  if (!isEmailNotificationConfigured()) {
    return;
  }

  const config = getEmailNotificationConfig();
  const adminToolUrl = buildAppUrl(`/admin/tools/${input.toolSlug}`);

  await sendEmailNotification({
    to: config.adminEmail,
    subject: `[Atlas] Submission converted: ${input.toolName}`,
    html: `
      <p>The submission for <strong>${input.toolName}</strong> has been converted to a tool draft.</p>
      <p><a href="${adminToolUrl}">Open tool draft</a></p>
    `,
  });

  await sendEmailNotification({
    to: input.contactEmail,
    subject: `Submission approved: ${input.toolName}`,
    html: `
      <p>Your submission for <strong>${input.toolName}</strong> has been approved and converted to a draft profile.</p>
      <p>Our team may refine details before publishing.</p>
    `,
  });
}
