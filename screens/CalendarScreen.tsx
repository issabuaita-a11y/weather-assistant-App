import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Robust check for Google Identity Services SDK
    let intervalId: ReturnType<typeof setInterval>;
    
    const checkGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts) {
        setIsSdkLoaded(true);
        try {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_AUTH_CONFIG.clientId,
            scope: GOOGLE_AUTH_CONFIG.scope,
            callback: (response: any) => {
              if (response.error) {
                console.error("Auth error:", response);
                setError("Authentication failed. Please try again.");
                setIsConnecting(false);
                return;
              }
              handleAuthSuccess(response);
            },
          });
          setTokenClient(client);
        } catch (err) {
            console.error("GSI Init Error", err);
        }
        return true;
      }
      return false;
    };

    if (!checkGsi()) {
      intervalId = setInterval(() => {
        if (checkGsi()) clearInterval(intervalId);
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleAuthSuccess = async (tokenResponse: any) => {
    updateData({ 
        calendarToken: tokenResponse.access_token,
        permissions: { 
            ...INITIAL_ONBOARDING_DATA.permissions,
            ...(data.permissions || {}),
            calendar: true 
        } 
    });

    try {
      // Fetch upcoming events
      const events = await fetchEvents(tokenResponse.access_token);
      updateData({ calendarEvents: events });
      setIsConnecting(false);
      onNext();
    } catch (err) {
      console.error("Failed to fetch events:", err);
      // We still proceed even if fetching events failed, as we have the token
      setIsConnecting(false);
      onNext();
    }
  };

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

    if (!tokenClient) {
      setError("Google Sign-In is not ready. Please check your connection.");
      setIsConnecting(false);
      return;
    }

    tokenClient.requestAccessToken();
  };

  return (
    <ScreenLayout step={3} showBack onBack={onBack} theme="blue">
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
      </div>

      <div className="space-y-2 pb-4">
        {isMockMode && (
           <div className="flex items-center justify-center gap-2 mb-1 px-4 text-center">
              <Info size={12} className="text-black/40 shrink-0" />
              <span className="text-[10px] font-medium text-black/40">Demo Mode: No real account required</span>
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