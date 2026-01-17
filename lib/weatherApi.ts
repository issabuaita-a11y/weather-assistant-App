import { WeatherData, HourlyForecast, DailyForecast } from '../types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather condition description from weather code
 * Open-Meteo uses WMO weather codes
 */
function getWeatherCondition(code: number): string {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Partly Cloudy';
}

/**
 * Convert Celsius to Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}

/**
 * Get hourly weather forecast array from now until event end
 * Returns array of hourly data points
 */
export async function getHourlyForecastArray(
  lat: number,
  lon: number,
  eventStart: Date,
  eventEnd: Date
): Promise<HourlyForecast[]> {
  try {
    const now = new Date();
    // Start from 1-2 hours before event, or now if event is soon
    const startTime = new Date(Math.max(
      eventStart.getTime() - 2 * 60 * 60 * 1000, // 2 hours before
      now.getTime()
    ));
    
    const startDate = new Date(startTime);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(eventEnd);
    endDate.setHours(23, 59, 59, 999);

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'temperature_2m,precipitation_probability,weather_code,uv_index,wind_speed_10m,relative_humidity_2m,apparent_temperature,visibility',
      timezone: 'America/New_York',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.hourly || !data.hourly.time) {
      return [];
    }

    const times = data.hourly.time as string[];
    const hourlyData: HourlyForecast[] = [];

    // Filter to only include hours from startTime to eventEnd
    for (let i = 0; i < times.length; i++) {
      const hourTime = new Date(times[i]);
      if (hourTime >= startTime && hourTime <= eventEnd) {
        const temp = celsiusToFahrenheit(data.hourly.temperature_2m[i]);
        const condition = getWeatherCondition(data.hourly.weather_code[i]);
        const precipitation = data.hourly.precipitation_probability[i] || 0;
        const uv = data.hourly.uv_index?.[i];
        const wind = data.hourly.wind_speed_10m?.[i] ? 
          Math.round(data.hourly.wind_speed_10m[i] * 2.237) : undefined;
        const humidity = data.hourly.relative_humidity_2m?.[i];
        const feelsLike = data.hourly.apparent_temperature?.[i] ? 
          celsiusToFahrenheit(data.hourly.apparent_temperature[i]) : undefined;
        const visibility = data.hourly.visibility?.[i] ? 
          Math.round(data.hourly.visibility[i] * 0.621371) : undefined; // Convert km to miles

        hourlyData.push({
          time: times[i],
          temp,
          condition,
          precipitation,
          uv,
          wind,
          humidity,
          feelsLike,
          visibility,
        });
      }
    }

    return hourlyData;
  } catch (error) {
    console.error('Failed to fetch hourly forecast array:', error);
    return [];
  }
}

/**
 * Get current weather (right now)
 */
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData | null> {
  try {
    const now = new Date();
    return await getHourlyForecast(lat, lon, now);
  } catch (error) {
    console.error('Failed to fetch current weather:', error);
    return null;
  }
}

/**
 * Get hourly weather forecast for a specific location and time
 */
export async function getHourlyForecast(
  lat: number,
  lon: number,
  date: Date
): Promise<WeatherData | null> {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'temperature_2m,precipitation_probability,weather_code,uv_index,wind_speed_10m,relative_humidity_2m,apparent_temperature,visibility',
      timezone: 'America/New_York',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.hourly || !data.hourly.time) {
      return null;
    }

    // Find the closest hour to the requested time
    const targetTime = date.toISOString();
    const times = data.hourly.time as string[];
    const targetIndex = times.findIndex(time => time >= targetTime);
    const index = targetIndex >= 0 ? targetIndex : times.length - 1;

    const temp = celsiusToFahrenheit(data.hourly.temperature_2m[index]);
    const condition = getWeatherCondition(data.hourly.weather_code[index]);
    const precipitation = data.hourly.precipitation_probability[index] || 0;
    const uv = data.hourly.uv_index?.[index];
    const wind = data.hourly.wind_speed_10m?.[index] ? 
      Math.round(data.hourly.wind_speed_10m[index] * 2.237) : undefined; // Convert m/s to mph
    const humidity = data.hourly.relative_humidity_2m?.[index];
    const feelsLike = data.hourly.apparent_temperature?.[index] ? 
      celsiusToFahrenheit(data.hourly.apparent_temperature[index]) : undefined;
    const visibility = data.hourly.visibility?.[index] ? 
      Math.round(data.hourly.visibility[index] * 0.621371) : undefined; // Convert km to miles

    return {
      temp,
      condition,
      precipitation,
      uv,
      wind,
      humidity,
      feelsLike,
      visibility,
    };
  } catch (error) {
    console.error('Failed to fetch hourly forecast:', error);
    return null;
  }
}

/**
 * Get daily weather forecast for the next N days
 */
export async function getDailyForecast(
  lat: number,
  lon: number,
  days: number = 7
): Promise<DailyForecast[] | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability,weather_code,uv_index_max,wind_speed_10m_max,relative_humidity_2m_max',
      timezone: 'America/New_York',
      forecast_days: days.toString(),
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.daily || !data.daily.time) {
      return null;
    }

    const forecasts: DailyForecast[] = [];
    const dates = data.daily.time as string[];
    
    for (let i = 0; i < dates.length && i < days; i++) {
      const high = celsiusToFahrenheit(data.daily.temperature_2m_max[i]);
      const low = celsiusToFahrenheit(data.daily.temperature_2m_min[i]);
      const condition = getWeatherCondition(data.daily.weather_code[i]);
      const precipitation = data.daily.precipitation_probability[i] || 0;
      const uv = data.daily.uv_index_max?.[i];
      const wind = data.daily.wind_speed_10m_max?.[i] ? 
        Math.round(data.daily.wind_speed_10m_max[i] * 2.237) : undefined; // Convert m/s to mph
      const humidity = data.daily.relative_humidity_2m_max?.[i];

      forecasts.push({
        date: dates[i],
        high,
        low,
        condition,
        precipitation,
        uv,
        wind,
        humidity,
      });
    }

    return forecasts;
  } catch (error) {
    console.error('Failed to fetch daily forecast:', error);
    return null;
  }
}
