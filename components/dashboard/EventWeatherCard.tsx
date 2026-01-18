import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, CloudRain, Sun, CloudSun, Sunrise, Wind, Droplets, Activity, Eye, Gauge } from 'lucide-react';
import { EnrichedEvent } from '../../hooks/useWeatherForEvents';
import { SmartSuggestionChip } from './SmartSuggestionChip';
import { WeatherMetricBadge } from './WeatherMetricBadge';
import { WeatherFeatures } from '../../types';
import { INITIAL_ONBOARDING_DATA } from '../../constants';
import { HourlyForecast } from '../../types/weather';

const STORAGE_KEY = 'weather_app_onboarding_v2';

// Gradient themes - distinct colors that contrast with blue background
// Avoid blue cards on blue background - use peach, purple, green
const cardGradients = [
  'bg-gradient-to-br from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]', // Peach/Orange (Card 1)
  'bg-gradient-to-br from-[#F3E8FF] via-[#E9D5FF] to-[#D8B4FE]', // Purple/Pink (Card 2)
  'bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#86EFAC]', // Green/Teal (Card 3)
  'bg-gradient-to-br from-[#FED7AA] via-[#FDBA74] to-[#FB923C]', // Orange (darker) (Card 4)
];

function getWeatherIcon(condition: string, size: number = 20) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('storm')) {
    return <CloudRain size={size} className="text-black" />;
  }
  if (lower.includes('clear') || lower.includes('sunny')) {
    return <Sun size={size} className="text-black" />;
  }
  if (lower.includes('cloud')) {
    return <CloudSun size={size} className="text-black" />;
  }
  return <Cloud size={size} className="text-black" />;
}

function formatDateAndTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysDiff = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dateLabel = '';
    if (daysDiff === 0) {
      dateLabel = 'Today';
    } else if (daysDiff === 1) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dateLabel}, ${time}`;
  } catch {
    return '';
  }
}

function formatTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return '';
  }
}

// Helper function to get weather for a specific time from hourly forecast
function getWeatherAtTime(hourlyForecast: HourlyForecast[], targetTime: Date): HourlyForecast | null {
  if (hourlyForecast.length === 0) return null;
  
  // Find the closest hour to target time
  const targetTimestamp = targetTime.getTime();
  let closest = hourlyForecast[0];
  let minDiff = Math.abs(new Date(closest.time).getTime() - targetTimestamp);
  
  for (const hour of hourlyForecast) {
    const diff = Math.abs(new Date(hour.time).getTime() - targetTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = hour;
    }
  }
  
  return closest;
}

// Helper function to get reason text for a suggestion
function getSuggestionReason(suggestion: { text: string; icon: string }, weather: WeatherData, hourlyForecast: HourlyForecast[]): string {
  const text = suggestion.text.toLowerCase();
  const icon = suggestion.icon;
  
  // Temperature/feels like (🧥, 👕, sweater, jacket, coat, warm, cold, cooler, warmer)
  if (icon.includes('🧥') || icon.includes('👕') || text.includes('coat') || text.includes('jacket') || 
      text.includes('sweater') || text.includes('warm') || text.includes('colder') || text.includes('warmer') ||
      text.includes('cooler') || text.includes('layers')) {
    if (weather.feelsLike !== undefined && Math.abs(weather.feelsLike - weather.temp) > 5) {
      return `feels like ${weather.feelsLike}°F`;
    }
    return `${weather.temp}°F`;
  }
  
  // UV (☀️, 😎, sunscreen, sunglasses, uv)
  if (icon.includes('☀️') || icon.includes('😎') || text.includes('sunscreen') || text.includes('sunglasses') || text.includes('uv')) {
    if (weather.uv !== undefined) {
      return `UV index: ${weather.uv}`;
    }
  }
  
  // Rain/umbrella (☂️, 🌂, umbrella, rain)
  if (icon.includes('☂️') || icon.includes('🌂') || text.includes('umbrella') || text.includes('rain') || text.includes('waterproof')) {
    if (weather.precipitation > 0) {
      return `${weather.precipitation}% chance of rain`;
    }
  }
  
  // Wind (💨, wind, loose items, windy)
  if (icon.includes('💨') || text.includes('wind') || text.includes('loose items') || text.includes('windy')) {
    if (weather.wind !== undefined) {
      return `wind: ${weather.wind} mph`;
    }
  }
  
  // Air quality (😷, air quality, mask, unhealthy)
  if (icon.includes('😷') || text.includes('air quality') || text.includes('mask') || text.includes('unhealthy')) {
    if (weather.airQuality !== undefined) {
      return `AQI: ${weather.airQuality}`;
    }
  }
  
  // Visibility (🚗, visibility, drive, travel)
  if (icon.includes('🚗') || text.includes('visibility') || text.includes('drive') || text.includes('travel')) {
    if (weather.visibility !== undefined) {
      return `visibility: ${weather.visibility} mi`;
    }
  }
  
  // Hydration (💧, hydrated, hydration)
  if (icon.includes('💧') && (text.includes('hydrated') || text.includes('hydration'))) {
    if (weather.temp > 80) {
      return `${weather.temp}°F`;
    }
  }
  
  return '';
}

export const EventWeatherCard: React.FC<{ event: EnrichedEvent; index: number }> = ({ event, index }) => {
  const [weatherFeatures, setWeatherFeatures] = useState<WeatherFeatures>(INITIAL_ONBOARDING_DATA.weatherFeatures);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setWeatherFeatures(data?.weatherFeatures || INITIAL_ONBOARDING_DATA.weatherFeatures);
      }
    } catch (error) {
      console.error('Failed to read weather features from localStorage:', error);
    }
  }, []);

  const gradient = cardGradients[index % cardGradients.length];
  const weather = event.weather;
  const hourlyForecast = event.hourlyForecast || [];

  // Calculate "when you leave" time (1-2 hours before event)
  const eventStartTime = event.start.dateTime 
    ? new Date(event.start.dateTime)
    : event.start.date 
    ? new Date(event.start.date + 'T12:00:00')
    : new Date();
  
  const eventEndTime = event.end?.dateTime
    ? new Date(event.end.dateTime)
    : event.end?.date
    ? new Date(event.end.date + 'T17:00:00')
    : new Date(eventStartTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

  // Calculate departure time (1.5 hours before event, or 1 hour if less than 2 hours away)
  const now = new Date();
  const hoursUntilEvent = (eventStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const departureHoursBefore = hoursUntilEvent >= 2 ? 1.5 : 1;
  const departureTime = new Date(eventStartTime.getTime() - departureHoursBefore * 60 * 60 * 1000);
  
  // Get weather at departure time
  const departureWeather = getWeatherAtTime(hourlyForecast, departureTime);

  return (
    <div className={`${gradient} rounded-[24px] p-4 pb-5 shadow-lg border border-white/30 w-full h-auto flex flex-col overflow-x-hidden`}>
      {/* Event Header */}
      <div className="mb-4">
        <h2 className="text-[16px] mobile-lg:text-[18px] font-black text-black leading-tight mb-1">
          {event.summary}
        </h2>
        <p className="text-[13px] font-bold text-black/60">
          {formatDateAndTime(event.start.dateTime || event.start.date)}
        </p>
        {event.location && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin size={14} className="text-black/50" />
            <span className="text-[12px] font-medium text-black/60">{event.location}</span>
          </div>
        )}
      </div>

      {weather ? (
        <>
          {/* WHEN YOU LEAVE SECTION - Show weather FIRST */}
          {departureWeather && (
            <div className="mb-3 p-3 bg-white/40 backdrop-blur-sm rounded-[16px] border border-white/50">
              <div className="text-[12px] font-bold text-black/70 mb-2">
                {hoursUntilEvent >= 2 
                  ? `When You Leave (${formatTime(departureTime.toISOString())})`
                  : `Heading Out (${Math.round(hoursUntilEvent * 60)} min before)`
                }
              </div>
              <div className="flex items-center gap-3 mb-2">
                {getWeatherIcon(departureWeather.condition, 24)}
                <div>
                  <div className="text-[20px] font-black text-black leading-none">
                    {departureWeather.temp}°
                  </div>
                  <div className="text-[12px] font-bold text-black/70">{departureWeather.condition}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {weatherFeatures.uvIndex && departureWeather.uv !== undefined && (
                  <WeatherMetricBadge
                    icon={<Sun size={14} />}
                    label="UV"
                    value={departureWeather.uv.toString()}
                  />
                )}
                {weatherFeatures.windSpeed && departureWeather.wind !== undefined && (
                  <WeatherMetricBadge
                    icon={<Wind size={14} />}
                    label="Wind"
                    value={`${departureWeather.wind} mph`}
                  />
                )}
                {weatherFeatures.precipitation && departureWeather.precipitation > 0 && (
                  <WeatherMetricBadge
                    icon={<CloudRain size={14} />}
                    label="Rain"
                    value={`${departureWeather.precipitation}%`}
                  />
                )}
              </div>
            </div>
          )}

          {/* SMART TIPS SECTION - Show tips SECOND (based on weather above) */}
          {event.suggestions.length > 0 && (
            <div className="mb-3 p-3 bg-white/40 backdrop-blur-sm rounded-[16px] border border-white/50">
              <div className="text-[12px] font-bold text-black/70 mb-2 flex items-center gap-2">
                <span className="text-[14px]">💡</span>
                <span>What to Bring</span>
              </div>
              <div className="space-y-2.5">
                {event.suggestions.slice(0, 4).map((suggestion, idx) => {
                  const reason = getSuggestionReason(suggestion, weather, hourlyForecast);
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-[20px] mt-0.5">{suggestion.icon}</span>
                      <div className="flex-1 pt-0.5">
                        <div className="text-[14px] font-bold text-black leading-snug">
                          {suggestion.text}
                          {reason && (
                            <span className="text-[12px] font-medium text-black/60 ml-1.5">
                              ({reason})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-[14px] font-medium text-black/50">Weather data unavailable</p>
        </div>
      )}
    </div>
  );
};
