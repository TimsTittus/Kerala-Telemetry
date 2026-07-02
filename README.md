# Kerala Telemetry

A real-time regional intelligence dashboard for Kerala — aggregating weather, air quality, markets, seismic activity, news, and live broadcasts into a single interface.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Mapping | Leaflet + react-leaflet |
| Data | Open-Meteo, OpenAQ, Yahoo Finance, USGS, RSS |

## Features

- **District Map** — interactive GeoJSON map with per-district weather and air quality
- **Weather** — current conditions across major Kerala cities via Open-Meteo
- **Air Quality** — European AQI + PM2.5/PM10 from OpenAQ
- **Markets** — NIFTY 50, SENSEX, NIFTY Bank live via Yahoo Finance
- **Forex** — major currency pairs against INR
- **Retail Rates** — petrol, diesel, and gold prices
- **Seismic** — USGS earthquake feed (±300 km buffer around Kerala)
- **News** — aggregated RSS feeds from major Kerala publications
- **Live Broadcasts** — Malayalam news channel YouTube live streams
- **Festivals** — upcoming Kerala festivals via Calendarific
- **Movies** — current and upcoming Malayalam releases via Watchmode

## Setup

```bash
# Install dependencies
bun install   # or npm install

# Configure environment
cp .env.example .env

# Start dev server
bun dev   # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `WATCHMODE_API_KEY` | Optional | Malayalam movie listings |
| `CALENDARIFIC_API_KEY` | Optional | Kerala festival calendar |
| `NEXT_PUBLIC_APP_URL` | Optional | Public base URL for self-fetch API calls |

All data sources fall back gracefully when API keys are absent.

## Project Structure

```
src/
├── app/               # Next.js App Router (pages, layouts, API routes)
├── features/          # Feature-sliced UI modules
│   ├── markets/       # Forex, fuel, gold, Indian indices
│   ├── media/         # News aggregator, live broadcasts
│   ├── telemetry/     # Regional map, seismic panel
│   └── weather/       # Air quality, city weather
├── shared/ui/         # Reusable layout and dashboard primitives
├── lib/               # Shared utilities and server-side data fetchers
└── config/            # Static city list, RSS/YouTube sources
```

## License

MIT