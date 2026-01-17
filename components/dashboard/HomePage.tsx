import React, { useMemo } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useWeatherForEvents } from '../../hooks/useWeatherForEvents';
import { EventCarousel } from './EventCarousel';

export const HomePage: React.FC = () => {
  // Get upcoming events (today + next 16 days) - memoize to prevent infinite loops
  // 16 days to stay within forecast limits while showing all upcoming events
  const { startOfToday, sixteenDaysFromNow } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setDate(end.getDate() + 16); // 16 days from today
    end.setHours(23, 59, 59, 999);
    
    return { startOfToday: start, sixteenDaysFromNow: end };
  }, []); // Empty deps - only calculate once per day

  const { events, loading: eventsLoading, error: eventsError } = useCalendarEvents(startOfToday, sixteenDaysFromNow);
  const { eventsWithWeather, loading: weatherLoading } = useWeatherForEvents(events);

  const isLoading = eventsLoading || weatherLoading;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 pb-24">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-black/50" size={32} />
          <p className="text-[16px] font-bold text-black/60">Loading upcoming events...</p>
        </div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 pb-24">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 text-black/30" size={48} />
          <p className="text-[16px] font-bold text-black mb-2">Couldn't load events</p>
          <p className="text-[14px] font-medium text-black/60">
            {eventsError}
          </p>
        </div>
      </div>
    );
  }

  // Limit to next 2-3 events only
  const nextEvents = eventsWithWeather.slice(0, 3);

  if (nextEvents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 pb-24">
        <div className="text-center">
          <Calendar className="mx-auto mb-4 text-black/30" size={48} />
          <p className="text-[16px] font-bold text-black mb-2">No upcoming events</p>
          <p className="text-[14px] font-medium text-black/60">
            No events scheduled in the next 2 days. Your calendar events will appear here with weather forecasts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
      <div className="px-8 pt-4 pb-2 shrink-0">
        <h1 className="text-[24px] mobile-lg:text-[28px] font-black text-black leading-tight">
          Your Next Event
        </h1>
      </div>
      <div className="flex-1 min-h-0">
        <EventCarousel events={nextEvents} />
      </div>
    </div>
  );
};
