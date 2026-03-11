import { LinkKind, SubmissionStatus, ToolStatus } from "@prisma/client";
import { z } from "zod";

function toStringValue(formData: FormData, key: string): string {
  return String(formData.get(key) || "");
}

function optionalTrimmed(max: number) {
  return z
    .string()
    .transform((value) => value.trim() || undefined)
    .pipe(z.string().max(max).optional());
}

const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "invalid_http_url");

const submissionSchema = z.object({
  contactEmail: z.string().trim().email().max(320),
  toolName: z.string().trim().min(1).max(140),
  websiteUrl: httpUrlSchema,
  companyName: optionalTrimmed(140),
  message: optionalTrimmed(3000),
});

const adminLoginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().trim().min(1).max(300),
});

const toolFormBaseSchema = z.object({
  name: z.string().trim().min(1).max(140),
  slug: z.string().trim().max(140).optional(),
  websiteUrl: httpUrlSchema,
  tagline: optionalTrimmed(160),
  description: optionalTrimmed(4000),
  status: z.nativeEnum(ToolStatus),
  setupMinutes: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value ?? "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseInt(text, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(0).max(10080).optional()),
  pricingFrom: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value ?? "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseFloat(text);
      if (Number.isNaN(parsed) || parsed < 0) {
        return undefined;
      }
      return text;
    })
    .pipe(z.string().max(32).optional()),
  currency: z
    .string()
    .trim()
    .transform((value) => (value || "USD").toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{3}$/)),
  categories: optionalTrimmed(600),
  trackingUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine(
      (value) => !value || httpUrlSchema.safeParse(value).success,
      "invalid_tracking_url",
    ),
  linkKind: z.nativeEnum(LinkKind),
  currentStatusFilter: z.string().trim().optional(),
});

const adminToolCreateSchema = toolFormBaseSchema;

const adminToolUpdateSchema = toolFormBaseSchema.extend({
  currentSlug: z.string().trim().min(1).max(140),
});

const adminToolStatusSchema = z.object({
  slug: z.string().trim().min(1).max(140),
  nextStatus: z.nativeEnum(ToolStatus),
  currentStatusFilter: z.string().trim().optional(),
});

const adminToolSlugSchema = z.object({
  slug: z.string().trim().min(1).max(140),
  currentStatusFilter: z.string().trim().optional(),
});

const adminCategorySchema = z.object({
  name: z.string().trim().min(1).max(140),
  slug: optionalTrimmed(140),
  description: optionalTrimmed(1600),
});

const adminCategoryDeleteSchema = z.object({
  slug: z.string().trim().min(1).max(140),
});

const adminSubmissionStatusSchema = z.object({
  submissionId: z.string().trim().min(1).max(120),
  status: z.nativeEnum(SubmissionStatus),
});

const adminSubmissionConvertSchema = z.object({
  submissionId: z.string().trim().min(1).max(120),
});

const affiliateMinImpressionsSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    const text = String(value ?? "").trim();
    if (!text) {
      return undefined;
    }
    const parsed = Number.parseInt(text, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  .pipe(z.number().int().min(1).max(100000).optional());

const affiliateMinLiftSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    const text = String(value ?? "").trim();
    if (!text) {
      return undefined;
    }
    const parsed = Number.parseFloat(text);
    return Number.isNaN(parsed) ? undefined : parsed;
  })
  .pipe(z.number().min(0).max(10).optional());

const adminAffiliateBackfillSchema = z.object({
  toolSlug: z.string().trim().min(1).max(140),
  metricKind: z.enum(["IMPRESSION", "CONVERSION"]),
  count: z
    .union([z.string(), z.number()])
    .transform((value) => Number.parseInt(String(value || ""), 10))
    .pipe(z.number().int().min(1).max(100000)),
  note: optionalTrimmed(600),
  window: z.string().trim().optional(),
  hub: z.string().trim().optional(),
  actionStatus: z
    .enum(["ALL", "UNVERIFIED", "TODO", "TESTING", "VERIFIED", "DISMISSED"])
    .optional(),
  actionSort: z.enum(["UPDATED_DESC", "UPDATED_ASC"]).optional(),
  minImp: affiliateMinImpressionsSchema,
  minLift: affiliateMinLiftSchema,
});

const adminAffiliateBackfillDeleteSchema = z.object({
  entryId: z.string().trim().min(1).max(260),
  window: z.string().trim().optional(),
  tool: z.string().trim().optional(),
  hub: z.string().trim().optional(),
  historyPage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value || "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseInt(text, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(1).max(9999).optional()),
  historyTool: z.string().trim().optional(),
  historyKind: z.enum(["ALL", "IMPRESSION", "CONVERSION"]).optional(),
  actionStatus: z
    .enum(["ALL", "UNVERIFIED", "TODO", "TESTING", "VERIFIED", "DISMISSED"])
    .optional(),
  actionSort: z.enum(["UPDATED_DESC", "UPDATED_ASC"]).optional(),
  minImp: affiliateMinImpressionsSchema,
  minLift: affiliateMinLiftSchema,
});

const adminAffiliateBackfillCorrectSchema = z.object({
  entryId: z.string().trim().min(1).max(260),
  toolSlug: z.string().trim().min(1).max(140),
  metricKind: z.enum(["IMPRESSION", "CONVERSION"]),
  count: z
    .union([z.string(), z.number()])
    .transform((value) => Number.parseInt(String(value || ""), 10))
    .pipe(z.number().int().min(1).max(100000)),
  note: optionalTrimmed(600),
  window: z.string().trim().optional(),
  tool: z.string().trim().optional(),
  hub: z.string().trim().optional(),
  historyPage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value || "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseInt(text, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(1).max(9999).optional()),
  historyTool: z.string().trim().optional(),
  historyKind: z.enum(["ALL", "IMPRESSION", "CONVERSION"]).optional(),
  actionStatus: z
    .enum(["ALL", "UNVERIFIED", "TODO", "TESTING", "VERIFIED", "DISMISSED"])
    .optional(),
  actionSort: z.enum(["UPDATED_DESC", "UPDATED_ASC"]).optional(),
  minImp: affiliateMinImpressionsSchema,
  minLift: affiliateMinLiftSchema,
});

const adminAffiliateHubActionSchema = z.object({
  pagePath: z.string().trim().min(1).max(260),
  status: z.enum(["TODO", "TESTING", "VERIFIED", "DISMISSED"]),
  note: optionalTrimmed(600),
  window: z.string().trim().optional(),
  tool: z.string().trim().optional(),
  hub: z.string().trim().optional(),
  historyPage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value || "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseInt(text, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(1).max(9999).optional()),
  historyTool: z.string().trim().optional(),
  historyKind: z.enum(["ALL", "IMPRESSION", "CONVERSION"]).optional(),
  actionStatus: z
    .enum(["ALL", "UNVERIFIED", "TODO", "TESTING", "VERIFIED", "DISMISSED"])
    .optional(),
  actionSort: z.enum(["UPDATED_DESC", "UPDATED_ASC"]).optional(),
  minImp: affiliateMinImpressionsSchema,
  minLift: affiliateMinLiftSchema,
});

const adminAffiliateHubBatchActionSchema = z.object({
  pagePaths: z.array(z.string().trim().min(1).max(260)).min(1).max(200),
  status: z.enum(["TODO", "TESTING", "VERIFIED", "DISMISSED"]),
  note: optionalTrimmed(600),
  window: z.string().trim().optional(),
  tool: z.string().trim().optional(),
  hub: z.string().trim().optional(),
  historyPage: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const text = String(value || "").trim();
      if (!text) {
        return undefined;
      }
      const parsed = Number.parseInt(text, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    })
    .pipe(z.number().int().min(1).max(9999).optional()),
  historyTool: z.string().trim().optional(),
  historyKind: z.enum(["ALL", "IMPRESSION", "CONVERSION"]).optional(),
  actionStatus: z
    .enum(["ALL", "UNVERIFIED", "TODO", "TESTING", "VERIFIED", "DISMISSED"])
    .optional(),
  actionSort: z.enum(["UPDATED_DESC", "UPDATED_ASC"]).optional(),
  minImp: affiliateMinImpressionsSchema,
  minLift: affiliateMinLiftSchema,
});

export function parseSubmissionForm(formData: FormData) {
  return submissionSchema.safeParse({
    contactEmail: toStringValue(formData, "contactEmail"),
    toolName: toStringValue(formData, "toolName"),
    websiteUrl: toStringValue(formData, "websiteUrl"),
    companyName: toStringValue(formData, "companyName"),
    message: toStringValue(formData, "message"),
  });
}

export function parseAdminLoginForm(formData: FormData) {
  return adminLoginSchema.safeParse({
    email: toStringValue(formData, "email"),
    password: toStringValue(formData, "password"),
  });
}

export function parseAdminToolCreateForm(formData: FormData) {
  return adminToolCreateSchema.safeParse({
    name: toStringValue(formData, "name"),
    slug: toStringValue(formData, "slug"),
    websiteUrl: toStringValue(formData, "websiteUrl"),
    tagline: toStringValue(formData, "tagline"),
    description: toStringValue(formData, "description"),
    status: toStringValue(formData, "status"),
    setupMinutes: toStringValue(formData, "setupMinutes"),
    pricingFrom: toStringValue(formData, "pricingFrom"),
    currency: toStringValue(formData, "currency"),
    categories: toStringValue(formData, "categories"),
    trackingUrl: toStringValue(formData, "trackingUrl"),
    linkKind: toStringValue(formData, "linkKind"),
    currentStatusFilter: toStringValue(formData, "currentStatusFilter"),
  });
}

export function parseAdminToolUpdateForm(formData: FormData) {
  return adminToolUpdateSchema.safeParse({
    currentSlug: toStringValue(formData, "currentSlug"),
    name: toStringValue(formData, "name"),
    slug: toStringValue(formData, "slug"),
    websiteUrl: toStringValue(formData, "websiteUrl"),
    tagline: toStringValue(formData, "tagline"),
    description: toStringValue(formData, "description"),
    status: toStringValue(formData, "status"),
    setupMinutes: toStringValue(formData, "setupMinutes"),
    pricingFrom: toStringValue(formData, "pricingFrom"),
    currency: toStringValue(formData, "currency"),
    categories: toStringValue(formData, "categories"),
    trackingUrl: toStringValue(formData, "trackingUrl"),
    linkKind: toStringValue(formData, "linkKind"),
    currentStatusFilter: toStringValue(formData, "currentStatusFilter"),
  });
}

export function parseAdminCategoryForm(formData: FormData) {
  return adminCategorySchema.safeParse({
    name: toStringValue(formData, "name"),
    slug: toStringValue(formData, "slug"),
    description: toStringValue(formData, "description"),
  });
}

export function parseAdminCategoryDeleteForm(formData: FormData) {
  return adminCategoryDeleteSchema.safeParse({
    slug: toStringValue(formData, "slug"),
  });
}

export function parseAdminToolStatusForm(formData: FormData) {
  return adminToolStatusSchema.safeParse({
    slug: toStringValue(formData, "slug"),
    nextStatus: toStringValue(formData, "nextStatus"),
    currentStatusFilter: toStringValue(formData, "currentStatusFilter"),
  });
}

export function parseAdminToolDeleteForm(formData: FormData) {
  return adminToolSlugSchema.safeParse({
    slug: toStringValue(formData, "slug"),
    currentStatusFilter: toStringValue(formData, "currentStatusFilter"),
  });
}

export function parseAdminToolPublishForm(formData: FormData) {
  return adminToolSlugSchema.safeParse({
    slug: toStringValue(formData, "slug"),
    currentStatusFilter: toStringValue(formData, "currentStatusFilter"),
  });
}

export function parseAdminSubmissionStatusForm(formData: FormData) {
  return adminSubmissionStatusSchema.safeParse({
    submissionId: toStringValue(formData, "submissionId"),
    status: toStringValue(formData, "status"),
  });
}

export function parseAdminSubmissionConvertForm(formData: FormData) {
  return adminSubmissionConvertSchema.safeParse({
    submissionId: toStringValue(formData, "submissionId"),
  });
}

export function parseAdminAffiliateBackfillForm(formData: FormData) {
  const actionStatus = toStringValue(formData, "actionStatus").trim();
  const actionSort = toStringValue(formData, "actionSort").trim();
  return adminAffiliateBackfillSchema.safeParse({
    toolSlug: toStringValue(formData, "toolSlug"),
    metricKind: toStringValue(formData, "metricKind"),
    count: toStringValue(formData, "count"),
    note: toStringValue(formData, "note"),
    window: toStringValue(formData, "window"),
    hub: toStringValue(formData, "hub"),
    actionStatus:
      actionStatus === "ALL" ||
      actionStatus === "UNVERIFIED" ||
      actionStatus === "TODO" ||
      actionStatus === "TESTING" ||
      actionStatus === "VERIFIED" ||
      actionStatus === "DISMISSED"
        ? actionStatus
        : undefined,
    actionSort:
      actionSort === "UPDATED_DESC" || actionSort === "UPDATED_ASC"
        ? actionSort
        : undefined,
    minImp: toStringValue(formData, "minImp"),
    minLift: toStringValue(formData, "minLift"),
  });
}

export function parseAdminAffiliateBackfillDeleteForm(formData: FormData) {
  const historyKind = toStringValue(formData, "historyKind").trim();
  const actionStatus = toStringValue(formData, "actionStatus").trim();
  const actionSort = toStringValue(formData, "actionSort").trim();
  return adminAffiliateBackfillDeleteSchema.safeParse({
    entryId: toStringValue(formData, "entryId"),
    window: toStringValue(formData, "window"),
    tool: toStringValue(formData, "tool"),
    hub: toStringValue(formData, "hub"),
    historyPage: toStringValue(formData, "historyPage"),
    historyTool: toStringValue(formData, "historyTool"),
    historyKind:
      historyKind === "ALL" || historyKind === "IMPRESSION" || historyKind === "CONVERSION"
        ? historyKind
        : undefined,
    actionStatus:
      actionStatus === "ALL" ||
      actionStatus === "UNVERIFIED" ||
      actionStatus === "TODO" ||
      actionStatus === "TESTING" ||
      actionStatus === "VERIFIED" ||
      actionStatus === "DISMISSED"
        ? actionStatus
        : undefined,
    actionSort:
      actionSort === "UPDATED_DESC" || actionSort === "UPDATED_ASC"
        ? actionSort
        : undefined,
    minImp: toStringValue(formData, "minImp"),
    minLift: toStringValue(formData, "minLift"),
  });
}

export function parseAdminAffiliateBackfillCorrectForm(formData: FormData) {
  const historyKind = toStringValue(formData, "historyKind").trim();
  const actionStatus = toStringValue(formData, "actionStatus").trim();
  const actionSort = toStringValue(formData, "actionSort").trim();
  return adminAffiliateBackfillCorrectSchema.safeParse({
    entryId: toStringValue(formData, "entryId"),
    toolSlug: toStringValue(formData, "toolSlug"),
    metricKind: toStringValue(formData, "metricKind"),
    count: toStringValue(formData, "count"),
    note: toStringValue(formData, "note"),
    window: toStringValue(formData, "window"),
    tool: toStringValue(formData, "tool"),
    hub: toStringValue(formData, "hub"),
    historyPage: toStringValue(formData, "historyPage"),
    historyTool: toStringValue(formData, "historyTool"),
    historyKind:
      historyKind === "ALL" || historyKind === "IMPRESSION" || historyKind === "CONVERSION"
        ? historyKind
        : undefined,
    actionStatus:
      actionStatus === "ALL" ||
      actionStatus === "UNVERIFIED" ||
      actionStatus === "TODO" ||
      actionStatus === "TESTING" ||
      actionStatus === "VERIFIED" ||
      actionStatus === "DISMISSED"
        ? actionStatus
        : undefined,
    actionSort:
      actionSort === "UPDATED_DESC" || actionSort === "UPDATED_ASC"
        ? actionSort
        : undefined,
    minImp: toStringValue(formData, "minImp"),
    minLift: toStringValue(formData, "minLift"),
  });
}

export function parseAdminAffiliateHubActionForm(formData: FormData) {
  const historyKind = toStringValue(formData, "historyKind").trim();
  const actionStatus = toStringValue(formData, "actionStatus").trim();
  const actionSort = toStringValue(formData, "actionSort").trim();
  return adminAffiliateHubActionSchema.safeParse({
    pagePath: toStringValue(formData, "pagePath"),
    status: toStringValue(formData, "status"),
    note: toStringValue(formData, "note"),
    window: toStringValue(formData, "window"),
    tool: toStringValue(formData, "tool"),
    hub: toStringValue(formData, "hub"),
    historyPage: toStringValue(formData, "historyPage"),
    historyTool: toStringValue(formData, "historyTool"),
    historyKind:
      historyKind === "ALL" || historyKind === "IMPRESSION" || historyKind === "CONVERSION"
        ? historyKind
        : undefined,
    actionStatus:
      actionStatus === "ALL" ||
      actionStatus === "UNVERIFIED" ||
      actionStatus === "TODO" ||
      actionStatus === "TESTING" ||
      actionStatus === "VERIFIED" ||
      actionStatus === "DISMISSED"
        ? actionStatus
        : undefined,
    actionSort:
      actionSort === "UPDATED_DESC" || actionSort === "UPDATED_ASC"
        ? actionSort
        : undefined,
    minImp: toStringValue(formData, "minImp"),
    minLift: toStringValue(formData, "minLift"),
  });
}

export function parseAdminAffiliateHubBatchActionForm(formData: FormData) {
  const historyKind = toStringValue(formData, "historyKind").trim();
  const actionStatus = toStringValue(formData, "actionStatus").trim();
  const actionSort = toStringValue(formData, "actionSort").trim();
  const pagePaths = formData
    .getAll("pagePaths")
    .map((value) => String(value).trim())
    .filter(Boolean);

  return adminAffiliateHubBatchActionSchema.safeParse({
    pagePaths,
    status: toStringValue(formData, "status"),
    note: toStringValue(formData, "note"),
    window: toStringValue(formData, "window"),
    tool: toStringValue(formData, "tool"),
    hub: toStringValue(formData, "hub"),
    historyPage: toStringValue(formData, "historyPage"),
    historyTool: toStringValue(formData, "historyTool"),
    historyKind:
      historyKind === "ALL" || historyKind === "IMPRESSION" || historyKind === "CONVERSION"
        ? historyKind
        : undefined,
    actionStatus:
      actionStatus === "ALL" ||
      actionStatus === "UNVERIFIED" ||
      actionStatus === "TODO" ||
      actionStatus === "TESTING" ||
      actionStatus === "VERIFIED" ||
      actionStatus === "DISMISSED"
        ? actionStatus
        : undefined,
    actionSort:
      actionSort === "UPDATED_DESC" || actionSort === "UPDATED_ASC"
        ? actionSort
        : undefined,
    minImp: toStringValue(formData, "minImp"),
    minLift: toStringValue(formData, "minLift"),
  });
}
