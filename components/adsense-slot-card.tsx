import { getAdsenseConfig, type AdsenseSlotKey } from "@/lib/monetization-config";

type AdsenseSlotCardProps = {
  className: string;
  labelClassName?: string;
  slotKey: AdsenseSlotKey;
  title: string;
  fallbackBody: string;
  placementLabel?: string;
};

export function AdsenseSlotCard({
  className,
  labelClassName,
  slotKey,
  title,
  fallbackBody,
  placementLabel = "Ad slot",
}: AdsenseSlotCardProps) {
  const adsense = getAdsenseConfig();
  const slotId = adsense.slots[slotKey];
  const isConfigured = adsense.enabled && Boolean(slotId);

  return (
    <article
      className={className}
      data-ui="adsense-slot"
      data-adsense-enabled={isConfigured ? "true" : "false"}
      data-adsense-slot={slotId || "unset"}
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
