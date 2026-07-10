import { AlertBanner } from "@/shared/ui/layout/AlertBanner";
import { MainNavigation } from "@/shared/ui/layout/MainNavigation";
import { SiteHeader } from "@/shared/ui/layout/SiteHeader";
import { getFestivalsPayload } from "@/lib/server/festivals-data";
import { getMoviesPayload } from "@/lib/server/movies-data";
import { DashboardPanel } from "@/shared/ui/dashboard/DashboardPanel";
import { PageRefreshButton } from "@/shared/ui/dashboard/PageRefreshButton";
import { AirQualityPanel, CityWeatherPanel, EarthquakesPanel } from "@/features/weather/PrimaryMetricsRow";
import { ExchangeRatesPanel, FuelPanel, IndianMarketsPanel, SeismicPanel } from "@/features/markets/SecondaryMetricsRow";
import { RegionalMapOverviewLoader } from "@/features/telemetry/RegionalMapOverviewLoader";
import { NewsAggregator } from "@/features/media/NewsAggregator";
import { LiveBroadcasts } from "@/features/media/LiveBroadcasts";
import { youtubeStreamEntries } from "@/config/sources";

export const dynamic = "force-dynamic";

type Upcoming = {
  title: string;
  date: string;
  note?: string;
  link?: string;
  poster?: string;
};

async function loadFestivalsAndMovies(): Promise<{
  festivalItems: Upcoming[];
  movieItems: Upcoming[];
  upcomingMovieItems: Upcoming[];
}> {
  const [fest, movies] = await Promise.all([getFestivalsPayload(), getMoviesPayload()]);

  const festivalItems: Upcoming[] = (fest.items ?? []).map((i) => ({
    title: i.title,
    date: String(i.date ?? "").slice(0, 10),
    note: i.note || undefined,
  }));

  const mapMovie = (i: {
    title: string;
    date: string;
    note: string;
    poster: string | null;
    releaseType: "theatrical" | "ott";
  }): Upcoming => ({
    title: i.title,
    date: String(i.date ?? "").slice(0, 10),
    note: i.note || undefined,
    poster: i.poster ?? undefined,
  });

  const movieItems = (movies.items ?? []).map(mapMovie);
  const upcomingMovieItems = (movies.upcoming ?? []).map(mapMovie);

  return { festivalItems, movieItems, upcomingMovieItems };
}

function movieBadgeLabel(item: Upcoming, section: "upcoming" | "now"): string {
  if (section === "upcoming") return "Upcoming";
  if (item.note?.startsWith("Streaming")) return "OTT";
  return "Showtime";
}

function formatMovieDateLine(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return raw;
}

function daysUntilLabel(dateStr: string): string | null {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return "Today!";
  if (diff === 1) return "Tomorrow!";
  return `${diff} days away`;
}

export default async function Home() {
  const { festivalItems, movieItems, upcomingMovieItems } = await loadFestivalsAndMovies();

  const nowShowingItems = movieItems.filter(item => movieBadgeLabel(item, "now") === "Showtime");
  const streamingItems = movieItems.filter(item => movieBadgeLabel(item, "now") === "OTT");

  const mlFest = "Upcoming Celebrations";
  const mlMovies = "Malayalam Movies";

  return (
    <div className="min-h-full bg-black relative">
      { }
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="gf-top-stripe relative z-10" aria-hidden />

      <div className="relative z-10">
        <SiteHeader />
        <AlertBanner />
        <MainNavigation />

        <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 md:px-5">
          <RegionalMapOverviewLoader />

          <LiveBroadcasts entries={youtubeStreamEntries} />

          <NewsAggregator />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            { }
            <AirQualityPanel />

            { }
            <CityWeatherPanel />

            { }
            <EarthquakesPanel />

            { }
            <ExchangeRatesPanel />

            { }
            <FuelPanel />

            { }
            <IndianMarketsPanel />

            { }
            <div className="md:col-span-2 xl:col-span-3">
              <DashboardPanel
                id="movies"
                title="Malayalam movies"
                subtitle={mlMovies}
                className="kt-animate-in kt-stagger-5 scroll-mt-[120px]"
                rightSlot={<PageRefreshButton />}
              >
                {movieItems.length === 0 && upcomingMovieItems.length === 0 ? (
                  <p className="text-[0.85rem] text-[var(--gf-text-muted)]">
                    No Malayalam listings from Watchmode. Add{" "}
                    <code className="font-mono text-[var(--gf-accent)]">WATCHMODE_API_KEY</code> in{" "}
                    Vercel → Env (Production) for Serverless Functions,{" "}
                    <strong className="text-[var(--gf-text-muted)]">save</strong>, then{" "}
                    <strong className="text-[var(--gf-text-muted)]">Redeploy</strong>. Inspect{" "}
                    <code className="font-mono text-[var(--gf-accent)]">/api/movies</code> for JSON.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {upcomingMovieItems.length > 0 ? (
                      <div>
                        <h3 className="mb-3 font-mono text-[0.68rem] font-semibold tracking-wider text-[var(--gf-text-muted)] uppercase">
                          Upcoming
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {upcomingMovieItems.map((item, i) => {
                            const countdown = daysUntilLabel(item.date);
                            const badge = movieBadgeLabel(item, "upcoming");
                            return (
                              <div
                                key={`up-${item.title}-${item.date}-${i}`}
                                className="kt-card-hover gf-subpanel cursor-default overflow-hidden"
                              >
                                <div className="relative aspect-[2/3] overflow-hidden border-b border-[var(--gf-panel-border)] bg-[var(--gf-panel-inner)]">
                                  {item.poster ? (
                                    <img
                                      src={item.poster}
                                      alt={item.title}
                                      className="h-full w-full object-cover opacity-90 transition-all hover:opacity-100"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl opacity-50">
                                      {["\u{1F3AC}", "\u{1F39E}\uFE0F", "\u{1F3AD}", "\u{1F3DE}\uFE0F"][i % 4]}
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <div className="line-clamp-2 text-[0.78rem] font-medium text-[var(--gf-text)]">{item.title}</div>
                                  <div className="mt-1 font-mono text-[0.62rem] text-[var(--gf-text-muted)]">
                                    {formatMovieDateLine(item.date)}
                                    {countdown ? ` · ${countdown}` : ""}
                                  </div>
                                  {item.note ? (
                                    <div className="mt-1 text-[0.58rem] leading-snug text-[var(--gf-text-muted)] opacity-90">
                                      {item.note}
                                    </div>
                                  ) : null}
                                  <span className="mt-2 inline-block rounded-full border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-[0.55rem] font-medium text-white">
                                    {badge}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {[
                      { title: "Now showing", items: nowShowingItems },
                      { title: "Streaming", items: streamingItems }
                    ].map((section, idx) => section.items.length > 0 ? (
                      <div key={section.title} className={idx > 0 || upcomingMovieItems.length > 0 ? "pt-2" : ""}>
                        <h3 className="mb-3 font-mono text-[0.68rem] font-semibold tracking-wider text-[var(--gf-text-muted)] uppercase">
                          {section.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {section.items.map((item, i) => {
                            const badge = movieBadgeLabel(item, "now");
                            const isOtt = badge === "OTT";
                            return (
                              <div
                                key={`${item.title}-${item.date}-${i}`}
                                className="kt-card-hover gf-subpanel cursor-default overflow-hidden"
                              >
                                <div className="relative aspect-[2/3] overflow-hidden border-b border-[var(--gf-panel-border)] bg-[var(--gf-panel-inner)]">
                                  {item.poster ? (
                                    <img
                                      src={item.poster}
                                      alt={item.title}
                                      className="h-full w-full object-cover opacity-90 transition-all hover:opacity-100"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl opacity-50">
                                      {["\u{1F3AC}", "\u{1F39E}\uFE0F", "\u{1F3AD}", "\u{1F3DE}\uFE0F"][i % 4]}
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <div className="line-clamp-2 text-[0.78rem] font-medium text-[var(--gf-text)]">{item.title}</div>
                                  <div className="mt-1 font-mono text-[0.62rem] text-[var(--gf-text-muted)]">
                                    {formatMovieDateLine(item.date)}
                                  </div>
                                  {item.note ? (
                                    <div className="mt-1 text-[0.58rem] leading-snug text-[var(--gf-text-muted)] opacity-90">
                                      {item.note}
                                    </div>
                                  ) : null}
                                  <span
                                    className={`mt-2 inline-block rounded-full border px-2 py-0.5 font-mono text-[0.55rem] font-medium ${isOtt
                                      ? "border-white/20 bg-white/10 text-white"
                                      : "border-white bg-white text-black"
                                      }`}
                                  >
                                    {badge}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null)}
                  </div>
                )}
              </DashboardPanel>
            </div>

            { }
            <SeismicPanel />

            { }
            <div className="md:col-span-2 xl:col-span-3">
              <DashboardPanel
                id="festivals"
                title="Upcoming festivals"
                subtitle={mlFest}
                className="kt-animate-in kt-stagger-4 scroll-mt-[120px]"
              >
                {festivalItems.length === 0 ? (
                  <p className="text-[0.85rem] text-[var(--gf-text-muted)]">
                    No upcoming festivals loaded. Optional: set{" "}
                    <code className="font-mono text-[var(--gf-accent)]">CALENDARIFIC_API_KEY</code> in{" "}
                    Vercel → Env (Production) for richer Kerala data — otherwise the API uses free fallbacks. If this
                    stays empty after a{" "}
                    <strong className="text-[var(--gf-text-muted)]">redeploy</strong>, open{" "}
                    <code className="font-mono text-[var(--gf-accent)]">/api/festivals</code> (only set{" "}
                    <code className="font-mono text-[var(--gf-accent)]">NEXT_PUBLIC_APP_URL</code> to your public
                    URL if redirects / self-fetch cause issues — the app prefers the incoming request Host).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {festivalItems
                      .filter((item) => daysUntilLabel(item.date) !== null)
                      .map((item) => {
                        const countdown = daysUntilLabel(item.date)!;
                        const d = new Date(`${item.date}T12:00:00`);
                        const dateLabel = d.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        });
                        const weekdayLabel = d.toLocaleDateString("en-IN", { weekday: "long" });
                        return (
                          <div
                            key={`${item.title}-${item.date}`}
                            className="kt-card-hover gf-subpanel relative flex items-stretch overflow-hidden"
                          >
                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-3.5">
                              <div className="text-[0.88rem] font-medium leading-snug text-[var(--gf-text)]">
                                {item.title}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[0.62rem] text-[var(--gf-text-muted)]">
                                  {dateLabel}
                                </span>
                                <span className="font-mono text-[0.6rem] capitalize text-[var(--gf-text-muted)]">
                                  {weekdayLabel}
                                </span>
                              </div>
                              {item.note ? (
                                <div className="font-mono text-[0.55rem] leading-snug text-[var(--gf-text-muted)] opacity-80 mt-0.5">
                                  {item.note}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 items-center pr-3 border-l border-white/5 ml-2 pl-3">
                              <span className="text-center font-mono text-[0.6rem] leading-tight text-[var(--gf-text-muted)]">
                                {countdown === "Today!" || countdown === "Tomorrow!" ? (
                                  <span className="font-bold text-white tracking-widest uppercase">{countdown}</span>
                                ) : (
                                  <>
                                    <span className="block text-[0.85rem] font-medium text-white">{countdown.replace(" days away", "")}</span>
                                    <span className="block opacity-60 mt-0.5">days</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </DashboardPanel>
            </div>
          </div>
        </main>

        <footer className="mt-16 border-t border-[var(--gf-panel-border)] bg-transparent px-6 py-12 md:px-12 font-mono text-left relative overflow-hidden backdrop-blur-xl">
          <div className="max-w-4xl relative z-10">
            <h2 className="text-2xl md:text-3xl font-light tracking-widest text-white uppercase leading-none mb-4">
              Kerala Telemetry
            </h2>

            <div className="flex flex-col items-start gap-1.5 text-[0.72rem] md:text-[0.82rem] tracking-widest text-white/70 uppercase mb-8">
              <div>The Real-Time Command Center</div>
              <div className="bg-white px-2 py-0.5 text-black font-semibold text-[0.65rem] md:text-[0.75rem] tracking-widest">
                For Regional Intelligence
              </div>
              <div className="opacity-50">System 2026</div>
            </div>

            <p className="max-w-2xl text-[0.7rem] md:text-[0.75rem] leading-relaxed text-white/50 mb-10 font-sans font-light">
              An automated telemetry dashboard consolidating critical regional feeds for the state of Kerala.
              Monitored endpoints track meteorological indices, ambient air quality, local market indices,
              retail commodity rates (fuel, gold), real-time broadcasts, and seismic activities.
            </p>

            <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-8">
              <a
                href="https://github.com/TimsTittus/keralaupdate"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 border border-white/30 bg-transparent px-4 py-2 font-mono text-[0.62rem] font-medium tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-white hover:text-black cursor-pointer rounded-full"
              >
                <svg
                  className="size-3.5 shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.113.825-.262.825-.585 0-.292-.015-1.263-.015-2.295-3.015.653-3.653-.735-3.885-1.403-.131-.33-.698-1.403-1.188-1.688-.405-.218-.99-.756-.015-.771.918-.014 1.575.844 1.791 1.188 1.05 1.744 2.73 1.253 3.39.948.098-.746.405-1.253.735-1.543-2.565-.293-5.265-1.283-5.265-5.698 0-1.26.45-2.288 1.185-3.096-.12-.293-.51-1.47.113-3.065 0 0 .968-.307 3.17 1.178a10.95 10.95 0 0 1 5.7 0c2.202-1.485 3.165-1.178 3.165-1.178.627 1.595.233 2.772.118 3.065.735.808 1.18 1.83 1.18 3.096 0 4.425-2.708 5.398-5.28 5.688.42.36.795 1.065.795 2.145 0 1.548-.015 2.79-.015 3.165 0 .323.225.708.825.585A11.987 11.987 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                <span>View Source</span>
              </a>

              <div className="flex flex-col font-mono text-[0.55rem] text-white/30 tracking-[0.2em]">
                <span>LAT: 10.8505° N · LON: 76.2711° E</span>
                <span className="mt-1">INDEX: BR-WAYNE / KERALA-TELEMETRY</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}