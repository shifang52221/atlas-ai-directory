import { getAdsenseConfig, type AdsenseSlotKey } from "@/lib/monetization-config";
import { isAdsPathAllowed } from "@/lib/adsense-policy";

type AdsenseSlotCardProps = {
  className: string;
  labelClassName?: string;
  slotKey: AdsenseSlotKey;
  pagePath: string;
  title: string;
  fallbackBody: string;
  placementLabel?: string;
  isEligible?: boolean;
};

export function AdsenseSlotCard({
  className,
  labelClassName,
  slotKey,
  pagePath,
  title,
  fallbackBody,
  placementLabel = "Ad slot",
  isEligible = true,
}: AdsenseSlotCardProps) {
  const adsense = getAdsenseConfig();
  const slotId = adsense.slots[slotKey];
  const pathAllowed = isAdsPathAllowed(pagePath);
  const isConfigured = adsense.enabled && Boolean(slotId) && pathAllowed && isEligible;

  return (
    <article
      className={className}
      data-ui="adsense-slot"
      data-adsense-enabled={isConfigured ? "true" : "false"}
      data-adsense-slot={slotId || "unset"}
      data-adsense-path-allowed={pathAllowed ? "true" : "false"}
      data-adsense-eligible={isEligible ? "true" : "false"}
    >
      <p className={labelClassName}>{placementLabel}</p>
      <h2>{title}</h2>
      {isConfigured ? (
        <p>
          AdSense configured with client {adsense.client} and slot {slotId}.
        </p>
      ) : (
        <p>{fallbackBody}</p>
      )}
    </article>
  );
}
