import { CalendarEvent } from '../types';
import { Coordinates } from '../types';

/**
 * Calendar info with ID and name for filtering
 */
interface CalendarInfo {
  id: string;
  name: string;
}

/**
 * Get list of all calendars the user has access to
 */
async function getCalendarList(token: string): Promise<CalendarInfo[]> {
  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');
    url.searchParams.set('minAccessRole', 'reader'); // Get all calendars user can read

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Calendar token expired. Please reconnect your calendar.');
      }
      throw new Error(`Calendar list API error: ${response.status}`);
    }

    const data = await response.json();
    // Return calendar IDs and names
    return (data.items || []).map((item: any) => ({
      id: item.id,
      name: item.summary || item.id,
    }));
  } catch (error) {
    console.error('Failed to fetch calendar list:', error);
    // Fallback to primary calendar if list fetch fails
    return [{ id: 'primary', name: 'primary' }];
  }
}

/**
 * Fetch events from a single calendar
 */
async function fetchEventsFromCalendar(
  token: string,
  calendarId: string,
  calendarName: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const timeMinISO = timeMin.toISOString();
  const timeMaxISO = timeMax.toISOString();

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set('timeMin', timeMinISO);
  url.searchParams.set('timeMax', timeMaxISO);
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // If a specific calendar fails, log but don't throw (continue with other calendars)
    if (response.status === 403) {
      console.warn(`No access to calendar ${calendarId}, skipping...`);
      return [];
    }
    if (response.status === 404) {
      console.warn(`Calendar ${calendarId} not found, skipping...`);
      return [];
    }
    // For other errors, still return empty array to not break the whole flow
    console.warn(`Error fetching from calendar ${calendarId}: ${response.status}`);
    return [];
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: `${calendarId}_${item.id}`, // Prefix with calendar ID to ensure uniqueness
    summary: item.summary || 'Untitled Event',
    start: item.start || {},
    end: item.end || {},
    location: item.location || undefined,
    description: item.description || undefined,
    calendarName: calendarName, // Store calendar name for filtering
  }));
}

/**
 * Check if an event should be filtered out (holiday or all-day event)
 */
function shouldFilterEvent(event: CalendarEvent): boolean {
  const summary = (event.summary || '').toLowerCase();
  const calendarName = (event.calendarName || '').toLowerCase();

  // Filter out all-day events (holidays are typically all-day)
  // All-day events have "date" field, timed events have "dateTime"
  if (event.start.date && !event.start.dateTime) {
    return true;
  }

  // Filter out events from "Holidays" calendars
  if (calendarName.includes('holiday')) {
    return true;
  }

  // Filter out events with holiday keywords in title
  const holidayKeywords = [
    'holiday',
    'no class',
    'college closed',
    'university closed',
    'school closed',
    'break',
    'recess',
    'day off',
    'closed',
    'martin luther king',
    'mlk',
    'presidents day',
    'memorial day',
    'independence day',
    'labor day',
    'thanksgiving',
    'christmas',
    'new year',
    'veterans day',
    'columbus day',
    'easter',
    'good friday',
  ];

  for (const keyword of holidayKeywords) {
    if (summary.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Fetch Google Calendar events for a date range from ALL calendars
 * Includes primary calendar, shared calendars, subscribed calendars, etc.
 * Filters out holidays and all-day events.
 */
export async function fetchCalendarEvents(
  token: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  try {
    // Step 1: Get list of all calendars
    const calendars = await getCalendarList(token);
    console.log(`📅 Fetching events from ${calendars.length} calendar(s):`, calendars.map(c => c.name));

    // Step 2: Fetch events from each calendar in parallel
    const eventPromises = calendars.map(calendar =>
      fetchEventsFromCalendar(token, calendar.id, calendar.name, timeMin, timeMax)
    );

    const eventArrays = await Promise.all(eventPromises);

    // Step 3: Merge all events into a single array
    const allEvents = eventArrays.flat();

    // Step 4: Filter out holidays and all-day events
    const filteredEvents = allEvents.filter(event => !shouldFilterEvent(event));
    console.log(`🔍 Filtered out ${allEvents.length - filteredEvents.length} holiday/all-day events`);

    // Step 5: Deduplicate events (same event might appear in multiple calendars)
    // Use a Map keyed by event summary + start time to identify duplicates
    const uniqueEvents = new Map<string, CalendarEvent>();
    for (const event of filteredEvents) {
      const startTime = event.start.dateTime || event.start.date || '';
      const key = `${event.summary}_${startTime}`;
      if (!uniqueEvents.has(key)) {
        uniqueEvents.set(key, event);
      }
    }

    // Step 6: Sort by start time
    const sortedEvents = Array.from(uniqueEvents.values()).sort((a, b) => {
      const aTime = a.start.dateTime || a.start.date || '';
      const bTime = b.start.dateTime || b.start.date || '';
      return aTime.localeCompare(bTime);
    });

    console.log(`✅ Fetched ${sortedEvents.length} unique events from ${calendars.length} calendar(s)`);
    return sortedEvents;
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    throw error;
  }
}

/**
 * Geocode a location string to coordinates using Photon API
 * Reuses the same logic from AddressScreen
 */
export async function geocodeLocation(location: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=1&lang=en`
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    
    if (!json.features || json.features.length === 0) {
      return null;
    }

    const feature = json.features[0];
    const coords = feature.geometry.coordinates;
    
    // Photon returns [lon, lat] in GeoJSON format
    return {
      latitude: coords[1],
      longitude: coords[0],
    };
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Extract location from calendar event
 * Returns the location string if it exists
 */
export function extractLocationFromEvent(event: CalendarEvent): string | null {
  return event.location || null;
}
