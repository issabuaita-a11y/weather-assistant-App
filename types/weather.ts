export interface WeatherData {
  temp: number; // Temperature in Fahrenheit
  condition: string; // e.g., "Partly Cloudy", "Sunny", "Rainy"
  precipitation: number; // Precipitation probability (0-100)
  uv?: number; // UV Index
  wind?: number; // Wind speed in mph
  humidity?: number; // Humidity percentage (0-100)
  sunrise?: string; // Sunrise time (e.g., "6:30 AM")
  sunset?: string; // Sunset time (e.g., "7:45 PM")
  airQuality?: number; // Air Quality Index (AQI)
  visibility?: number; // Visibility in miles
  feelsLike?: number; // "Feels like" temperature in Fahrenheit
}

export interface HourlyForecast {
  time: string; // ISO timestamp
  temp: number;
  condition: string;
  precipitation: number;
  uv?: number;
  wind?: number;
  humidity?: number;
  airQuality?: number; // Air Quality Index (AQI)
  visibility?: number; // Visibility in miles
  feelsLike?: number; // "Feels like" temperature in Fahrenheit
}

export interface DailyForecast {
  date: string; // ISO date string
  high: number; // High temperature
  low: number; // Low temperature
  condition: string;
  precipitation: number; // Precipitation probability
  uv?: number;
  wind?: number;
  humidity?: number;
  airQuality?: number; // Air Quality Index (AQI)
  visibility?: number; // Visibility in miles
  feelsLike?: number; // "Feels like" temperature in Fahrenheit
}
