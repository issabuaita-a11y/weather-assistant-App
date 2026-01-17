import React from 'react';
import { MapPin } from 'lucide-react';
import { EnrichedEvent } from '../../hooks/useWeatherForEvents';
import { DailyForecast } from '../../types/weather';

interface TripCardProps {
  event: EnrichedEvent;
  forecast: DailyForecast[];
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return '';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (startStr === endStr) return startStr;
  return `${startStr} - ${endStr}`;
}

export const TripCard: React.FC<TripCardProps> = ({ event, forecast }) => {
  // Handle empty forecast gracefully instead of returning null
  const highTemps = forecast.length > 0 ? forecast.map(f => f.high) : [];
  const lowTemps = forecast.length > 0 ? forecast.map(f => f.low) : [];
  const maxHigh = highTemps.length > 0 ? Math.max(...highTemps) : null;
  const minLow = lowTemps.length > 0 ? Math.min(...lowTemps) : null;
  const hasRain = forecast.some(f => f.precipitation > 50);

  const packingSuggestions: string[] = [];
  if (maxHigh !== null && minLow !== null) {
    if (maxHigh - minLow > 20) {
      packingSuggestions.push(`Pack layers (${minLow}-${maxHigh}°F range)`);
    }
    if (minLow < 50) {
      packingSuggestions.push('Pack warm clothing');
    }
    if (maxHigh > 80) {
      packingSuggestions.push('Pack light, breathable clothing');
    }
  }
  if (hasRain) {
    packingSuggestions.push('Bring rain jacket (rain expected)');
  }

  return (
    <div className="bg-gradient-to-br from-[#F3E8FF] via-[#E9D5FF] to-[#D8B4FE] rounded-[24px] p-5 mb-4 shadow-lg border border-white/30">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[20px] mobile-lg:text-[22px] font-black text-black leading-tight mb-1">
          {event.summary}
        </h2>
        <p className="text-[14px] font-bold text-black/60 mb-2">
          {formatDateRange(event.start.dateTime || event.start.date, event.end?.dateTime || event.end?.date)}
        </p>
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-black/50" />
            <span className="text-[13px] font-medium text-black/60">{event.location}</span>
          </div>
        )}
      </div>

      {/* Temperature Summary */}
      {maxHigh !== null && minLow !== null ? (
        <div className="mb-4 p-3 bg-white/40 backdrop-blur-sm rounded-[16px] border border-white/50">
          <div className="text-[14px] font-bold text-black/60 mb-1">Temperature Range</div>
          <div className="text-[24px] font-black text-black">
            {minLow}° - {maxHigh}°F
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-white/40 backdrop-blur-sm rounded-[16px] border border-white/50">
          <div className="text-[14px] font-bold text-black/60 mb-1">Weather Forecast</div>
          <div className="text-[14px] font-medium text-black/60">Loading forecast...</div>
        </div>
      )}

      {/* Packing Suggestions */}
      {packingSuggestions.length > 0 && (
        <div>
          <div className="text-[13px] font-bold text-black/60 mb-2">Packing Suggestions</div>
          <ul className="space-y-1.5">
            {packingSuggestions.map((suggestion, idx) => (
              <li key={idx} className="text-[13px] font-medium text-black/80 flex items-start gap-2">
                <span className="text-black/40">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
