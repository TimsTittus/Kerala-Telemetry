"use client";

import { useEffect, useState } from "react";
import { weatherCodeLabel } from "@/lib/weather";

const STRIP_CITIES = [
  { name: "Kottayam", lat: 9.5916, lon: 76.5222 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
  { name: "Thrissur", lat: 10.5276, lon: 76.2144 },
] as const;


function mlCalendarLine(d: Date): string {
  const gMonth = d.getMonth();
  const gDay = d.getDate();



  const MONTHS = [
    { name: "Makaram", m: 0, day: 14 },
    { name: "Kumbham", m: 1, day: 13 },
    { name: "Meenam", m: 2, day: 15 },
    { name: "Medam", m: 3, day: 14 },
    { name: "Edavam", m: 4, day: 15 },
    { name: "Mithunam", m: 5, day: 15 },
    { name: "Karkidakam", m: 6, day: 17 },
    { name: "Chingam", m: 7, day: 17 },
    { name: "Kanni", m: 8, day: 17 },
    { name: "Thulam", m: 9, day: 17 },
    { name: "Vrischikam", m: 10, day: 16 },
    { name: "Dhanu", m: 11, day: 16 },
  ];


  let current = MONTHS[0];
  for (const entry of MONTHS) {
    if (gMonth > entry.m || (gMonth === entry.m && gDay >= entry.day)) {
      current = entry;
    }
  }

  const gYear = d.getFullYear();

  const startDate = new Date(gYear, current.m, current.day);
  const today = new Date(gYear, gMonth, gDay);
  const mlDay = Math.round((today.getTime() - startDate.getTime()) / 86400000) + 1;
  const afterNewYear = gMonth > 7 || (gMonth === 7 && gDay >= 17);
  const meYear = afterNewYear ? gYear - 824 : gYear - 825;

  return `${current.name} ${mlDay}, ${meYear} ME`;
}

export function SiteHeader() {
  const [now, setNow] = useState<Date | null>(null);
  const [strip, setStrip] = useState<{ name: string; temp: number; code: number }[] | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("kt-theme");
    if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kt-theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lat = STRIP_CITIES.map((c) => c.lat).join(",");
        const lon = STRIP_CITIES.map((c) => c.lon).join(",");
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FKolkata`;
        const res = await fetch(url);
        const data = (await res.json()) as { current_weather?: { temperature: number; weathercode: number } }[];
        if (!cancelled && Array.isArray(data)) {
          setStrip(STRIP_CITIES.map((c, i) => {
            const cw = data[i]?.current_weather;
            return { name: c.name, temp: Math.round(cw?.temperature ?? 0), code: cw?.weathercode ?? 0 };
          }));
        }
      } catch {
        if (!cancelled) setStrip([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const timeStr = now?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) ?? "--:--:--";
  const dateStr = now?.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() ?? "";
  const mlSub = "KERALA INTEL // TELEMETRY STREAM";

  return (
    <header className="sticky top-0 z-[200] border-b border-[var(--gf-panel-border)] bg-black/50 backdrop-blur-xl">
      { }
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/20 bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] font-mono font-light text-white text-lg tracking-widest backdrop-blur-md">
            KT
            <span className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm md:text-base font-medium tracking-[0.18em] text-white uppercase">
                Kerala Telemetry
              </h1>
              <span className="hidden sm:inline-block rounded-full bg-white/10 border border-white/20 px-2 py-0.5 font-mono text-[0.55rem] font-medium text-white tracking-widest uppercase">
                Active
              </span>
            </div>
            <p className="font-mono text-[0.62rem] md:text-[0.68rem] tracking-[0.2em] text-[var(--gf-text-muted)] font-light mt-0.5">
              {mlSub}
            </p>
          </div>
        </div>

        { }
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-[var(--gf-panel-border)]/50 pt-2.5 md:pt-0">
          <div className="text-left md:text-right font-mono text-[0.62rem] md:text-[0.68rem] leading-tight text-[var(--gf-text-muted)]">
            <span className="font-mono text-[0.68rem] md:text-[0.72rem] font-medium text-white tracking-widest">
              {now ? mlCalendarLine(now).toUpperCase() : "\u2026"}
            </span>
            <div className="mt-0.5 tracking-[0.1em] text-[var(--gf-text-muted)]">{dateStr}</div>
          </div>

          <div className="border-l border-white/10 pl-4 h-8 flex flex-col justify-center">
            <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[var(--gf-text-muted)] uppercase block">SYSTEM TIME</span>
            <span className="font-mono text-xs md:text-sm font-medium tabular-nums text-white tracking-widest mt-0.5">
              {timeStr}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10"
          >
            {theme === "dark" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
        </div>
      </div>

      { }
      <div className="border-t border-[var(--gf-panel-border)] bg-black/20 backdrop-blur-md px-4 py-2 md:px-6">
        <div
          className="flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <span className="flex shrink-0 items-center gap-2 font-mono text-[0.6rem] font-medium tracking-[0.2em] text-[var(--gf-text-muted)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
            Weather Telemetry:
          </span>
          {!strip?.length ? (
            <span className="font-mono text-[0.6rem] text-[var(--gf-text-muted)] animate-pulse tracking-[0.2em]">Establishing feed...</span>
          ) : (
            strip.map((row) => (
              <div key={row.name} className="flex shrink-0 items-center gap-2.5 border-l border-white/10 pl-4 first:border-l-0 first:pl-0">
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-[var(--gf-text-muted)] uppercase">
                  {row.name}:
                </span>
                <span className="font-mono text-[0.72rem] font-medium text-white">
                  {row.temp}°C
                </span>
                <span className="font-mono text-[0.55rem] text-[var(--gf-text-muted)] tracking-[0.2em] uppercase">
                  {weatherCodeLabel(row.code)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </header>
  );
}