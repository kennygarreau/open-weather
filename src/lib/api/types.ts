export interface GeocodingResult {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	country: string;
	country_code: string;
	admin1?: string;
	timezone: string;
}

export interface CurrentWeatherData {
	time: string;
	temperature_2m: number;
	relative_humidity_2m: number;
	apparent_temperature: number;
	precipitation: number;
	weather_code: number;
	wind_speed_10m: number;
	wind_direction_10m: number;
	is_day: number;
}

export interface HourlyWeatherData {
	time: string[];
	temperature_2m: number[];
	relative_humidity_2m: number[];
	precipitation_probability: number[];
	weather_code: number[];
	wind_speed_10m: number[];
	is_day: number[];
}

export interface DailyWeatherData {
	time: string[];
	weather_code: number[];
	temperature_2m_max: number[];
	temperature_2m_min: number[];
	precipitation_sum: number[];
	precipitation_probability_max: number[];
	wind_speed_10m_max: number[];
	sunrise: string[];
	sunset: string[];
}

export interface WeatherResponse {
	latitude: number;
	longitude: number;
	timezone: string;
	current: CurrentWeatherData;
	hourly: HourlyWeatherData;
	daily: DailyWeatherData;
}

/**
 * Maps our normalized field names to keys in the station's JSON response.
 * Supports dot-notation for nested values, e.g. "data.sensors.temp_f".
 */
export interface StationFieldMap {
	temperature?: string;
	humidity?: string;
	pressure?: string;
	windSpeed?: string;
	windDirection?: string;
	precipitation?: string;
}

export interface StationConfig {
	id: string;
	name: string;
	url: string;
	fieldMap: StationFieldMap;
}

export interface StationObservation {
	fetchedAt: string;
	temperature?: number;
	humidity?: number;
	pressure?: number;
	windSpeed?: number;
	windDirection?: number;
	precipitation?: number;
}
