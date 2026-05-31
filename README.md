# open-weather

A clean, self-hosted weather app. No ads. No trackers. No accounts.

Built because every weather site on the internet is buried under cookie banners, retargeting pixels, and autoplay video ads — just to find out if it's going to rain.

---

## What it does

- Current conditions, 6-hour, 24-hour and 7-day forecasts
- City search with autocomplete
- Local weather station support — your station handles "right now", Open-Meteo handles the forecast (needs testing)
- Favorite locations (per-browser)
- Light and dark mode
- Metric and imperial units, 12/24h clock
- iOS home screen widget (Scriptable)
- Proxy API — call it from a mobile app or anything else

All forecast data comes from [Open-Meteo](https://open-meteo.com) — free, no API key required.

---

## Run it

**Docker (recommended)**

```sh
cp .env.example .env
docker compose up -d
```

Runs on port 3000 by default. Set `PORT` in `.env` to change it.

**Local dev**

```sh
npm install
npm run dev
```

---

## iOS widget

Install [Scriptable](https://apps.apple.com/app/scriptable/id1405459188), create a new script, and paste in [`clients/scriptable/widget.js`](clients/scriptable/widget.js). Edit the `CONFIG` block at the top with your server URL and coordinates.

Accessing remotely is best done using a split-tunnel VPN with Wireguard. I use a self-hosted Wireguard instance on Opnsense with Dynamic DNS configured via DuckDNS.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `OPEN_METEO_URL` | `https://api.open-meteo.com/v1` | Override the forecast API base URL |
| `OPEN_METEO_GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Override the geocoding API base URL |

---

## Stack

SvelteKit · Tailwind CSS · TypeScript · Docker
