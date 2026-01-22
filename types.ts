export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HomeLocation {
  address: string;
  city: string;
  state: string;
  coordinates: Coordinates;
}

export interface WeatherFeatures {
  temperature: boolean;
  hourlyForecast: boolean;
  precipitation: boolean;
  uvIndex: boolean;
  sunriseSunset: boolean;
  windSpeed: boolean;
  humidity: boolean;
  airQuality: boolean;
  visibility: boolean;
  pressure: boolean;
  feelsLike: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  location?: string;
  calendarName?: string; // Optional: calendar name for filtering
}

export interface NotificationPreferences {
  morningBriefingEnabled: boolean;
  eventRemindersEnabled: boolean;
  morningBriefingTime: string; // Format: "7:00 AM"
  eventReminderTime: string; // Format: "1 hour before heading out"
}

export interface OnboardingData {
  completed: boolean;
  currentStep: number;
  homeLocation: HomeLocation | null;
  permissions: {
    location: 'granted' | 'denied' | 'prompt' | 'not_requested';
    calendar: boolean;
    notifications: boolean;
  };
  weatherFeatures: WeatherFeatures;
  calendarToken?: string;
  calendarEvents?: CalendarEvent[];
  notificationPreferences?: NotificationPreferences;
}

export enum ScreenStep {
  Welcome = 0,
  Address = 1,
  LocationPermission = 2,
  Calendar = 3,
  Notifications = 4,
  Features = 5,
  Completion = 6,
}