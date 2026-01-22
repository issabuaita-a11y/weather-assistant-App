import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';
import { OnboardingData, NotificationPreferences, CalendarEvent } from '../types';

interface Props {
  data: OnboardingData;
  onComplete: () => void;
}

const STORAGE_KEY = 'weather_app_onboarding_v2';

export const CompletionScreen: React.FC<Props> = ({ data, onComplete }) => {
  // Get notification preferences from localStorage
  const notificationPrefs = useMemo<NotificationPreferences | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notificationPreferences || null;
      }
    } catch (error) {
      console.error('Failed to read notification preferences:', error);
    }
    return null;
  }, []);

  // Calculate first notification time
  const firstNotificationTime = useMemo(() => {
    if (!notificationPrefs) return null;

    const { morningBriefingEnabled, eventRemindersEnabled, morningBriefingTime, eventReminderTime } = notificationPrefs;

    // If both are OFF, return null (hide section)
    if (!morningBriefingEnabled && !eventRemindersEnabled) {
      return null;
    }

    // If Morning Briefing is enabled, use that time for tomorrow
    if (morningBriefingEnabled) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Parse time (e.g., "8:30 AM" -> { hour: 8, minute: 30 })
      const timeMatch = morningBriefingTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        const isPM = timeMatch[3].toUpperCase() === 'PM';
        
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        tomorrow.setHours(hour, minute, 0, 0);
        
        return {
          date: tomorrow,
          label: `Tomorrow, ${morningBriefingTime}`,
        };
      }
    }

    // If only Event Reminders is enabled, calculate from first upcoming event
    if (eventRemindersEnabled && data.calendarEvents && data.calendarEvents.length > 0) {
      // Parse duration (e.g., "1 hour before heading out" -> 1 hour)
      const durationMatch = eventReminderTime.match(/(\d+)\s*(hour|min)/i);
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        // Find the first upcoming event
        const now = new Date();
        const upcomingEvents = data.calendarEvents
          .filter(event => {
            const eventTime = event.start.dateTime 
              ? new Date(event.start.dateTime)
              : event.start.date 
              ? new Date(event.start.date + 'T12:00:00')
              : null;
            return eventTime && eventTime > now;
          })
          .sort((a, b) => {
            const aTime = a.start.dateTime 
              ? new Date(a.start.dateTime).getTime()
              : a.start.date 
              ? new Date(a.start.date + 'T12:00:00').getTime()
              : Infinity;
            const bTime = b.start.dateTime 
              ? new Date(b.start.dateTime).getTime()
              : b.start.date 
              ? new Date(b.start.date + 'T12:00:00').getTime()
              : Infinity;
            return aTime - bTime;
          });

        if (upcomingEvents.length > 0) {
          const firstEvent = upcomingEvents[0];
          const eventTime = firstEvent.start.dateTime 
            ? new Date(firstEvent.start.dateTime)
            : firstEvent.start.date 
            ? new Date(firstEvent.start.date + 'T12:00:00')
            : null;

          if (eventTime) {
            const reminderTime = new Date(eventTime);
            
            // Subtract the duration
            if (unit === 'hour') {
              reminderTime.setHours(reminderTime.getHours() - amount);
            } else if (unit === 'min') {
              reminderTime.setMinutes(reminderTime.getMinutes() - amount);
            }

            // Format the date label
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const reminderDate = new Date(reminderTime);
            reminderDate.setHours(0, 0, 0, 0);
            
            const isToday = reminderDate.getTime() === today.getTime();
            const isTomorrow = reminderDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000;
            
            let dateLabel = '';
            if (isToday) {
              dateLabel = 'Today';
            } else if (isTomorrow) {
              dateLabel = 'Tomorrow';
            } else {
              dateLabel = reminderTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            }

            const timeStr = reminderTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });

            return {
              date: reminderTime,
              label: `${dateLabel}, ${timeStr}`,
            };
          }
        }
      }
    }

    return null;
  }, [notificationPrefs, data.calendarEvents]);

  return (
    <ScreenLayout theme="green">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6 mobile-lg:mb-7 relative"
        >
          <div className="w-[90px] h-[90px] mobile-lg:w-[100px] mobile-lg:h-[100px] rounded-full bg-black text-white flex items-center justify-center shadow-2xl">
             <Check className="w-[45px] h-[45px] mobile-lg:w-[50px] mobile-lg:h-[50px]" strokeWidth={4} />
          </div>
        </motion.div>
        
        <h1 className="text-[42px] mobile-lg:text-[46px] font-black text-black leading-[0.9] tracking-tighter mb-3 mobile-lg:mb-4">
          You're<br />Ready.
        </h1>
        
        <p className="text-[15px] mobile-lg:text-[16px] font-medium text-black/60 max-w-[280px] leading-tight mb-6 mobile-lg:mb-7">
          Your personalized weather dashboard has been created.
        </p>

        {firstNotificationTime && (
          <div className="bg-black/5 rounded-[20px] p-3 w-full">
            <div className="text-[12px] font-bold uppercase tracking-widest text-black/40 mb-1">First Update</div>
            <div className="text-[16px] font-black text-black">{firstNotificationTime.label}</div>
          </div>
        )}
      </div>
      
      <div className="pb-[24px]">
        <Button onClick={onComplete}>Let's go</Button>
      </div>
    </ScreenLayout>
  );
};