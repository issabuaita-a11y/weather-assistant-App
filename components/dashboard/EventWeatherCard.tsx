import React, { useState, useEffect } from 'react';
import { MapPin, Gauge, Sun, CloudRain, Wind, Droplets, Sunrise, Activity, Eye } from 'lucide-react';
import { EnrichedEvent } from '../../hooks/useWeatherForEvents';
import { WeatherFeatures } from '../../types';
import { INITIAL_ONBOARDING_DATA } from '../../constants';

const STORAGE_KEY = 'weather_app_onboarding_v2';

// Gradient themes - distinct colors that contrast with blue background
// Avoid blue cards on blue background - use peach, purple, green
const cardGradients = [
  'bg-gradient-to-br from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]', // Peach/Orange (Card 1)
  'bg-gradient-to-br from-[#F3E8FF] via-[#E9D5FF] to-[#D8B4FE]', // Purple/Pink (Card 2)
  'bg-gradient-to-br from-[#DCFCE7] via-[#BBF7D0] to-[#86EFAC]', // Green/Teal (Card 3)
  'bg-gradient-to-br from-[#FED7AA] via-[#FDBA74] to-[#FB923C]', // Orange (darker) (Card 4)
];

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

// Helper function to get feels like smart tips (max 2)
function getFeelsLikeTips(feelsLike: number): string[] {
  const tips: string[] = [];
  if (feelsLike < 32) {
    tips.push('🧥 Bundle up - jacket needed');
    tips.push('🧤 Wear gloves and scarf');
  } else if (feelsLike < 45) {
    tips.push('🧥 Dress warmly - cold outside');
    tips.push('👔 Layer clothing for warmth');
  } else if (feelsLike < 60) {
    tips.push('🧥 Light jacket recommended');
  } else if (feelsLike < 75) {
    tips.push('✅ Comfortable temperature');
  } else if (feelsLike < 85) {
    tips.push('👕 Warm - light clothing');
  } else {
    tips.push('🔥 Hot - stay cool');
    tips.push('💧 Stay hydrated');
  }
  return tips.slice(0, 2);
}

// Helper function to get UV smart tips (max 2)
function getUVTips(uv: number): string[] {
  const tips: string[] = [];
  if (uv >= 8) {
    tips.push('⚠️ Very high UV - avoid sun');
    tips.push('🧴 Wear sunscreen and hat');
  } else if (uv >= 6) {
    tips.push('☀️ High UV - wear sunscreen');
  } else if (uv >= 3) {
    tips.push('😎 Moderate UV - some protection needed');
  } else {
    tips.push('✅ Low UV - minimal protection needed');
  }
  return tips.slice(0, 2);
}

// Helper function to get precipitation smart tips (max 2)
function getPrecipitationTips(precipitation: number): string[] {
  const tips: string[] = [];
  if (precipitation === 0) {
    tips.push('☀️ No rain expected');
    tips.push('☔ Umbrella not needed');
  } else if (precipitation < 30) {
    tips.push('🌦️ Light rain possible');
    tips.push('☂️ Consider bringing umbrella');
  } else if (precipitation < 60) {
    tips.push('🌧️ Moderate rain likely');
    tips.push('☂️ Bring umbrella');
  } else {
    tips.push('⛈️ Heavy rain expected');
    tips.push('☂️ Definitely bring umbrella');
  }
  return tips.slice(0, 2);
}

// Helper function to get wind smart tips (max 2)
function getWindTips(wind: number): string[] {
  const tips: string[] = [];
  if (wind < 10) {
    tips.push('🍃 Calm conditions');
  } else if (wind < 20) {
    tips.push('💨 Light breeze');
  } else if (wind < 30) {
    tips.push('💨 Moderate wind');
    tips.push('📌 Secure loose items');
  } else {
    tips.push('🌪️ Strong wind');
    tips.push('⚠️ Be cautious outdoors');
  }
  return tips.slice(0, 2);
}

// Helper function to get humidity smart tips (max 2)
function getHumidityTips(humidity: number): string[] {
  const tips: string[] = [];
  if (humidity < 30) {
    tips.push('🏜️ Dry air');
    tips.push('💧 Stay hydrated');
  } else if (humidity < 60) {
    tips.push('✅ Comfortable humidity');
  } else if (humidity < 80) {
    tips.push('💨 Moderate humidity');
  } else {
    tips.push('🌫️ High humidity');
    tips.push('😓 May feel muggy');
  }
  return tips.slice(0, 2);
}

// Helper function to get air quality smart tips (max 2)
function getAirQualityTips(aqi: number): string[] {
  const tips: string[] = [];
  if (aqi <= 50) {
    tips.push('✅ Good air quality');
  } else if (aqi <= 100) {
    tips.push('⚠️ Moderate air quality');
  } else if (aqi <= 150) {
    tips.push('😷 Unhealthy for sensitive groups');
    tips.push('🏠 Limit outdoor activity');
  } else {
    tips.push('😷 Unhealthy air quality');
    tips.push('🏠 Avoid outdoor activity');
  }
  return tips.slice(0, 2);
}

// Helper function to get visibility smart tips (max 2)
function getVisibilityTips(visibility: number): string[] {
  const tips: string[] = [];
  if (visibility >= 10) {
    tips.push('👁️ Excellent visibility');
  } else if (visibility >= 5) {
    tips.push('✅ Good visibility');
  } else if (visibility >= 2) {
    tips.push('🌫️ Reduced visibility');
    tips.push('🚗 Drive carefully');
  } else {
    tips.push('🌫️ Poor visibility');
    tips.push('⚠️ Exercise caution');
  }
  return tips.slice(0, 2);
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

  // Build list of all weather category cards based on user preferences and data availability
  const categoryCards = [];
  
  // Feels Like (always show if available)
  if (weather.feelsLike !== undefined) {
    categoryCards.push({
      key: 'feelsLike',
      icon: <Gauge size={18} className="text-black flex-shrink-0" />,
      value: `${weather.feelsLike}°`,
      label: 'Feels Like',
      tips: getFeelsLikeTips(weather.feelsLike),
    });
  }
  
  // UV Index (always show if available)
  if (weather.uv !== undefined) {
    categoryCards.push({
      key: 'uv',
      icon: <Sun size={18} className="text-black flex-shrink-0" />,
      value: `${weather.uv}`,
      label: 'UV Index',
      tips: getUVTips(weather.uv),
    });
  }
  
  // Precipitation (if user preference enabled)
  if (weatherFeatures.precipitation && weather.precipitation !== undefined) {
    categoryCards.push({
      key: 'precipitation',
      icon: <CloudRain size={18} className="text-black flex-shrink-0" />,
      value: `${weather.precipitation}%`,
      label: 'Precipitation',
      tips: getPrecipitationTips(weather.precipitation),
    });
  }
  
  // Wind (if user preference enabled)
  if (weatherFeatures.windSpeed && weather.wind !== undefined) {
    categoryCards.push({
      key: 'wind',
      icon: <Wind size={18} className="text-black flex-shrink-0" />,
      value: `${weather.wind} mph`,
      label: 'Wind',
      tips: getWindTips(weather.wind),
    });
  }
  
  // Humidity (if user preference enabled)
  if (weatherFeatures.humidity && weather.humidity !== undefined) {
    categoryCards.push({
      key: 'humidity',
      icon: <Droplets size={18} className="text-black flex-shrink-0" />,
      value: `${weather.humidity}%`,
      label: 'Humidity',
      tips: getHumidityTips(weather.humidity),
    });
  }
  
  // Sunrise (if user preference enabled)
  if (weatherFeatures.sunriseSunset && weather.sunrise) {
    categoryCards.push({
      key: 'sunrise',
      icon: <Sunrise size={18} className="text-black flex-shrink-0" />,
      value: weather.sunrise,
      label: 'Sunrise',
      tips: [],
    });
  }
  
  // Air Quality (if user preference enabled)
  if (weatherFeatures.airQuality && weather.airQuality !== undefined) {
    categoryCards.push({
      key: 'airQuality',
      icon: <Activity size={18} className="text-black flex-shrink-0" />,
      value: `AQI ${weather.airQuality}`,
      label: 'Air Quality',
      tips: getAirQualityTips(weather.airQuality),
    });
  }
  
  // Visibility (if user preference enabled)
  if (weatherFeatures.visibility && weather.visibility !== undefined) {
    categoryCards.push({
      key: 'visibility',
      icon: <Eye size={18} className="text-black flex-shrink-0" />,
      value: `${weather.visibility} mi`,
      label: 'Visibility',
      tips: getVisibilityTips(weather.visibility),
    });
  }

  // Render a single category card component
  const renderCategoryCard = (category: typeof categoryCards[0]) => (
    <div key={category.key} className="mb-3 p-3 bg-white/50 backdrop-blur-sm rounded-[16px] border border-white/60">
      {/* Icon | Label | Value on same line */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {category.icon}
          <span className="text-[16px] font-bold text-black/70">{category.label}</span>
        </div>
        <div className="text-[18px] font-black text-black leading-none flex-shrink-0">
          {category.value}
        </div>
      </div>
      {category.tips.length > 0 && (
        <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
          {category.tips.map((tip, idx) => {
            // Extract emoji (first character or first few characters) and rest of text
            const emojiMatch = tip.match(/^(\p{Emoji}+)\s*(.*)$/u);
            if (emojiMatch) {
              const [, emoji, text] = emojiMatch;
              return (
                <div key={idx} className="text-[13px] font-normal text-black/65 leading-snug flex items-start gap-1.5">
                  <span className="text-[16px] flex-shrink-0">{emoji}</span>
                  <span>{text}</span>
                </div>
              );
            }
            // Fallback if no emoji found
            return (
              <div key={idx} className="text-[13px] font-normal text-black/65 leading-snug">
                {tip}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div 
      className={`${gradient} rounded-[24px] p-4 pb-5 shadow-lg border border-white/30 w-full h-auto max-h-[calc(100vh-200px)] flex flex-col`}
      style={{ touchAction: 'pan-x pan-y' }}
    >
      {/* Event Header */}
      <div className="mb-3 shrink-0">
        <h2 className="text-[14px] mobile-lg:text-[16px] font-black text-black leading-tight mb-0.5">
          {event.summary}
        </h2>
        <p className="text-[12px] font-medium text-black/60">
          {formatDateAndTime(event.start.dateTime || event.start.date)}
        </p>
        {event.location && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-black/50" />
            <span className="text-[11px] font-medium text-black/60">{event.location}</span>
          </div>
        )}
      </div>

      {/* Scrollable content container - only scrolls if content exceeds max height */}
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-300px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {weather ? (
          <>
            {/* Render all category cards */}
            {categoryCards.map(renderCategoryCard)}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-[14px] font-medium text-black/50">Weather data unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
};
