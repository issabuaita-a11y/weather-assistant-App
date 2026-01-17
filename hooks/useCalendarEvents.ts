import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { fetchCalendarEvents } from '../lib/calendarApi';

const STORAGE_KEY = 'weather_app_onboarding_v2';

interface UseCalendarEventsResult {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

export function useCalendarEvents(startDate: Date, endDate: Date): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use timestamps for dependency comparison to avoid infinite loops
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);

        // Read calendar token from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          throw new Error('No onboarding data found');
        }

        const data = JSON.parse(stored);
        const token = data.calendarToken;

        if (!token) {
          throw new Error('No calendar token found. Please connect your calendar.');
        }

        const fetchedEvents = await fetchCalendarEvents(token, startDate, endDate);
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error('Failed to load calendar events:', err);
        setError(err.message || 'Failed to load calendar events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [startTimestamp, endTimestamp, startDate, endDate]);

  return { events, loading, error };
}
