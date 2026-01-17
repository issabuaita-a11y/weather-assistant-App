import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';
import { OnboardingData, CalendarEvent } from '../types';
import { GOOGLE_AUTH_CONFIG, INITIAL_ONBOARDING_DATA } from '../constants';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const CalendarScreen: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  const isMockMode = GOOGLE_AUTH_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE';

  // Debug: Log client ID status (only in dev)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Google OAuth Config:', {
        clientId: GOOGLE_AUTH_CONFIG.clientId ? 
          `${GOOGLE_AUTH_CONFIG.clientId.substring(0, 20)}...` : 
          'NOT SET',
        isMockMode,
        scope: GOOGLE_AUTH_CONFIG.scope,
      });
      if (isMockMode) {
        console.warn('⚠️ Google Client ID not configured. OAuth will not work. Set VITE_GOOGLE_CLIENT_ID in .env file.');
      }
    }
  }, [isMockMode]);

  const handleAuthSuccess = useCallback(async (tokenResponse: any) => {
    const STORAGE_KEY = 'weather_app_onboarding_v2';
    const accessToken = tokenResponse.access_token;

    // CRITICAL: Save token to localStorage immediately (even in dev mode)
    // This ensures the token persists before the dashboard tries to read it
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existingData = stored ? JSON.parse(stored) : {};
      const updatedData = {
        ...existingData,
        calendarToken: accessToken,
        permissions: {
          ...INITIAL_ONBOARDING_DATA.permissions,
          ...(existingData.permissions || {}),
          ...(data.permissions || {}),
          calendar: true,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('✅ Calendar token saved to localStorage');
    } catch (err) {
      console.error('Failed to save token to localStorage:', err);
    }

    // Also update React state (for UI updates)
    updateData({ 
        calendarToken: accessToken,
        permissions: { 
            ...INITIAL_ONBOARDING_DATA.permissions,
            ...(data.permissions || {}),
            calendar: true 
        } 
    });

    try {
      // Fetch upcoming events
      const events = await fetchEvents(accessToken);
      updateData({ calendarEvents: events });
      
      // Also save events to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existingData = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...existingData,
          calendarEvents: events,
        }));
      } catch (err) {
        console.error('Failed to save events to localStorage:', err);
      }
      
      setIsConnecting(false);
      onNext();
    } catch (err) {
      console.error("Failed to fetch events:", err);
      // We still proceed even if fetching events failed, as we have the token
      setIsConnecting(false);
      onNext();
    }
  }, [updateData, data.permissions, onNext]);

  const fetchEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
    const now = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) throw new Error('Calendar API request failed');
    const data = await response.json();
    return data.items || [];
  };

  useEffect(() => {
    // Robust check for Google Identity Services SDK
    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const checkGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts) {
        setIsSdkLoaded(true);
        try {
          // Validate client ID before initializing
          if (GOOGLE_AUTH_CONFIG.clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE' || !GOOGLE_AUTH_CONFIG.clientId) {
            setError("Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.");
            return true;
          }

          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_AUTH_CONFIG.clientId,
            scope: GOOGLE_AUTH_CONFIG.scope,
            callback: (response: any) => {
              if (response.error) {
                console.error("Auth error:", response);
                setError(`Authentication failed: ${response.error || 'Unknown error'}`);
                setIsConnecting(false);
                return;
              }
              handleAuthSuccess(response);
            },
          });
          setTokenClient(client);
          return true;
        } catch (err: any) {
          console.error("GSI Init Error", err);
          setError(`Failed to initialize Google Sign-In: ${err.message || 'Unknown error'}`);
          return true; // Stop polling on error
        }
      }
      return false;
    };

    if (!checkGsi() && !isMockMode) {
      // Poll for SDK with timeout
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max (20 * 500ms)
      
      intervalId = setInterval(() => {
        attempts++;
        if (checkGsi() || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (attempts >= maxAttempts && !isSdkLoaded) {
            setError("Google Sign-In SDK failed to load. Please refresh the page.");
          }
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMockMode, isSdkLoaded, handleAuthSuccess]);

  const handleConnect = () => {
    setError(null);
    setIsConnecting(true);

    if (isMockMode) {
      // Simulate connection delay
      setTimeout(() => {
        updateData({ 
            permissions: { 
                ...INITIAL_ONBOARDING_DATA.permissions,
                ...(data.permissions || {}),
                calendar: true 
            } 
        });
        setIsConnecting(false);
        onNext();
      }, 1500);
      return;
    }

    if (!isSdkLoaded) {
      setError("Google Sign-In SDK is still loading. Please wait a moment and try again.");
      setIsConnecting(false);
      return;
    }

    if (!tokenClient) {
      setError("Google Sign-In is not ready. Please check your connection and refresh the page.");
      setIsConnecting(false);
      return;
    }

    try {
      tokenClient.requestAccessToken();
    } catch (err: any) {
      console.error("Failed to request access token:", err);
      setError(`Failed to start authentication: ${err.message || 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  return (
    <ScreenLayout step={2} totalSteps={4} showBack onBack={onBack} theme="blue">
      <div className="flex-1 pt-4 mobile-lg:pt-6">
        <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-4 mobile-lg:mb-5">
          Your<br />Schedule.
        </h1>
        
        <p className="text-[16px] mobile-lg:text-[17px] font-bold text-black/80 mb-6 mobile-lg:mb-7 leading-tight">
          Connect your calendar to get weather insights for your upcoming events.
        </p>

        <div className="bg-white/40 backdrop-blur-sm p-3 rounded-[24px] border border-white/50 relative overflow-hidden">
             {/* Mock Event Cards */}
             <div className="flex flex-col gap-3 opacity-80">
                <div className="flex gap-3 items-center">
                    <div className="w-[4px] h-[32px] bg-[#4285F4] rounded-full"></div>
                    <div>
                        <div className="text-[15px] font-bold text-black">Commute to Work</div>
                        <div className="text-[13px] text-black/60">8:30 AM • Rain ending</div>
                    </div>
                </div>
                 <div className="flex gap-3 items-center">
                    <div className="w-[4px] h-[32px] bg-[#34A853] rounded-full"></div>
                    <div>
                        <div className="text-[15px] font-bold text-black">Lunch with Sarah</div>
                        <div className="text-[13px] text-black/60">1:00 PM • Sunny</div>
                    </div>
                </div>
             </div>
        </div>
        
        {error && (
            <div className="mt-3 flex items-center gap-2 text-[#D0021B]">
                <AlertCircle size={16} />
                <span className="text-[13px] font-bold">{error}</span>
            </div>
        )}

        {!isMockMode && !isSdkLoaded && !error && (
          <div className="mt-3 flex items-center gap-2 text-black/60">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-[13px] font-medium">Loading Google Sign-In...</span>
          </div>
        )}
      </div>

      <div className="space-y-2 pb-4">
        {isMockMode && (
           <div className="flex items-center justify-center gap-2 mb-1 px-4 text-center">
              <Info size={12} className="text-black/40 shrink-0" />
              <span className="text-[10px] font-medium text-black/40">Demo Mode: No real account required</span>
           </div>
        )}
        
        {!isMockMode && !isSdkLoaded && (
          <div className="flex items-center justify-center gap-2 mb-1 px-4 text-center">
            <Info size={12} className="text-black/40 shrink-0" />
            <span className="text-[10px] font-medium text-black/40">Waiting for Google Sign-In to load...</span>
          </div>
        )}
        
        <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Connecting...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <Calendar size={18} /> Connect Google Calendar
                </span>
            )}
        </Button>
        <Button variant="ghost" onClick={onNext} disabled={isConnecting}>Skip</Button>
      </div>
    </ScreenLayout>
  );
};