import React, { useState } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { ScreenLayout, Button, Toggle } from '../components/ui';
import { TimePickerModal } from '../components/TimePickerModal';
import { DurationPickerModal } from '../components/DurationPickerModal';
import { OnboardingData } from '../types';
import { INITIAL_ONBOARDING_DATA } from '../constants';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const NotificationScreen: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const STORAGE_KEY = 'weather_app_onboarding_v2';
  
  // Load saved preferences from localStorage on mount
  const [morningBriefingEnabled, setMorningBriefingEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notificationPreferences?.morningBriefingEnabled ?? false;
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return false;
  });
  
  const [eventRemindersEnabled, setEventRemindersEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notificationPreferences?.eventRemindersEnabled ?? false;
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return false;
  });
  
  const [morningBriefingTime, setMorningBriefingTime] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notificationPreferences?.morningBriefingTime ?? '7:00 AM';
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return '7:00 AM';
  });
  
  const [eventReminderTime, setEventReminderTime] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notificationPreferences?.eventReminderTime ?? '1 hour before heading out';
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    return '1 hour before heading out';
  });
  
  const [isMorningBriefingModalOpen, setIsMorningBriefingModalOpen] = useState(false);
  const [isEventReminderModalOpen, setIsEventReminderModalOpen] = useState(false);

  const handleEnable = async () => {
    try {
      if (!('Notification' in window)) {
         console.warn("Notifications API not supported");
         updateData({ 
            permissions: { 
                ...INITIAL_ONBOARDING_DATA.permissions,
                ...(data.permissions || {}),
                notifications: false 
            },
            notificationPreferences: {
              morningBriefingEnabled,
              eventRemindersEnabled,
              morningBriefingTime,
              eventReminderTime,
            }
         });
         
         // Save to localStorage
         try {
           const stored = localStorage.getItem(STORAGE_KEY);
           const existingData = stored ? JSON.parse(stored) : {};
           localStorage.setItem(STORAGE_KEY, JSON.stringify({
             ...existingData,
             notificationPreferences: {
               morningBriefingEnabled,
               eventRemindersEnabled,
               morningBriefingTime,
               eventReminderTime,
             }
           }));
         } catch (err) {
           console.error('Failed to save notification preferences:', err);
         }
         
         onNext();
         return;
      }

      // Request permission
      const result = await Notification.requestPermission();
      
      updateData({ 
          permissions: { 
              ...INITIAL_ONBOARDING_DATA.permissions,
              ...(data.permissions || {}),
              notifications: result === 'granted' 
          },
          notificationPreferences: {
            morningBriefingEnabled,
            eventRemindersEnabled,
            morningBriefingTime,
            eventReminderTime,
          }
      });
      
      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existingData = stored ? JSON.parse(stored) : {};
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...existingData,
          notificationPreferences: {
            morningBriefingEnabled,
            eventRemindersEnabled,
            morningBriefingTime,
            eventReminderTime,
          }
        }));
      } catch (err) {
        console.error('Failed to save notification preferences:', err);
      }
      
      onNext();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      // Ensure we advance even if there's an error
      onNext();
    }
  };

  return (
    <ScreenLayout step={3} totalSteps={4} showBack onBack={onBack} theme="peach">
      <div className="flex-1 pt-4 mobile-lg:pt-6">
        <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-4 mobile-lg:mb-5">
          Never<br />Get Soaked.
        </h1>
        
        <p className="text-[16px] mobile-lg:text-[17px] font-bold text-black/80 mb-6 mobile-lg:mb-7 leading-tight">
          Timely reminders so you always know when to bring an umbrella.
        </p>

        <div className="flex flex-col gap-2.5">
            <div className={`bg-white/40 backdrop-blur-sm p-3 rounded-[24px] border border-white/50 flex gap-3 items-center justify-between transition-opacity ${
              !morningBriefingEnabled ? 'opacity-50' : 'opacity-100'
            }`}>
                <div 
                    className={`flex gap-3 items-center flex-1 transition-all ${
                      morningBriefingEnabled 
                        ? 'cursor-pointer active:opacity-70' 
                        : 'cursor-not-allowed pointer-events-none'
                    }`}
                    onClick={() => {
                        if (morningBriefingEnabled) {
                          setIsMorningBriefingModalOpen(true);
                        }
                    }}
                >
                    <Bell className="text-black shrink-0" size={18} />
                    <div>
                        <div className="text-[15px] font-bold text-black">Morning Briefing</div>
                        <div className="text-[13px] text-black/60">Daily forecast at {morningBriefingTime}</div>
                    </div>
                </div>
                <div 
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Toggle 
                        checked={morningBriefingEnabled} 
                        onChange={setMorningBriefingEnabled} 
                    />
                </div>
            </div>
            
            <div className={`bg-white/40 backdrop-blur-sm p-3 rounded-[24px] border border-white/50 flex gap-3 items-center justify-between transition-opacity ${
              !eventRemindersEnabled ? 'opacity-50' : 'opacity-100'
            }`}>
                <div 
                    className={`flex gap-3 items-center flex-1 transition-all ${
                      eventRemindersEnabled 
                        ? 'cursor-pointer active:opacity-70' 
                        : 'cursor-not-allowed pointer-events-none'
                    }`}
                    onClick={() => {
                        if (eventRemindersEnabled) {
                          setIsEventReminderModalOpen(true);
                        }
                    }}
                >
                    <Calendar className="text-black shrink-0" size={18} />
                    <div>
                        <div className="text-[15px] font-bold text-black">Event Reminders</div>
                        <div className="text-[13px] text-black/60">{eventReminderTime}</div>
                    </div>
                </div>
                <div 
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Toggle 
                        checked={eventRemindersEnabled} 
                        onChange={setEventRemindersEnabled} 
                    />
                </div>
            </div>
        </div>

        {/* Time Picker Modals */}
        <TimePickerModal
          isOpen={isMorningBriefingModalOpen}
          currentTime={morningBriefingTime}
          onSave={(time) => {
            setMorningBriefingTime(time);
            setIsMorningBriefingModalOpen(false);
          }}
          onCancel={() => setIsMorningBriefingModalOpen(false)}
          title="Morning Briefing Time"
        />

        <DurationPickerModal
          isOpen={isEventReminderModalOpen}
          currentDuration={eventReminderTime}
          onSave={(duration) => {
            setEventReminderTime(duration);
            setIsEventReminderModalOpen(false);
          }}
          onCancel={() => setIsEventReminderModalOpen(false)}
          title="Event Reminder Time"
        />
      </div>

      <div className="space-y-2 pb-4">
        <Button onClick={handleEnable}>Save Preferences</Button>
        <Button variant="ghost" onClick={onNext}>Edit later</Button>
      </div>
    </ScreenLayout>
  );
};