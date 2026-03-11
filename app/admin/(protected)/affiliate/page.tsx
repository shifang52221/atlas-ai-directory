import Link from "next/link";
import {
  DEFAULT_LOW_HUB_CTR_MAX_CTR,
  DEFAULT_LOW_HUB_CTR_MIN_IMPRESSIONS,
  DEFAULT_LOW_CVR_MAX_CONVERSION_RATE,
  DEFAULT_LOW_CVR_MIN_OUTBOUND_CLICKS,
  filterAndSortHubActionRecommendations,
  getHubActionStatusCounts,
  getAffiliatePerformanceData,
  type AffiliateManualMetricKind,
  type AffiliateHubActionStatusFilter,
  type AffiliateHubActionSortKey,
} from "@/lib/affiliate-performance";
import styles from "../../admin.module.css";
import {
  correctAffiliateBackfillEntryAction,
  deleteAffiliateBackfillEntryAction,
  recordAffiliateHubBatchStatusAction,
  recordAffiliateHubActionStatusAction,
  recordAffiliateBackfillAction,
} from "./actions";

type WindowKey = "7d" | "30d" | "90d";
type HistoryKindKey = "ALL" | AffiliateManualMetricKind;
type ActionStatusKey = AffiliateHubActionStatusFilter;
type ActionSortKey = AffiliateHubActionSortKey;

type AdminAffiliatePageProps = {
  searchParams: Promise<{
    window?: string;
    tool?: string;
    hub?: string;
    historyPage?: string;
    historyTool?: string;
    historyKind?: string;
    actionStatus?: string;
    actionSort?: string;
    saved?: string;
    deleted?: string;
    corrected?: string;
    hubActionSaved?: string;
    hubActionBatchSaved?: string;
    hubActionBatchCount?: string;
    error?: string;
  }>;
};

function parseWindowKey(value: string | undefined): WindowKey {
  if (value === "30d") {
    return "30d";
  }
  if (value === "90d") {
    return "90d";
  }
  return "7d";
}

function toWindowDays(windowKey: WindowKey): number {
  if (windowKey === "30d") {
    return 30;
  }
  if (windowKey === "90d") {
    return 90;
  }
  return 7;
}

function parseHistoryKindKey(value: string | undefined): HistoryKindKey {
  if (value === "IMPRESSION" || value === "CONVERSION") {
    return value;
  }
  return "ALL";
}

function parseActionStatusKey(value: string | undefined): ActionStatusKey {
  if (
    value === "UNVERIFIED" ||
    value === "TODO" ||
    value === "TESTING" ||
    value === "VERIFIED" ||
    value === "DISMISSED"
  ) {
    return value;
  }
  return "ALL";
}

function parseActionSortKey(value: string | undefined): ActionSortKey {
  if (value === "UPDATED_ASC") {
    return "UPDATED_ASC";
  }
  return "UPDATED_DESC";
}

function parsePositivePage(value: string | undefined): number {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function toPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function toLiftPercent(value: number | null): string {
  if (value === null) {
    return "-";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${(value * 100).toFixed(2)}%`;
}

function toExperimentSignalLabel(
  signal: "B_LEADING" | "A_LEADING" | "NO_SIGNAL",
): string {
  if (signal === "B_LEADING") {
    return "B leading";
  }
  if (signal === "A_LEADING") {
    return "A leading";
  }
  return "No signal";
}

function toPValue(value: number | null): string {
  if (value === null) {
    return "-";
  }
  if (value < 0.0001) {
    return "<0.0001";
  }
  return value.toFixed(4);
}

function toConfidence(value: number | null): string {
  if (value === null) {
    return "-";
  }
  return `${(value * 100).toFixed(2)}%`;
}

function toDecisionLabel(value: "SHIP_B" | "KEEP_A" | "RUN_LONGER"): string {
  if (value === "SHIP_B") {
    return "Ship B";
  }
  if (value === "KEEP_A") {
    return "Keep A";
  }
  return "Run Longer";
}

function toDayLabel(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildAffiliateHref(input: {
  window: WindowKey;
  toolSlug: string | null;
  hubPath?: string | null;
  historyPage?: number;
  historyToolSlug?: string | null;
  historyKind?: HistoryKindKey;
  actionStatus?: ActionStatusKey;
  actionSort?: ActionSortKey;
}): string {
  const params = new URLSearchParams();

  if (input.window !== "7d") {
    params.set("window", input.window);
  }
  if (input.toolSlug) {
    params.set("tool", input.toolSlug);
  }
  if (input.hubPath) {
    params.set("hub", input.hubPath);
  }
  if (input.historyToolSlug) {
    params.set("historyTool", input.historyToolSlug);
  }
  if (input.historyKind && input.historyKind !== "ALL") {
    params.set("historyKind", input.historyKind);
  }
  if (input.actionStatus && input.actionStatus !== "ALL") {
    params.set("actionStatus", input.actionStatus);
  }
  if (input.actionSort && input.actionSort !== "UPDATED_DESC") {
    params.set("actionSort", input.actionSort);
  }
  if (input.historyPage && input.historyPage > 1) {
    params.set("historyPage", String(input.historyPage));
  }

  const query = params.toString();
  return query ? `/admin/affiliate?${query}` : "/admin/affiliate";
}

export default async function AdminAffiliatePage({
  searchParams,
}: AdminAffiliatePageProps) {
  const query = await searchParams;
  const windowKey = parseWindowKey(query.window);
  const windowDays = toWindowDays(windowKey);
  const trendToolSlug = typeof query.tool === "string" ? query.tool.trim() : "";
  const hubPath = typeof query.hub === "string" ? query.hub.trim() : "";
  const historyToolSlug =
    typeof query.historyTool === "string" ? query.historyTool.trim() : "";
  const historyKind = parseHistoryKindKey(query.historyKind);
  const actionStatus = parseActionStatusKey(query.actionStatus);
  const actionSort = parseActionSortKey(query.actionSort);
  const historyPage = parsePositivePage(query.historyPage);

  const data = await getAffiliatePerformanceData({
    windowDays,
    trendToolSlug: trendToolSlug || undefined,
    hubPath: hubPath || undefined,
    historyPage,
    historyPerPage: 12,
    historyToolSlug: historyToolSlug || undefined,
    historyKind: historyKind === "ALL" ? undefined : historyKind,
  });

  const outboundTrendMax = Math.max(
    1,
    ...data.trend.map((item) => item.outboundClicks),
  );
  const conversionTrendMax = Math.max(
    1,
    ...data.trend.map((item) => item.conversions),
  );
  const hubImpressionTrendMax = Math.max(
    1,
    ...data.hubTrend.map((item) => item.impressions),
  );
  const hubOutboundTrendMax = Math.max(
    1,
    ...data.hubTrend.map((item) => item.outboundClicks),
  );
  const flash =
    query.saved === "1"
      ? { type: "success" as const, text: "Manual metric saved." }
      : query.deleted === "1"
        ? { type: "success" as const, text: "Manual metric deleted." }
        : query.corrected === "1"
          ? { type: "success" as const, text: "Manual metric corrected." }
          : query.hubActionSaved === "1"
            ? { type: "success" as const, text: "Hub action status saved." }
            : query.hubActionBatchSaved === "1"
              ? {
                  type: "success" as const,
                  text: `Batch hub action status saved${
                    query.hubActionBatchCount
                      ? ` (${Number.parseInt(query.hubActionBatchCount, 10) || 0} rows)`
                      : ""
                  }.`,
                }
        : query.error
          ? { type: "error" as const, text: `Operation failed (${query.error}).` }
          : null;

  const windowLinks: Array<{ key: WindowKey; label: string }> = [
    { key: "7d", label: "Last 7d" },
    { key: "30d", label: "Last 30d" },
    { key: "90d", label: "Last 90d" },
  ];
  const selectedHubTitle = data.hubTrendPath
    ? data.hubOptions.find((item) => item.path === data.hubTrendPath)?.title ||
      data.hubTrendPath
    : "All hubs";
  const hubActionRecommendations = filterAndSortHubActionRecommendations(
    data.hubActionRecommendations,
    {
      status: actionStatus,
      sortBy: actionSort,
    },
  );
  const hubActionStatusCounts = getHubActionStatusCounts(data.hubActionRecommendations);
  const batchFormId = "hub-action-batch-form";

  return (
    <>
      <section className={styles.panel}>
        <h1>Affiliate Performance</h1>
        <p>
          Track affiliate funnel performance and backfill manual impression or
          conversion counts for optimization loops.
        </p>
        {!data.dbAvailable && (
          <p className={styles.infoNote}>
            Database is currently unavailable. Click metrics are paused; manual
            backfill remains available.
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
          {windowLinks.map((item) => (
            <Link
              key={item.key}
              href={buildAffiliateHref({
                window: item.key,
                toolSlug: data.trendToolSlug,
                hubPath: data.hubTrendPath,
                historyPage: 1,
                historyToolSlug: historyToolSlug || null,
                historyKind,
                actionStatus,
                actionSort,
              })}
              className={`${styles.filterRowLink} ${windowKey === item.key ? styles.filterRowLinkActive : ""}`}
              aria-current={windowKey === item.key ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Impressions</p>
          <span className={styles.statValue}>{data.totals.impressions}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Affiliate Clicks</p>
          <span className={styles.statValue}>{data.totals.affiliateClicks}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Outbound Clicks</p>
          <span className={styles.statValue}>{data.totals.outboundClicks}</span>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Conversions</p>
          <span className={styles.statValue}>{data.totals.conversions}</span>
        </article>
      </section>

      <section className={styles.panel}>
        <h2>Funnel ({windowKey})</h2>
        <p>
          Conversion rate based on outbound clicks:{" "}
          <strong>{toPercent(data.totals.conversionRate)}</strong>
        </p>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.panel}>
          <h2>Outbound vs Conversions Trend ({windowKey})</h2>
          <p>
            Scope:{" "}
            <strong>
              {data.trendToolSlug
                ? data.toolOptions.find((tool) => tool.slug === data.trendToolSlug)?.name ||
                  data.trendToolSlug
                : "All tools"}
            </strong>
          </p>
          <div className={styles.filterRow}>
            <Link
              href={buildAffiliateHref({
                window: windowKey,
                toolSlug: null,
                hubPath: data.hubTrendPath,
                historyPage: 1,
                historyToolSlug: historyToolSlug || null,
                historyKind,
                actionStatus,
                actionSort,
              })}
              className={`${styles.filterRowLink} ${!data.trendToolSlug ? styles.filterRowLinkActive : ""}`}
              aria-current={!data.trendToolSlug ? "page" : undefined}
            >
              All tools
            </Link>
            {data.rows.slice(0, 12).map((row) => (
              <Link
                key={row.toolSlug}
                href={buildAffiliateHref({
                  window: windowKey,
                  toolSlug: row.toolSlug,
                  hubPath: data.hubTrendPath,
                  historyPage: 1,
                  historyToolSlug: historyToolSlug || null,
                  historyKind,
                  actionStatus,
                  actionSort,
                })}
                className={`${styles.filterRowLink} ${data.trendToolSlug === row.toolSlug ? styles.filterRowLinkActive : ""}`}
                aria-current={data.trendToolSlug === row.toolSlug ? "page" : undefined}
              >
                {row.toolName}
              </Link>
            ))}
          </div>
          {data.trend.length === 0 ? (
            <p>No trend data yet.</p>
          ) : (
            <div className={styles.trendGrid}>
              {data.trend.map((point) => (
                <div className={styles.trendItem} key={point.dayKey}>
                  <div className={styles.trendDual}>
                    <div
                      className={`${styles.trendBar} ${styles.trendBarOutbound}`}
                      style={{
                        height: `${Math.max(
                          10,
                          (point.outboundClicks / outboundTrendMax) * 120,
                        )}px`,
                      }}
                    />
                    <div
                      className={`${styles.trendBar} ${styles.trendBarConversion}`}
                      style={{
                        height: `${Math.max(
                          10,
                          (point.conversions / conversionTrendMax) * 120,
                        )}px`,
                      }}
                    />
                  </div>
                  <span className={styles.trendCount}>
                    {point.outboundClicks} / {point.conversions}
                  </span>
                  <span className={styles.trendLabel}>{toDayLabel(point.dayKey)}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={styles.panel}>
          <h2>Top Converters ({windowKey})</h2>
          {data.topConverters.length === 0 ? (
            <p>No conversion data yet.</p>
          ) : (
            <ul className={styles.rankList}>
              {data.topConverters.map((row) => (
                <li key={row.toolSlug}>
                  <span>{row.toolName}</span>
                  <strong>
                    {row.conversions} ({toPercent(row.conversionRate)})
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={styles.panel}>
          <h2>Low CVR Candidates ({windowKey})</h2>
          <p>
            Threshold: outbound clicks {"\u2265"}{" "}
            <strong>{DEFAULT_LOW_CVR_MIN_OUTBOUND_CLICKS}</strong>, CVR {"\u2264"}{" "}
            <strong>{toPercent(DEFAULT_LOW_CVR_MAX_CONVERSION_RATE)}</strong>
          </p>
          {data.lowCvrCandidates.length === 0 ? (
            <p>No low-CVR candidates found in current window.</p>
          ) : (
            <ul className={styles.rankList}>
              {data.lowCvrCandidates.map((row) => (
                <li key={row.toolSlug}>
                  <span>{row.toolName}</span>
                  <strong>
                    {row.outboundClicks} / {toPercent(row.conversionRate)}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className={styles.panel}>
        <h2>Editorial Hub CTR ({windowKey})</h2>
        <p>
          CTR = outbound clicks / tracked hub impressions. Impression events are
          session-capped in browser storage to reduce duplicate refresh noise.
        </p>
        <p>
          Scope: <strong>{selectedHubTitle}</strong>
        </p>
        <div className={styles.filterRow}>
          <Link
            href={buildAffiliateHref({
              window: windowKey,
              toolSlug: data.trendToolSlug,
              hubPath: null,
              historyPage: 1,
              historyToolSlug: historyToolSlug || null,
              historyKind,
              actionStatus,
              actionSort,
            })}
            className={`${styles.filterRowLink} ${!data.hubTrendPath ? styles.filterRowLinkActive : ""}`}
            aria-current={!data.hubTrendPath ? "page" : undefined}
          >
            All hubs
          </Link>
          {data.hubOptions.map((item) => (
            <Link
              key={item.path}
              href={buildAffiliateHref({
                window: windowKey,
                toolSlug: data.trendToolSlug,
                hubPath: item.path,
                historyPage: 1,
                historyToolSlug: historyToolSlug || null,
                historyKind,
                actionStatus,
                actionSort,
              })}
              className={`${styles.filterRowLink} ${data.hubTrendPath === item.path ? styles.filterRowLinkActive : ""}`}
              aria-current={data.hubTrendPath === item.path ? "page" : undefined}
            >
              {item.title}
            </Link>
          ))}
        </div>
        <h3>Hub Impressions vs Outbound Trend ({windowKey})</h3>
        {data.hubTrend.length === 0 ? (
          <p>No hub trend data yet.</p>
        ) : (
          <div className={styles.trendGrid}>
            {data.hubTrend.map((point) => (
              <div className={styles.trendItem} key={`hub-${point.dayKey}`}>
                <div className={styles.trendDual}>
                  <div
                    className={`${styles.trendBar} ${styles.trendBarOutbound}`}
                    style={{
                      height: `${Math.max(
                        10,
                        (point.impressions / hubImpressionTrendMax) * 120,
                      )}px`,
                    }}
                  />
                  <div
                    className={`${styles.trendBar} ${styles.trendBarConversion}`}
                    style={{
                      height: `${Math.max(
                        10,
                        (point.outboundClicks / hubOutboundTrendMax) * 120,
                      )}px`,
                    }}
                  />
                </div>
                <span className={styles.trendCount}>
                  {point.impressions} / {point.outboundClicks}
                </span>
                <span className={styles.trendLabel}>{toDayLabel(point.dayKey)}</span>
              </div>
            ))}
          </div>
        )}
        <h3>Low CTR Alerts ({windowKey})</h3>
        <p>
          Threshold: impressions {"\u2265"}{" "}
          <strong>{DEFAULT_LOW_HUB_CTR_MIN_IMPRESSIONS}</strong>, CTR {"\u2264"}{" "}
          <strong>{toPercent(DEFAULT_LOW_HUB_CTR_MAX_CTR)}</strong>
        </p>
        {data.lowHubCtrCandidates.length === 0 ? (
          <p>No low-CTR hub alerts in current window.</p>
        ) : (
          <ul className={styles.rankList}>
            {data.lowHubCtrCandidates.map((row) => (
              <li key={`low-${row.pagePath}`}>
                <span>{row.pageTitle}</span>
                <strong>
                  {row.outboundClicks} / {toPercent(row.ctr)}
                </strong>
              </li>
            ))}
          </ul>
        )}
        <h3>Hub Experiment CTR (A/B)</h3>
        <p>
          Variant traffic is tracked from hub URLs using <code>?variant=a|b</code>.
          Legacy events without variant metadata are counted as A.
        </p>
        <h3>Experiment Decision Cards</h3>
        {data.hubExperimentConclusions.length === 0 ? (
          <p>No experiment conclusions yet.</p>
        ) : (
          <ul className={styles.rankList}>
            {data.hubExperimentConclusions.map((item) => (
              <li key={`decision-${item.pagePath}`}>
                <span>
                  {item.pageTitle}: {item.reason}
                </span>
                <strong>{toDecisionLabel(item.decision)}</strong>
              </li>
            ))}
          </ul>
        )}
        {data.hubExperimentRows.length === 0 ? (
          <p>No experiment data yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>A Impr</th>
                  <th>A Outbound</th>
                  <th>A CTR</th>
                  <th>B Impr</th>
                  <th>B Outbound</th>
                  <th>B CTR</th>
                  <th>Lift (B vs A)</th>
                  <th>P-value</th>
                  <th>Confidence</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {data.hubExperimentRows.map((row) => (
                  <tr key={`experiment-${row.pagePath}`}>
                    <td>{row.pageTitle}</td>
                    <td>{row.impressionsA}</td>
                    <td>{row.outboundClicksA}</td>
                    <td>{toPercent(row.ctrA)}</td>
                    <td>{row.impressionsB}</td>
                    <td>{row.outboundClicksB}</td>
                    <td>{toPercent(row.ctrB)}</td>
                    <td>{toLiftPercent(row.liftBvsA)}</td>
                    <td>{toPValue(row.pValue)}</td>
                    <td>{toConfidence(row.confidence)}</td>
                    <td>{toExperimentSignalLabel(row.signal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h3>Recommended Actions ({windowKey})</h3>
        <form method="get" className={styles.filterSearchForm}>
          <input type="hidden" name="window" value={windowKey} />
          {data.trendToolSlug && <input type="hidden" name="tool" value={data.trendToolSlug} />}
          {data.hubTrendPath && <input type="hidden" name="hub" value={data.hubTrendPath} />}
          {historyToolSlug && <input type="hidden" name="historyTool" value={historyToolSlug} />}
          <input type="hidden" name="historyKind" value={historyKind} />
          <input type="hidden" name="historyPage" value={String(data.manualHistory.page)} />
          <label htmlFor="action-status">Status</label>
          <select id="action-status" name="actionStatus" defaultValue={actionStatus}>
            <option value="ALL">All statuses</option>
            <option value="UNVERIFIED">UNVERIFIED (TODO+TESTING)</option>
            <option value="TODO">TODO</option>
            <option value="TESTING">TESTING</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
          <label htmlFor="action-sort">Sort</label>
          <select id="action-sort" name="actionSort" defaultValue={actionSort}>
            <option value="UPDATED_DESC">Recently updated</option>
            <option value="UPDATED_ASC">Oldest updated</option>
          </select>
          <button type="submit">Apply</button>
        </form>
        <div className={styles.filterRow}>
          {(
            [
              ["ALL", `All (${hubActionStatusCounts.ALL})`],
              ["UNVERIFIED", `Unverified (${hubActionStatusCounts.UNVERIFIED})`],
              ["TODO", `TODO (${hubActionStatusCounts.TODO})`],
              ["TESTING", `TESTING (${hubActionStatusCounts.TESTING})`],
              ["VERIFIED", `VERIFIED (${hubActionStatusCounts.VERIFIED})`],
              ["DISMISSED", `DISMISSED (${hubActionStatusCounts.DISMISSED})`],
            ] as const
          ).map(([statusKey, label]) => (
            <Link
              key={statusKey}
              href={buildAffiliateHref({
                window: windowKey,
                toolSlug: data.trendToolSlug,
                hubPath: data.hubTrendPath,
                historyPage: data.manualHistory.page,
                historyToolSlug: historyToolSlug || null,
                historyKind,
                actionStatus: statusKey,
                actionSort,
              })}
              className={`${styles.filterRowLink} ${actionStatus === statusKey ? styles.filterRowLinkActive : ""}`}
              aria-current={actionStatus === statusKey ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </div>
        {hubActionRecommendations.length > 0 && (
          <form
            id={batchFormId}
            action={recordAffiliateHubBatchStatusAction}
            className={styles.filterSearchForm}
          >
            <input type="hidden" name="window" value={windowKey} />
            {data.trendToolSlug && <input type="hidden" name="tool" value={data.trendToolSlug} />}
            {data.hubTrendPath && <input type="hidden" name="hub" value={data.hubTrendPath} />}
            {historyToolSlug && <input type="hidden" name="historyTool" value={historyToolSlug} />}
            <input type="hidden" name="historyKind" value={historyKind} />
            <input type="hidden" name="historyPage" value={String(data.manualHistory.page)} />
            <input type="hidden" name="actionStatus" value={actionStatus} />
            <input type="hidden" name="actionSort" value={actionSort} />
            <label htmlFor="batch-status">Batch status</label>
            <select id="batch-status" name="status" defaultValue="TESTING" aria-label="Batch status">
              <option value="TODO">TODO</option>
              <option value="TESTING">TESTING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
            <label htmlFor="batch-note">Batch note</label>
            <input
              id="batch-note"
              name="note"
              placeholder="Applied to selected actions"
              aria-label="Batch note"
            />
            <button type="submit">Apply Batch Status</button>
          </form>
        )}
        {hubActionRecommendations.length === 0 ? (
          <p>No action recommendations yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Hub</th>
                  <th>Priority</th>
                  <th>Expected Lift</th>
                  <th>Recommendation</th>
                  <th>Suggested Tool Mix</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hubActionRecommendations.map((item) => (
                  <tr key={`action-${item.pagePath}`}>
                    <td>
                      <input
                        form={batchFormId}
                        type="checkbox"
                        name="pagePaths"
                        value={item.pagePath}
                        aria-label={`Select action ${item.pagePath}`}
                      />
                    </td>
                    <td>{item.pageTitle}</td>
                    <td>{item.priority}</td>
                    <td>{item.expectedLiftRange}</td>
                    <td>{item.recommendation}</td>
                    <td>{item.suggestedToolNames.join(", ") || "-"}</td>
                    <td>
                      <form action={recordAffiliateHubActionStatusAction} className={styles.rowActions}>
                        <input type="hidden" name="pagePath" value={item.pagePath} />
                        <input type="hidden" name="window" value={windowKey} />
                        {data.trendToolSlug && (
                          <input type="hidden" name="tool" value={data.trendToolSlug} />
                        )}
                        {data.hubTrendPath && (
                          <input type="hidden" name="hub" value={data.hubTrendPath} />
                        )}
                        {historyToolSlug && (
                          <input type="hidden" name="historyTool" value={historyToolSlug} />
                        )}
                        <input
                          type="hidden"
                          name="historyPage"
                          value={String(data.manualHistory.page)}
                        />
                        <input type="hidden" name="historyKind" value={historyKind} />
                        <input type="hidden" name="actionStatus" value={actionStatus} />
                        <input type="hidden" name="actionSort" value={actionSort} />
                        <select name="status" defaultValue={item.executionStatus}>
                          <option value="TODO">TODO</option>
                          <option value="TESTING">TESTING</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="DISMISSED">DISMISSED</option>
                        </select>
                        <input
                          name="note"
                          defaultValue={item.executionNote || ""}
                          placeholder="Execution note"
                          aria-label={`Action note ${item.pagePath}`}
                        />
                        <button type="submit">Save</button>
                      </form>
                      <p className={styles.inlineNote}>
                        Current: {item.executionStatus}
                        {item.executionUpdatedAt
                          ? ` (${new Date(item.executionUpdatedAt).toISOString().replace("T", " ").slice(0, 19)} UTC)`
                          : ""}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.hubCtrRows.length === 0 ? (
          <p>No editorial hub rows available.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hub</th>
                  <th>Impressions</th>
                  <th>Outbound Clicks</th>
                  <th>CTR</th>
                  <th>Top Clicked Tool</th>
                </tr>
              </thead>
              <tbody>
                {data.hubCtrRows.map((row) => (
                  <tr key={row.pagePath}>
                    <td>
                      <Link href={row.pagePath}>{row.pageTitle}</Link>
                    </td>
                    <td>{row.impressions}</td>
                    <td>{row.outboundClicks}</td>
                    <td>{toPercent(row.ctr)}</td>
                    <td>{row.topToolName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Manual Backfill</h2>
        <form action={recordAffiliateBackfillAction} className={styles.formGrid}>
          <input type="hidden" name="window" value={windowKey} />
          {data.hubTrendPath && <input type="hidden" name="hub" value={data.hubTrendPath} />}
          <input type="hidden" name="actionStatus" value={actionStatus} />
          <input type="hidden" name="actionSort" value={actionSort} />
          <div className={styles.field}>
            <label htmlFor="affiliate-tool">Tool</label>
            <select id="affiliate-tool" name="toolSlug" required>
              {data.toolOptions.map((tool) => (
                <option key={tool.slug} value={tool.slug}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="affiliate-metric-kind">Metric</label>
            <select id="affiliate-metric-kind" name="metricKind" defaultValue="CONVERSION">
              <option value="CONVERSION">CONVERSION</option>
              <option value="IMPRESSION">IMPRESSION</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="affiliate-count">Count</label>
            <input
              id="affiliate-count"
              name="count"
              type="number"
              min="1"
              max="100000"
              defaultValue="1"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="affiliate-note">Note</label>
            <input id="affiliate-note" name="note" placeholder="Network report batch #1" />
          </div>
          <div className={styles.formActions}>
            <button type="submit">Save Backfill</button>
          </div>
        </form>
      </section>

      <section className={styles.panel}>
        <h2>Manual Backfill History</h2>
        <form method="get" className={styles.filterSearchForm}>
          <input type="hidden" name="window" value={windowKey} />
          {data.trendToolSlug && <input type="hidden" name="tool" value={data.trendToolSlug} />}
          {data.hubTrendPath && <input type="hidden" name="hub" value={data.hubTrendPath} />}
          <input type="hidden" name="actionStatus" value={actionStatus} />
          <input type="hidden" name="actionSort" value={actionSort} />
          <label htmlFor="history-tool">Tool</label>
          <select
            id="history-tool"
            name="historyTool"
            defaultValue={historyToolSlug || ""}
            aria-label="History tool"
          >
            <option value="">All tools</option>
            {data.toolOptions.map((tool) => (
              <option key={tool.slug} value={tool.slug}>
                {tool.name}
              </option>
            ))}
          </select>
          <label htmlFor="history-kind">Metric</label>
          <select
            id="history-kind"
            name="historyKind"
            defaultValue={historyKind}
            aria-label="History metric"
          >
            <option value="ALL">All metrics</option>
            <option value="CONVERSION">CONVERSION</option>
            <option value="IMPRESSION">IMPRESSION</option>
          </select>
          <button type="submit">Apply</button>
        </form>
        <p className={styles.inlineNote}>
          Showing {data.manualHistory.items.length} of {data.manualHistory.total} entries.
        </p>
        {data.manualHistory.items.length === 0 ? (
          <p>No manual backfill entries in this window.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Tool</th>
                  <th>Metric</th>
                  <th>Count</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.manualHistory.items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.timestamp).toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td>{item.toolSlug}</td>
                    <td>{item.kind}</td>
                    <td>{item.count}</td>
                    <td>{item.note || "-"}</td>
                    <td className={styles.rowActions}>
                      <form action={correctAffiliateBackfillEntryAction}>
                        <input type="hidden" name="entryId" value={item.id} />
                        <input type="hidden" name="window" value={windowKey} />
                        {data.trendToolSlug && (
                          <input type="hidden" name="tool" value={data.trendToolSlug} />
                        )}
                        {data.hubTrendPath && (
                          <input type="hidden" name="hub" value={data.hubTrendPath} />
                        )}
                        {historyToolSlug && (
                          <input type="hidden" name="historyTool" value={historyToolSlug} />
                        )}
                        <input
                          type="hidden"
                          name="historyPage"
                          value={String(data.manualHistory.page)}
                        />
                        <input type="hidden" name="historyKind" value={historyKind} />
                        <input type="hidden" name="actionStatus" value={actionStatus} />
                        <input type="hidden" name="actionSort" value={actionSort} />
                        <input type="hidden" name="toolSlug" value={item.toolSlug} />
                        <input type="hidden" name="metricKind" value={item.kind} />
                        <input
                          name="count"
                          type="number"
                          min="1"
                          max="100000"
                          defaultValue={item.count}
                          aria-label={`Correct count ${item.id}`}
                        />
                        <input
                          name="note"
                          defaultValue={item.note || ""}
                          placeholder="Correction note"
                          aria-label={`Correct note ${item.id}`}
                        />
                        <button type="submit">Correct</button>
                      </form>

                      <form action={deleteAffiliateBackfillEntryAction}>
                        <input type="hidden" name="entryId" value={item.id} />
                        <input type="hidden" name="window" value={windowKey} />
                        {data.trendToolSlug && (
                          <input type="hidden" name="tool" value={data.trendToolSlug} />
                        )}
                        {data.hubTrendPath && (
                          <input type="hidden" name="hub" value={data.hubTrendPath} />
                        )}
                        {historyToolSlug && (
                          <input type="hidden" name="historyTool" value={historyToolSlug} />
                        )}
                        <input
                          type="hidden"
                          name="historyPage"
                          value={String(data.manualHistory.page)}
                        />
                        <input type="hidden" name="historyKind" value={historyKind} />
                        <input type="hidden" name="actionStatus" value={actionStatus} />
                        <input type="hidden" name="actionSort" value={actionSort} />
                        <button type="submit">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.manualHistory.totalPages > 1 && (
          <div className={styles.filterRow}>
            {data.manualHistory.page > 1 && (
              <Link
                className={styles.filterRowLink}
                href={buildAffiliateHref({
                  window: windowKey,
                  toolSlug: data.trendToolSlug,
                  hubPath: data.hubTrendPath,
                  historyPage: data.manualHistory.page - 1,
                  historyToolSlug: historyToolSlug || null,
                  historyKind,
                  actionStatus,
                  actionSort,
                })}
              >
                Previous
              </Link>
            )}
            <span className={styles.inlineNote}>
              Page {data.manualHistory.page} / {data.manualHistory.totalPages}
            </span>
            {data.manualHistory.page < data.manualHistory.totalPages && (
              <Link
                className={styles.filterRowLink}
                href={buildAffiliateHref({
                  window: windowKey,
                  toolSlug: data.trendToolSlug,
                  hubPath: data.hubTrendPath,
                  historyPage: data.manualHistory.page + 1,
                  historyToolSlug: historyToolSlug || null,
                  historyKind,
                  actionStatus,
                  actionSort,
                })}
              >
                Next
              </Link>
            )}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2>Tools ({windowDays}d)</h2>
        {data.rows.length === 0 ? (
          <p>No affiliate tool data yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Impressions</th>
                  <th>Affiliate Clicks</th>
                  <th>Outbound Clicks</th>
                  <th>Conversions</th>
                  <th>CVR</th>
                  <th>Primary Link</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 120).map((row) => (
                  <tr key={row.toolSlug}>
                    <td>{row.toolName}</td>
                    <td>{row.impressions}</td>
                    <td>{row.affiliateClicks}</td>
                    <td>{row.outboundClicks}</td>
                    <td>{row.conversions}</td>
                    <td>{toPercent(row.conversionRate)}</td>
                    <td>{row.hasPrimaryLink ? "Yes" : "No"}</td>
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
