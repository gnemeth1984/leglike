"use client";

/**
 * SEO Autopilot tab.
 *
 * Shows the three loops and lets an admin run any of them on demand:
 *   Harvest keywords  → free research (Google Suggest + Search Console)
 *   Publish article   → writes the next highest-scoring query
 *   Refresh           → improves whatever ranks 4-20
 *   Submit sitemap     → nudges Google to re-read /sitemap.xml after new pages
 *                       ship, and pings IndexNow for Bing/Yandex
 *
 * Deliberately shows the setup state up front: without Search Console connected
 * the system still publishes, but it's blind to rankings, and pretending
 * otherwise would be worse than saying so.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Search,
  Sparkles,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  LineChart,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoTrendChart, type TrendPoint, type Delta } from "@/components/admin/seo-trend-chart";
import { AiVisibilityPanel } from "@/components/admin/ai-visibility-panel";
import { Dumbbell, HeartPulse } from "lucide-react";

type QueueRow = {
  id: string;
  keyword: string;
  cluster: string;
  intent: string;
  priority: number;
  impressions: number;
  clicks: number;
  position: number | null;
  source: string;
};

type StrikingRow = {
  id: string;
  keyword: string;
  position: number | null;
  impressions: number;
  clicks: number;
  status: string;
};

type RunRow = { id: string; task: string; ok: boolean; detail: string; createdAt: string };

type SeoData = {
  config: { searchConsole: boolean; indexNow: boolean; openai: boolean; cronSecret: boolean };
  counts: {
    totalKeywords: number;
    queued: number;
    written: number;
    skipped: number;
    posts: number;
    withKeyword: number;
    refreshed: number;
  };
  topQueue: QueueRow[];
  striking: StrikingRow[];
  clusters: { cluster: string; count: number }[];
  runs: RunRow[];
  recentPosts: {
    slug: string;
    title: string;
    keyword: string | null;
    wordCount: number | null;
    refreshCount: number;
    createdAt: string;
  }[];
  trend: TrendPoint[];
  deltas: { week: Delta; month: Delta };
};

const INTENT_STYLE: Record<string, string> = {
  transactional: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  commercial: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  local: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  informational: "bg-neutral-800 text-neutral-400 border-neutral-700",
};

export function SeoTab() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(task: "keywords" | "publish" | "refresh" | "metrics" | "sitemap") {
    const endpoint =
      task === "keywords"
        ? "/api/cron/seo-keywords"
        : task === "publish"
        ? "/api/cron/generate-blog"
        : task === "metrics"
        ? "/api/cron/seo-metrics"
        : task === "sitemap"
        ? "/api/admin/seo/sitemap"
        : "/api/cron/seo-refresh";

    setRunning(task);
    setMessage(null);
    try {
      const res = await fetch(endpoint, { method: "POST", cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Failed: ${json.error ?? res.status}`);
      } else if (task === "keywords") {
        setMessage(
          `Harvested ${json.suggested ?? 0} suggestions — ${json.created ?? 0} new keywords, ${json.rescored ?? 0} rescored from Search Console.`
        );
      } else if (task === "publish") {
        setMessage(
          json.slug
            ? `Published "${json.title}" for "${json.keyword ?? "topic pool"}".`
            : json.reason || json.message || "Nothing published."
        );
      } else if (task === "metrics") {
        setMessage(
          json.ok
            ? `Synced ${json.days ?? 0} days from Search Console — ${(json.clicks ?? 0).toLocaleString()} clicks, ${(json.impressions ?? 0).toLocaleString()} impressions.`
            : json.reason || "Couldn't sync Search Console."
        );
      } else if (task === "sitemap") {
        const last = json.sitemap?.lastDownloaded
          ? `Google last read it ${new Date(json.sitemap.lastDownloaded).toLocaleString()}.`
          : "Google has not downloaded it yet - that can take a day or two.";
        setMessage(
          `Sitemap resubmitted with ${json.urlCount ?? 0} URLs. ${last} ${json.indexNow ?? ""}`.trim()
        );
      } else {
        setMessage(
          json.refreshed
            ? `Refreshed /blog/${json.slug} for ${(json.addedFor ?? []).join(", ")}.`
            : json.reason || "Nothing to refresh."
        );
      }
      await load();
    } catch (err) {
      setMessage(`Failed: ${String(err)}`);
    } finally {
      setRunning(null);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }
  if (!data) return <p className="text-sm text-neutral-500">Couldn&apos;t load SEO data.</p>;

  const { config, counts } = data;
  const clicks30 = data.trend.reduce((n, t) => n + t.clicks, 0);
  const impressions30 = data.trend.reduce((n, t) => n + t.impressions, 0);

  return (
    <div className="space-y-6">
      {/* Setup state — be honest about what is and isn't wired up */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {[
          { label: "OpenAI (writing)", ok: config.openai, hint: "OPENAI_API_KEY" },
          { label: "Search Console (rankings)", ok: config.searchConsole, hint: "GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY / GSC_SITE_URL" },
          { label: "IndexNow (instant indexing)", ok: config.indexNow, hint: "INDEXNOW_KEY" },
          { label: "Cron secret (automation)", ok: config.cronSecret, hint: "CRON_SECRET" },
        ].map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-3 ${
              c.ok ? "border-lime-500/30 bg-lime-500/10" : "border-amber-500/30 bg-amber-500/10"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {c.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-lime-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
              <p className="text-xs font-semibold text-neutral-200">{c.label}</p>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">{c.ok ? "Connected" : `Set ${c.hint}`}</p>
          </div>
        ))}
      </div>

      {/* Run the loops */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => run("keywords")} disabled={!!running}>
          {running === "keywords" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="mr-1.5 h-3.5 w-3.5" />
          )}
          Harvest keywords
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("publish")} disabled={!!running}>
          {running === "publish" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          )}
          Publish next article
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("refresh")} disabled={!!running}>
          {running === "refresh" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Refresh a near-ranking page
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("metrics")} disabled={!!running}>
          {running === "metrics" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <LineChart className="mr-1.5 h-3.5 w-3.5" />
          )}
          Sync Search Console
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("sitemap")} disabled={!!running}>
          {running === "sitemap" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-3.5 w-3.5" />
          )}
          Submit sitemap
        </Button>
        <span className="w-full text-xs text-neutral-500 sm:w-auto">
          Runs automatically: metrics daily, one article daily, keywords weekly, one refresh weekly.
          Submitting the sitemap is optional - Google re-reads it on its own schedule, this just
          shortens the wait after new pages ship.
        </span>
      </div>

      {message && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-sm text-neutral-300">
          {message}
        </div>
      )}

      {/* Trend — the whole point: is this working */}
      <SeoTrendChart trend={data.trend} deltas={data.deltas} connected={config.searchConsole} />

      {/* AI search visibility — the half of SEO that's newly up for grabs */}
      <AiVisibilityPanel />

      {/* Exercise pages & rehab guides — data-driven, not keyword-driven */}
      <ContentPagesPanel />

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {[
          { label: "Keywords found", value: counts.totalKeywords },
          { label: "In queue", value: counts.queued },
          { label: "Articles live", value: counts.posts },
          { label: "Clicks (28d)", value: config.searchConsole ? clicks30 : "—" },
          { label: "Impressions (28d)", value: config.searchConsole ? impressions30 : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 sm:p-4">
            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Striking distance — the money list */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
          <TrendingUp className="h-4 w-4 text-lime-400" />
          <h3 className="text-sm font-semibold text-white">
            <span className="sm:hidden">Striking distance (4-20)</span>
            <span className="hidden sm:inline">
              Striking distance — ranking 4-20, one improvement from page-one traffic
            </span>
          </h3>
        </div>
        {!config.searchConsole ? (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Connect Search Console to see this. It&apos;s the highest-value list in the whole system.
          </p>
        ) : data.striking.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Nothing here yet — keep publishing, this fills up once pages start ranking.
          </p>
        ) : (
          <div className="-mx-px overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Query</th>
                <th className="px-4 py-2 font-medium">Position</th>
                <th className="px-4 py-2 font-medium">Impressions</th>
                <th className="px-4 py-2 font-medium">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {data.striking.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-neutral-200">{r.keyword}</td>
                  <td className="px-4 py-2 font-medium text-amber-400">
                    {r.position?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-400">{r.impressions}</td>
                  <td className="px-4 py-2 text-neutral-400">{r.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Queue */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60">
        <div className="border-b border-neutral-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">
            Next up — highest-scoring queries not written yet
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Score favours long-tail, buying intent, and anything already getting impressions.
          </p>
        </div>
        {data.topQueue.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Queue is empty — hit &ldquo;Harvest keywords&rdquo;.
          </p>
        ) : (
          <div className="-mx-px overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Query</th>
                <th className="px-4 py-2 font-medium">Cluster</th>
                <th className="px-4 py-2 font-medium">Intent</th>
                <th className="px-4 py-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {data.topQueue.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-neutral-200">{r.keyword}</td>
                  <td className="px-4 py-2 text-neutral-500">{r.cluster}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                        INTENT_STYLE[r.intent] ?? INTENT_STYLE.informational
                      }`}
                    >
                      {r.intent}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium text-neutral-300">{r.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Clusters + recent posts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Topical map</h3>
          <div className="space-y-2">
            {data.clusters.map((c) => (
              <div key={c.cluster} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-xs text-neutral-400 sm:w-44">{c.cluster}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (c.count / (data.clusters[0]?.count || 1)) * 100)}%`,
                      backgroundImage: "linear-gradient(90deg, #a3e635, #65a30d)",
                    }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-neutral-500">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Latest articles</h3>
          <div className="space-y-2">
            {data.recentPosts.map((p) => (
              <div key={p.slug} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 truncate text-sm text-neutral-200 hover:text-lime-400"
                  >
                    {p.title}
                    <ExternalLink className="h-3 w-3 shrink-0 text-neutral-600" />
                  </a>
                  <p className="truncate text-[11px] text-neutral-500">
                    {p.keyword ? `target: ${p.keyword}` : "topic pool"}
                    {p.wordCount ? ` · ${p.wordCount} words` : ""}
                    {p.refreshCount ? ` · refreshed ${p.refreshCount}×` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-neutral-600">
                  {new Date(p.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Run log */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60">
        <div className="border-b border-neutral-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Autopilot log</h3>
        </div>
        {data.runs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">No runs yet.</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {data.runs.map((r) => (
              <div key={r.id} className="flex flex-col gap-1 px-4 py-2 text-xs sm:flex-row sm:items-start sm:gap-3">
                <span
                  className={`mt-0.5 w-fit rounded px-1.5 py-0.5 font-medium ${
                    r.ok ? "bg-lime-500/10 text-lime-400" : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {r.task}
                </span>
                <span className="flex-1 break-words text-neutral-400">{r.detail}</span>
                <span className="shrink-0 text-neutral-600 sm:text-right">
                  {new Date(r.createdAt).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ContentCounts = {
  exercises: { total: number; withPage: number };
  rehabGuides: { live: number; total: number };
};

/**
 * Exercise pages and rehab guides are data-driven, not keyword-driven — no
 * queue, no clusters, just "walk the fixed set and write what's missing" —
 * so they get their own small panel rather than being forced into the
 * keyword-queue shapes above.
 */
function ContentPagesPanel() {
  const [counts, setCounts] = useState<ContentCounts | null>(null);
  const [running, setRunning] = useState<"exercises" | "rehab" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/seo/content-counts", { cache: "no-store" });
    if (res.ok) setCounts(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(task: "exercises" | "rehab") {
    const endpoint =
      task === "exercises" ? "/api/cron/generate-exercise-pages" : "/api/cron/generate-rehab-guides";
    setRunning(task);
    setMessage(null);
    try {
      const res = await fetch(endpoint, { method: "POST", cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Failed: ${json.error ?? res.status}`);
      } else if (json.written?.length) {
        setMessage(`Wrote ${json.written.length} new page(s): ${json.written.map((w: any) => w.slug ?? w.name ?? w.condition).join(", ")}.`);
      } else if (json.source === "refresh" && json.slug) {
        setMessage(`Refreshed "${json.slug}".`);
      } else {
        setMessage(json.reason || "Nothing to do.");
      }
      await load();
    } catch (err) {
      setMessage(`Failed: ${String(err)}`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Exercise pages & rehab guides</h3>
      <p className="mb-4 text-xs text-neutral-500">
        Data-driven, not keyword-driven — each run writes the next exercise or condition without a
        page yet, and refreshes the thinnest page once everything&apos;s covered. Both also run on their
        own cron twice a week.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-lime-400" />
            <p className="text-xs uppercase tracking-wide text-neutral-500">Exercise pages</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {counts ? `${counts.exercises.withPage} / ${counts.exercises.total}` : "—"}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => run("exercises")}
            disabled={!!running}
          >
            {running === "exercises" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            Generate exercise pages
          </Button>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 sm:p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <HeartPulse className="h-3.5 w-3.5 text-lime-400" />
            <p className="text-xs uppercase tracking-wide text-neutral-500">Rehab guides</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {counts ? `${counts.rehabGuides.live} / ${counts.rehabGuides.total}` : "—"}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => run("rehab")}
            disabled={!!running}
          >
            {running === "rehab" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            Generate rehab guides
          </Button>
        </div>
      </div>
      {message && (
        <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3 text-sm text-neutral-300">
          {message}
        </div>
      )}
    </div>
  );
}
