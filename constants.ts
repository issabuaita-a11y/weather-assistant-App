import { OnboardingData } from './types';

export const COLORS = {
  primary: '#4A90E2',
  primaryPressed: '#3A7BC8',
  success: '#7ED321',
  warning: '#F5A623',
  error: '#D0021B',
  textPrimary: '#4A4A4A',
  textSecondary: '#9B9B9B',
  border: '#E0E0E0',
  background: '#FFFFFF',
  disabled: '#F5F5F5',
};

// ---------------------------------------------------------------------------
// GOOGLE CALENDAR CONFIGURATION
// ---------------------------------------------------------------------------
export const GOOGLE_AUTH_CONFIG = {
  // Get your Client ID from Google Cloud Console: https://console.cloud.google.com/apis/credentials
  // Set VITE_GOOGLE_CLIENT_ID in your .env file
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE', 
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
};

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  completed: false,
  currentStep: 0,
  homeLocation: null,
  permissions: {
    location: 'not_requested',
    calendar: false,
    notifications: false,
  },
  weatherFeatures: {
    temperature: true,
    hourlyForecast: true,
    precipitation: true,
    uvIndex: true,
    sunriseSunset: true,
    windSpeed: true,
    humidity: false,
    airQuality: false,
    visibility: false,
    pressure: false,
  },
};

export const ESSENTIAL_FEATURES = ['temperature', 'hourlyForecast', 'precipitation'];

// Mock data for geocoding
export const MOCK_LOCATIONS = [
  {
    address: "123 Main Street, San Francisco, CA",
    city: "San Francisco",
    state: "CA",
    lat: 37.7749,
    lng: -122.4194
  },
  {
    address: "456 Market St, San Francisco, CA",
    city: "San Francisco",
    state: "CA",
    lat: 37.7899,
    lng: -122.4004
  },
  {
    address: "789 Broadway, New York, NY",
    city: "New York",
    state: "NY",
    lat: 40.7128,
    lng: -74.0060
  }
];