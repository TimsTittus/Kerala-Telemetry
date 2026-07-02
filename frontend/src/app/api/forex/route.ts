import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";


const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AED", "SGD", "SAR"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export type ForexRate = {
  code: CurrencyCode;
  
  rate: number;
  
  inrPer: number;
};

export type ForexPayload = {
  base: "INR";
  rates: ForexRate[];
  updatedAt: string;
  error: string | null;
};

export async function GET() {
  const apiBase = process.env.FOREX_API_BASE!;
  const url = `${apiBase}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`ExchangeRate API ${res.status}`);
    const json = (await res.json()) as ErApiResponse;

    if (json.result !== "success") {
      throw new Error(json["error-type"] ?? "Unknown error from exchange rate API");
    }

    const rates: ForexRate[] = CURRENCIES.map((code) => {
      const rate = json.rates[code] ?? 0; 
      return {
        code,
        rate,
        inrPer: rate > 0 ? 1 / rate : 0,
      };
    });

    return NextResponse.json(
      { base: "INR", rates, updatedAt: new Date().toISOString(), error: null } satisfies ForexPayload,
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { base: "INR", rates: [], updatedAt: new Date().toISOString(), error: msg } satisfies ForexPayload,
      { status: 500 },
    );
  }
}

type ErApiResponse = {
  result: string;
  "error-type"?: string;
  rates: Record<string, number>;
};