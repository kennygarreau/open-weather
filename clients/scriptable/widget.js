// ============================================================
// Open Weather · Scriptable Widget
// https://scriptable.app
//
// Install: paste this file into a new Scriptable script.
// Supports small and medium widget sizes.
// ============================================================

// ── Configuration ────────────────────────────────────────────
const CONFIG = {
  // URL of your self-hosted Open Weather instance.
  // Use your server's LAN IP or public hostname.
  serverUrl: 'http://192.168.1.x:4004',

  // Coordinates for the location you want to display.
  latitude: 45.5017,
  longitude: -73.5673,

  // Display name shown in the widget (not fetched from API).
  locationName: 'Montreal',

  // 'celsius' | 'fahrenheit'
  temperatureUnit: 'celsius',

  // 'kmh' | 'mph' | 'ms'
  windSpeedUnit: 'kmh',

  // IANA timezone string, e.g. 'America/Toronto', or 'auto' to
  // let the server detect it from coordinates.
  timezone: 'auto',
}
// ─────────────────────────────────────────────────────────────

const IS_DARK = Device.isUsingDarkAppearance()

const COLOR = {
  bg:        IS_DARK ? new Color('#111827') : new Color('#f9fafb'),
  primary:   IS_DARK ? new Color('#f9fafb') : new Color('#111827'),
  secondary: IS_DARK ? new Color('#9ca3af') : new Color('#6b7280'),
  divider:   IS_DARK ? new Color('#374151') : new Color('#e5e7eb'),
  accent:    new Color('#3b82f6'),
  rain:      new Color('#60a5fa'),
}

// ── Helpers ───────────────────────────────────────────────────

function unitSuffix() {
  return CONFIG.temperatureUnit === 'fahrenheit' ? '°F' : '°C'
}

// WMO code → SF Symbol name (iOS-native, no emoji/font issues).
function sfSymbolName(code, isDay = true) {
  if (code === 0)  return isDay ? 'sun.max.fill'           : 'moon.stars.fill'
  if (code <= 2)   return isDay ? 'cloud.sun.fill'         : 'cloud.moon.fill'
  if (code === 3)  return 'cloud.fill'
  if (code <= 48)  return 'cloud.fog.fill'
  if (code <= 55)  return 'cloud.drizzle.fill'
  if (code <= 65)  return 'cloud.rain.fill'
  if (code <= 77)  return 'cloud.snow.fill'
  if (code <= 82)  return 'cloud.heavyrain.fill'
  if (code <= 86)  return 'cloud.snow.fill'
  return 'cloud.bolt.rain.fill'
}

function wmoDescription(code) {
  const MAP = {
    0:'Clear', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Fog', 48:'Icy fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
    61:'Light rain', 63:'Rain', 65:'Heavy rain',
    71:'Light snow', 73:'Snow', 75:'Heavy snow', 77:'Snow grains',
    80:'Showers', 81:'Showers', 82:'Heavy showers',
    85:'Snow showers', 86:'Heavy snow showers',
    95:'Thunderstorm', 96:'Thunderstorm w/ hail', 99:'Thunderstorm w/ hail',
  }
  return MAP[code] ?? 'Unknown'
}

// Parse a YYYY-MM-DD string as local midnight (avoids UTC-shift bug).
function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDayLabel(iso) {
  const date = parseLocalDate(iso)
  const today = new Date(); today.setHours(0,0,0,0)
  if (date.getTime() === today.getTime()) return 'Today'
  return date.toLocaleDateString([], { weekday: 'short' })
}

function sfImage(name, size, tint) {
  const img = SFSymbol.named(name) ?? SFSymbol.named('questionmark')
  const el = stack => {
    const i = stack.addImage(img.image)
    i.imageSize = new Size(size, size)
    if (tint) i.tintColor = tint
    return i
  }
  return el
}

// ── API fetch ─────────────────────────────────────────────────

async function fetchWeather() {
  // URLSearchParams is not available in Scriptable's JavaScriptCore runtime.
  const qs = [
    `latitude=${CONFIG.latitude}`,
    `longitude=${CONFIG.longitude}`,
    `current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m`,
    `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
    `temperature_unit=${CONFIG.temperatureUnit}`,
    `wind_speed_unit=${CONFIG.windSpeedUnit}`,
    `timezone=${encodeURIComponent(CONFIG.timezone)}`,
    `forecast_days=5`,
  ].join('&')
  const req = new Request(`${CONFIG.serverUrl}/api/weather?${qs}`)
  req.timeoutInterval = 10
  return req.loadJSON()
}

// ── Widget: small ─────────────────────────────────────────────

function buildSmall(widget, data) {
  const { current } = data
  const ul = unitSuffix()
  const isDay = current.is_day === 1

  widget.addSpacer()

  // Icon + temperature
  const row = widget.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  sfImage(sfSymbolName(current.weather_code, isDay), 30, COLOR.accent)(row)
  row.addSpacer(6)
  const t = row.addText(`${Math.round(current.temperature_2m)}${ul}`)
  t.font = Font.boldSystemFont(30)
  t.textColor = COLOR.primary

  widget.addSpacer(4)

  const loc = widget.addText(CONFIG.locationName)
  loc.font = Font.mediumSystemFont(11)
  loc.textColor = COLOR.secondary

  const cond = widget.addText(wmoDescription(current.weather_code))
  cond.font = Font.systemFont(10)
  cond.textColor = COLOR.secondary

  const fl = widget.addText(`Feels ${Math.round(current.apparent_temperature)}${ul}`)
  fl.font = Font.systemFont(10)
  fl.textColor = COLOR.secondary

  widget.addSpacer()
}

// ── Widget: medium ────────────────────────────────────────────

function buildMedium(widget, data) {
  const { current, daily } = data
  const ul = unitSuffix()
  const isDay = current.is_day === 1

  const root = widget.addStack()
  root.layoutHorizontally()

  // ── Left: current ──────────────────────────────
  const left = root.addStack()
  left.layoutVertically()
  left.size = new Size(148, 0)

  left.addSpacer()

  const iconRow = left.addStack()
  iconRow.layoutHorizontally()
  iconRow.centerAlignContent()
  sfImage(sfSymbolName(current.weather_code, isDay), 38, COLOR.accent)(iconRow)
  iconRow.addSpacer(6)
  const temp = iconRow.addText(`${Math.round(current.temperature_2m)}${ul}`)
  temp.font = Font.boldSystemFont(36)
  temp.textColor = COLOR.primary

  left.addSpacer(3)

  const locText = left.addText(CONFIG.locationName)
  locText.font = Font.mediumSystemFont(12)
  locText.textColor = COLOR.secondary

  const condText = left.addText(wmoDescription(current.weather_code))
  condText.font = Font.systemFont(11)
  condText.textColor = COLOR.secondary

  const flText = left.addText(`Feels like ${Math.round(current.apparent_temperature)}${ul}`)
  flText.font = Font.systemFont(10)
  flText.textColor = COLOR.secondary

  left.addSpacer()

  // ── Divider ────────────────────────────────────
  root.addSpacer(10)
  const divStack = root.addStack()
  divStack.backgroundColor = COLOR.divider
  divStack.size = new Size(1, 90)
  root.addSpacer(10)

  // ── Right: daily forecast ──────────────────────
  const right = root.addStack()
  right.layoutVertically()

  // Filter to today + future, show up to 4 days
  const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
  const futureDays = daily.time
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => parseLocalDate(t) >= todayMidnight)
    .slice(0, 4)

  right.addSpacer()

  for (const { t, i } of futureDays) {
    const row = right.addStack()
    row.layoutHorizontally()
    row.centerAlignContent()

    // Day name
    const dayLabel = row.addText(formatDayLabel(t))
    dayLabel.font = Font.systemFont(11)
    dayLabel.textColor = COLOR.secondary
    dayLabel.minimumScaleFactor = 0.8

    row.addSpacer(4)

    // Icon
    sfImage(sfSymbolName(daily.weather_code[i]), 13, COLOR.accent)(row)

    row.addSpacer()

    // Rain probability (hidden when 0 to avoid clutter)
    const rain = daily.precipitation_probability_max[i]
    if (rain > 0) {
      const rainText = row.addText(`${rain}%`)
      rainText.font = Font.systemFont(10)
      rainText.textColor = COLOR.rain
    } else {
      const placeholder = row.addText('')
      placeholder.minimumScaleFactor = 1
    }

    row.addSpacer(6)

    // Hi / Lo
    const hi = row.addText(String(Math.round(daily.temperature_2m_max[i])))
    hi.font = Font.mediumSystemFont(11)
    hi.textColor = COLOR.primary

    const slash = row.addText('/')
    slash.font = Font.systemFont(11)
    slash.textColor = COLOR.secondary

    const lo = row.addText(`${Math.round(daily.temperature_2m_min[i])}${ul}`)
    lo.font = Font.systemFont(11)
    lo.textColor = COLOR.secondary

    if (i < futureDays[futureDays.length - 1].i) right.addSpacer(5)
  }

  right.addSpacer()
}

// ── Entry point ───────────────────────────────────────────────

const widget = new ListWidget()
widget.backgroundColor = COLOR.bg
widget.setPadding(14, 16, 14, 16)

try {
  const data = await fetchWeather()
  const family = config.widgetFamily ?? 'medium'

  if (family === 'small') {
    buildSmall(widget, data)
  } else {
    buildMedium(widget, data)
  }
} catch (e) {
  // Show error inline so the widget doesn't just go blank.
  widget.addSpacer()
  const errText = widget.addText(`Cannot connect to\n${CONFIG.serverUrl}`)
  errText.font = Font.systemFont(11)
  errText.textColor = COLOR.secondary
  errText.centerAlignText()
  const detail = widget.addText(String(e.message ?? e))
  detail.font = Font.systemFont(9)
  detail.textColor = new Color('#ef4444')
  detail.centerAlignText()
  widget.addSpacer()
}

Script.setWidget(widget)

// Preview in-app when running manually (comment out if not needed).
await widget.presentMedium()
