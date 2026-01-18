import { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';
import { WeatherData, HourlyForecast } from '../types/weather';
import { WeatherSuggestion } from '../types/suggestions';
import { getHourlyForecast, getCurrentWeather, getHourlyForecastArray } from '../lib/weatherApi';
import { geocodeLocation, extractLocationFromEvent } from '../lib/calendarApi';
import { generateWeatherSuggestions, generateEnhancedSuggestions } from '../lib/generateWeatherSuggestions';

const STORAGE_KEY = 'weather_app_onboarding_v2';

export interface EnrichedEvent extends CalendarEvent {
  weather: WeatherData | null; // Current weather at event time
  currentWeather: WeatherData | null; // Weather right now
  hourlyForecast: HourlyForecast[]; // Hourly data from now to event end
  suggestions: WeatherSuggestion[];
  coordinates: { latitude: number; longitude: number } | null;
}

interface UseWeatherForEventsResult {
  eventsWithWeather: EnrichedEvent[];
  loading: boolean;
}

export function useWeatherForEvents(events: CalendarEvent[]): UseWeatherForEventsResult {
  const [eventsWithWeather, setEventsWithWeather] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const prevEventsRef = useRef<string>('');

  useEffect(() => {
    // Create a stable key from event IDs to prevent unnecessary re-runs
    const eventsKey = events.map(e => e.id).join(',');
    
    // Skip if events haven't actually changed
    if (eventsKey === prevEventsRef.current) {
      return;
    }
    
    prevEventsRef.current = eventsKey;
    async function enrichEvents() {
      if (events.length === 0) {
        setEventsWithWeather([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Get user preferences and home location from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : null;
      const homeLocation = data?.homeLocation;
      const weatherFeatures = data?.weatherFeatures || {};

      const enriched: EnrichedEvent[] = await Promise.all(
        events.map(async (event) => {
          let coordinates: { latitude: number; longitude: number } | null = null;
          let weather: WeatherData | null = null;
          let currentWeather: WeatherData | null = null;
          let hourlyForecast: HourlyForecast[] = [];
          let suggestions: WeatherSuggestion[] = [];

          try {
            // Step 1: Get location (from event or home location)
            const eventLocation = extractLocationFromEvent(event);
            
            if (eventLocation) {
              // Step 2: Geocode the location string
              const geocoded = await geocodeLocation(eventLocation);
              if (geocoded) {
                coordinates = geocoded;
              }
            }

            // If no location from event, use home location
            if (!coordinates && homeLocation?.coordinates) {
              coordinates = homeLocation.coordinates;
            }

            // Step 3: Fetch weather if we have coordinates
            if (coordinates) {
              // Parse event start and end times
              const startTime = event.start.dateTime 
                ? new Date(event.start.dateTime)
                : event.start.date 
                ? new Date(event.start.date + 'T12:00:00')
                : new Date();

              const endTime = event.end?.dateTime
                ? new Date(event.end.dateTime)
                : event.end?.date
                ? new Date(event.end.date + 'T17:00:00')
                : new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

              // Fetch current weather (right now)
              currentWeather = await getCurrentWeather(
                coordinates.latitude,
                coordinates.longitude
              );

              // Fetch weather at event time
              weather = await getHourlyForecast(
                coordinates.latitude,
                coordinates.longitude,
                startTime
              );

              // Fetch hourly forecast array from now to event end
              hourlyForecast = await getHourlyForecastArray(
                coordinates.latitude,
                coordinates.longitude,
                startTime,
                endTime
              );

              // Step 4: Generate enhanced suggestions based on hourly data
              if (weather && hourlyForecast.length > 0) {
                suggestions = generateEnhancedSuggestions(
                  weather,
                  hourlyForecast,
                  startTime,
                  endTime,
                  event.summary,
                  weatherFeatures
                );
              } else if (weather) {
                // Fallback to basic suggestions if no hourly data
                suggestions = generateWeatherSuggestions(weather, weatherFeatures);
              }
            }
          } catch (error) {
            console.error(`Failed to enrich event ${event.id}:`, error);
          }

          return {
            ...event,
            weather,
            currentWeather,
            hourlyForecast,
            suggestions,
            coordinates,
          };
        })
      );

      setEventsWithWeather(enriched);
      setLoading(false);
    }

    enrichEvents();
  }, [events]);

  return { eventsWithWeather, loading };
}
