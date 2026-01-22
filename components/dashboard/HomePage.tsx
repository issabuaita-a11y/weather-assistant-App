import React, { useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useWeatherForEvents } from '../../hooks/useWeatherForEvents';
import { EventCarousel } from './EventCarousel';
import { DateTabs } from './DateTabs';

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Hello"; // Late night/early morning
};

export const HomePage: React.FC = () => {
  // Selected date state - default to today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Get upcoming events (today + next 7 days) - memoize to prevent infinite loops
  // 7 days to fetch upcoming week of events
  const { startOfToday, sevenDaysFromNow } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date();
    end.setDate(end.getDate() + 7); // 7 days from today
    end.setHours(23, 59, 59, 999);
    
    return { startOfToday: start, sevenDaysFromNow: end };
  }, []); // Empty deps - only calculate once per day

  const { events, loading: eventsLoading, error: eventsError } = useCalendarEvents(startOfToday, sevenDaysFromNow);
  const { eventsWithWeather, loading: weatherLoading } = useWeatherForEvents(events);

  // Filter events by selected date and only show upcoming events
  // This hook must be called before any conditional returns to follow Rules of Hooks
  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return eventsWithWeather.filter((event) => {
      // Parse event start time
      const eventStartTime = event.start.dateTime 
        ? new Date(event.start.dateTime)
        : event.start.date 
        ? new Date(event.start.date + 'T00:00:00')
        : null;
      
      if (!eventStartTime) return false;
      
      // Filter 1: Only show events that haven't started yet (upcoming events)
      if (eventStartTime.getTime() <= now.getTime()) {
        return false;
      }
      
      // Filter 2: Only show events for the selected date
      const eventDate = new Date(eventStartTime);
      eventDate.setHours(0, 0, 0, 0);
      
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      return eventDate.getTime() === selected.getTime();
    });
  }, [eventsWithWeather, selectedDate]);

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

  if (filteredEvents.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
        <div className="px-8 pt-4 pb-0 shrink-0">
          <div className="mb-6">
            <h1 className="text-[24px] mobile-lg:text-[28px] font-black text-black leading-tight">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-[14px] mobile-lg:text-[15px] font-medium text-black/60 mt-1">
              Get ready for your day
            </p>
          </div>
        </div>
        <DateTabs selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        <div className="flex-1 flex items-center justify-center px-8 pb-24">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 text-black/30" size={48} />
            <p className="text-[16px] font-bold text-black mb-2">No upcoming events</p>
            <p className="text-[14px] font-medium text-black/60">
              No events scheduled for this day. Your calendar events will appear here with weather forecasts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
      <div className="px-8 pt-4 pb-0 shrink-0">
        <div className="mb-6">
          <h1 className="text-[24px] mobile-lg:text-[28px] font-black text-black leading-tight">
            {getTimeBasedGreeting()}
          </h1>
          <p className="text-[14px] mobile-lg:text-[15px] font-medium text-black/60 mt-1">
            Get ready for your day
          </p>
        </div>
      </div>
      <DateTabs selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <div className="flex-1 min-h-0">
        <EventCarousel events={filteredEvents} />
      </div>
    </div>
  );
};
