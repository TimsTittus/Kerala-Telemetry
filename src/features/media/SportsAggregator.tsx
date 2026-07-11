"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DashboardPanel } from "@/shared/ui/dashboard/DashboardPanel";
import { DataRefreshButton } from "@/shared/ui/dashboard/DataRefreshButton";
import type { SportsNewsItem } from "@/app/api/sports/route";

function formatRelative(isoOrRfc: string | null): string {
  if (!isoOrRfc) return "";
  const t = new Date(isoOrRfc).getTime();
  if (Number.isNaN(t)) return isoOrRfc;
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Payload = {
  category: string;
  articles: SportsNewsItem[];
  sourcesUsed: string[];
};

const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

async function loadSportsNews(): Promise<Payload> {
  const res = await fetch(`/api/sports?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load sports news");
  }
  return (await res.json()) as Payload;
}

export function SportsAggregator() {
  const mlTitle = "Kerala Sports";

  const { data: payload, isPending, isFetching, refetch, error } = useQuery({
    queryKey: ["panels", "sports-news"],
    queryFn: loadSportsNews,
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
    retry: 1,
  });

  const refreshBtn = (
    <DataRefreshButton onClick={() => void refetch()} isRefreshing={isPending || isFetching} ariaLabel="Refresh sports news" />
  );

  return (
    <DashboardPanel
      id="sports-news"
      title="Kerala Sports"
      subtitle={mlTitle}
      className="kt-animate-in kt-stagger-5 scroll-mt-[120px]"
      rightSlot={refreshBtn}
    >
      {isPending && !payload ? (
        <div className="py-8 text-center text-[0.85rem] text-[var(--gf-text-muted)]">
          <div className="flex justify-center">
            <div className="kt-spinner" />
          </div>
          <p className="mt-3">Loading sports updates...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error ? (
            <p className="rounded-sm border border-[var(--gf-panel-border)] bg-[var(--gf-panel-inner)] px-3 py-2 text-[0.82rem] text-[var(--gf-text-muted)]">
              Failed to load sports news. Please try again later.
            </p>
          ) : null}

          {(payload?.articles.length ?? 0) === 0 && !error ? (
            <p className="text-[0.85rem] text-[var(--gf-text-muted)]">
              No sports updates available right now. Configure <code className="font-mono text-[var(--gf-accent)]">NEWSAPI_API_KEY</code> and <code className="font-mono text-[var(--gf-accent)]">GNEWS_API_KEY</code> in Vercel to see real data.
            </p>
          ) : (
            <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 transition-opacity duration-300 ${isFetching ? "opacity-50" : ""}`}>
              {payload?.articles.map((item, i) => (
                <a
                  key={`${item.url}-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kt-card-hover gf-subpanel flex flex-col overflow-hidden no-underline"
                  style={{ color: "inherit" }}
                >
                  <div className="relative aspect-video overflow-hidden border-b border-[var(--gf-panel-border)] bg-[var(--gf-panel-inner)]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-90 transition-all hover:opacity-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl opacity-40">
                        {["⚽️", "🏏", "🏃", "🏆"][i % 4]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="mb-1.5 font-mono text-[0.6rem] font-semibold tracking-wider text-[var(--gf-text-muted)] uppercase">
                      {item.source}
                    </div>
                    <div className="line-clamp-3 flex-1 text-[0.78rem] font-medium leading-snug text-[var(--gf-text)]">
                      {item.title}
                    </div>
                    <div className="mt-3 font-mono text-[0.62rem] text-[var(--gf-text-muted)]">
                      {formatRelative(item.publishedAt)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  );
}