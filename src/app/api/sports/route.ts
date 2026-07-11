import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type SportsNewsItem = {
  title: string;
  description: string;
  image: string | null;
  source: string;
  url: string;
  publishedAt: string | null;
};

const NEWSAPI_KEY = process.env.NEWSAPI_API_KEY;
const GNEWS_KEY = process.env.GNEWS_API_KEY;

const QUERY = '"Kerala Blasters" OR "Super League Kerala" OR "Kerala Cricket" OR "Santosh Trophy Kerala" OR "Kerala sports" OR "Kerala football"';

async function fetchNewsAPI(): Promise<SportsNewsItem[]> {
  if (!NEWSAPI_KEY || NEWSAPI_KEY === "xxxxxxxx") return [];
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    QUERY
  )}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${NEWSAPI_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error("NewsAPI error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return (data.articles || [])
      .map((a: any) => ({
        title: a.title,
        description: a.description || "",
        image: a.urlToImage || null,
        source: a.source?.name || "NewsAPI",
        url: a.url,
        publishedAt: a.publishedAt,
      }))
      .filter((a: any) => a.title && a.url && a.title !== "[Removed]");
  } catch (e) {
    console.error("NewsAPI fetch failed", e);
    return [];
  }
}

async function fetchGNews(): Promise<SportsNewsItem[]> {
  if (!GNEWS_KEY || GNEWS_KEY === "xxxxxxxx") return [];
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    QUERY
  )}&lang=en&sortby=publishedAt&max=20&apikey=${GNEWS_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) {
      console.error("GNews error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return (data.articles || [])
      .map((a: any) => ({
        title: a.title,
        description: a.description || "",
        image: a.image || null,
        source: a.source?.name || "GNews",
        url: a.url,
        publishedAt: a.publishedAt,
      }))
      .filter((a: any) => a.title && a.url);
  } catch (e) {
    console.error("GNews fetch failed", e);
    return [];
  }
}

export async function GET() {
  const [newsApiResults, gnewsResults] = await Promise.all([
    fetchNewsAPI(),
    fetchGNews(),
  ]);

  const all = [...newsApiResults, ...gnewsResults];

  const seen = new Set<string>();
  const merged = all.filter((item) => {
    if (seen.has(item.url)) return false;

    // Also deduplicate by exact title to be safe
    if (seen.has(item.title)) return false;

    seen.add(item.url);
    seen.add(item.title);
    return true;
  });

  function itemEpoch(iso: string | null): number {
    if (!iso) return 0;
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : 0;
  }

  merged.sort((a, b) => itemEpoch(b.publishedAt) - itemEpoch(a.publishedAt));

  const items = merged.slice(0, 20);

  return NextResponse.json(
    {
      category: "sports",
      articles: items,
      sourcesUsed: [
        newsApiResults.length > 0 ? "NewsAPI" : null,
        gnewsResults.length > 0 ? "GNews" : null,
      ].filter(Boolean),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}