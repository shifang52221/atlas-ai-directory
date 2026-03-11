export type AdsenseSlotKey =
  | "toolDetailPrimary"
  | "toolDetailSecondary"
  | "useCaseSidebar";

type AdsenseConfig = {
  client: string;
  enabled: boolean;
  slots: Record<AdsenseSlotKey, string>;
};

type AffiliateTemplate = {
  refParam: string;
  refValue: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

function readAffiliateTemplate(): AffiliateTemplate {
  return {
    refParam: process.env.AFFILIATE_REF_PARAM?.trim() || "ref",
    refValue: process.env.AFFILIATE_REF_VALUE?.trim() || "atlas",
    utmSource: process.env.AFFILIATE_UTM_SOURCE?.trim() || "atlas_directory",
    utmMedium: process.env.AFFILIATE_UTM_MEDIUM?.trim() || "affiliate",
    utmCampaign: process.env.AFFILIATE_UTM_CAMPAIGN?.trim() || "tool_profile",
  };
}

export function getAdsenseConfig(): AdsenseConfig {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const slots: Record<AdsenseSlotKey, string> = {
    toolDetailPrimary:
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_DETAIL_PRIMARY?.trim() || "",
    toolDetailSecondary:
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_DETAIL_SECONDARY?.trim() || "",
    useCaseSidebar:
      process.env.NEXT_PUBLIC_ADSENSE_SLOT_USE_CASE_SIDEBAR?.trim() || "",
  };

  return {
    client,
    enabled: Boolean(client),
    slots,
  };
}

export function applyAffiliateTemplate(
  targetUrl: string,
  template: AffiliateTemplate,
): string {
  try {
    const parsed = new URL(targetUrl);

    if (template.refParam && template.refValue) {
      parsed.searchParams.set(template.refParam, template.refValue);
    }
    if (template.utmSource) {
      parsed.searchParams.set("utm_source", template.utmSource);
    }
    if (template.utmMedium) {
      parsed.searchParams.set("utm_medium", template.utmMedium);
    }
    if (template.utmCampaign) {
      parsed.searchParams.set("utm_campaign", template.utmCampaign);
    }

    return parsed.toString();
  } catch {
    return targetUrl;
  }
}

export function withAffiliateTracking(targetUrl: string): string {
  return applyAffiliateTemplate(targetUrl, readAffiliateTemplate());
}
