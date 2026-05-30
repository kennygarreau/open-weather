import type { WeatherResponse } from './types';

const BASE_URL = 'https://api.open-meteo.com/v1';

export interface WeatherRequestOptions {
	latitude: number;
	longitude: number;
	temperatureUnit?: 'celsius' | 'fahrenheit';
	windSpeedUnit?: 'kmh' | 'mph' | 'ms' | 'kn';
	precipitationUnit?: 'mm' | 'inch';
	timezone?: string;
}

export const CURRENT_FIELDS = [
	'temperature_2m',
	'relative_humidity_2m',
	'apparent_temperature',
	'precipitation',
	'weather_code',
	'wind_speed_10m',
	'wind_direction_10m',
	'uv_index',
	'is_day'
];

export const HOURLY_FIELDS = [
	'temperature_2m',
	'relative_humidity_2m',
	'precipitation_probability',
	'weather_code',
	'wind_speed_10m',
	'is_day'
];

export const DAILY_FIELDS = [
	'weather_code',
	'temperature_2m_max',
	'temperature_2m_min',
	'precipitation_sum',
	'precipitation_probability_max',
	'wind_speed_10m_max',
	'sunrise',
	'sunset'
];

export function tempUnitLabel(unit: string): string {
	return unit === 'fahrenheit' ? '°F' : '°C';
}

export function windUnitLabel(unit: string): string {
	return unit === 'mph' ? 'mph' : unit === 'ms' ? 'm/s' : 'km/h';
}

export function precipUnitLabel(unit: string): string {
	return unit === 'inch' ? 'in' : 'mm';
}

const CARDINAL_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function windCardinal(deg: number): string {
	return CARDINAL_DIRS[Math.round(deg / 45) % 8];
}

export async function fetchWeather(
	opts: WeatherRequestOptions,
	baseUrl = BASE_URL
): Promise<WeatherResponse> {
	const params = new URLSearchParams({
		latitude: String(opts.latitude),
		longitude: String(opts.longitude),
		current: CURRENT_FIELDS.join(','),
		hourly: HOURLY_FIELDS.join(','),
		daily: DAILY_FIELDS.join(','),
		temperature_unit: opts.temperatureUnit ?? 'celsius',
		wind_speed_unit: opts.windSpeedUnit ?? 'kmh',
		precipitation_unit: opts.precipitationUnit ?? 'mm',
		timezone: opts.timezone ?? 'auto',
		forecast_days: '7'
	});

	const res = await fetch(`${baseUrl}/forecast?${params}`);
	if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);

	return res.json();
}

const WMO_DESCRIPTIONS: Record<number, string> = {
	0: 'Clear sky',
	1: 'Mainly clear',
	2: 'Partly cloudy',
	3: 'Overcast',
	45: 'Fog',
	48: 'Icy fog',
	51: 'Light drizzle',
	53: 'Moderate drizzle',
	55: 'Dense drizzle',
	61: 'Slight rain',
	63: 'Moderate rain',
	65: 'Heavy rain',
	71: 'Slight snow',
	73: 'Moderate snow',
	75: 'Heavy snow',
	77: 'Snow grains',
	80: 'Slight showers',
	81: 'Moderate showers',
	82: 'Violent showers',
	85: 'Slight snow showers',
	86: 'Heavy snow showers',
	95: 'Thunderstorm',
	96: 'Thunderstorm with hail',
	99: 'Thunderstorm with heavy hail'
};

/** Map WMO weather code to a human-readable description. */
export function describeWeatherCode(code: number): string {
	return WMO_DESCRIPTIONS[code] ?? 'Unknown';
}

/** Map WMO weather code to a simple emoji icon.
 *  Uses only U+1F000+ code points — avoids the white-box rendering bug that
 *  affects variation-selector emoji (☀️ ☁️ ❄️ ⛈️) on Linux.
 */
export function weatherIcon(code: number, isDay = true): string {
	if (code === 0) return isDay ? '🌞' : '🌙';
	if (code <= 2) return isDay ? '🌤' : '🌤';
	if (code === 3) return '🌥';
	if (code <= 48) return '🌫';
	if (code <= 55) return '🌦';
	if (code <= 65) return '🌧';
	if (code <= 77) return '🌨';
	if (code <= 82) return '🌦';
	if (code <= 86) return '🌨';
	return '🌩';
}
