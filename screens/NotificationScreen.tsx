import React from 'react';
import { Bell } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';
import { OnboardingData } from '../types';
import { INITIAL_ONBOARDING_DATA } from '../constants';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const NotificationScreen: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const handleEnable = async () => {
    try {
      if (!('Notification' in window)) {
         console.warn("Notifications API not supported");
         updateData({ 
            permissions: { 
                ...INITIAL_ONBOARDING_DATA.permissions,
                ...(data.permissions || {}),
                notifications: false 
            } 
         });
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
          } 
      });
      onNext();
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      // Ensure we advance even if there's an error
      onNext();
    }
  };

  return (
    <ScreenLayout step={4} showBack onBack={onBack} theme="peach">
      <div className="flex-1 pt-4 mobile-lg:pt-6">
        <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-4 mobile-lg:mb-5">
          Never<br />Get Soaked.
        </h1>
        
        <p className="text-[16px] mobile-lg:text-[17px] font-bold text-black/80 mb-6 mobile-lg:mb-7 leading-tight">
          Timely reminders so you always know when to bring an umbrella.
        </p>

        <div className="flex flex-col gap-2.5">
            <div className="bg-white/40 backdrop-blur-sm p-3 rounded-[24px] border border-white/50 flex gap-3 items-center">
                <Bell className="text-black shrink-0" size={18} />
                <div>
                    <div className="text-[15px] font-bold text-black">Morning Briefing</div>
                    <div className="text-[13px] text-black/60">Daily forecast at 7:00 AM</div>
                </div>
            </div>
            
            <div className="bg-white/40 backdrop-blur-sm p-3 rounded-[24px] border border-white/50 flex gap-3 items-center opacity-60">
                <div className="w-4 h-4 rounded-full border-2 border-black/20" />
                <div>
                    <div className="text-[15px] font-bold text-black">Rain Alerts</div>
                    <div className="text-[13px] text-black/60">15 min before precipitation</div>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-2 pb-4">
        <Button onClick={handleEnable}>Enable Notifications</Button>
        <Button variant="ghost" onClick={onNext}>Maybe Later</Button>
      </div>
    </ScreenLayout>
  );
};