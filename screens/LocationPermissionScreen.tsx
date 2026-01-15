import React from 'react';
import { Lock, Map } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';
import { OnboardingData } from '../types';
import { INITIAL_ONBOARDING_DATA } from '../constants';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationPermissionScreen: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  const handleAllow = () => {
    // Correctly merge permissions using spread on the existing object
    updateData({ 
        permissions: { 
            ...INITIAL_ONBOARDING_DATA.permissions,
            ...(data.permissions || {}),
            location: 'granted' 
        } 
    });
    onNext();
  };

  return (
    <ScreenLayout step={2} showBack onBack={onBack} theme="purple">
      <div className="flex-1 flex flex-col justify-center pt-4 mobile-lg:pt-6">
        <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-4 mobile-lg:mb-5">
          Smart<br />Timing.
        </h1>
        
        <p className="text-[16px] mobile-lg:text-[17px] font-bold text-black/80 mb-6 mobile-lg:mb-7 leading-tight">
          We need your location to warn you before you step into rain.
        </p>

        <div className="space-y-3 mobile-lg:space-y-4">
           <div className="flex gap-3 mobile-lg:gap-4 items-start">
              <div className="w-9 h-9 mobile-lg:w-10 mobile-lg:h-10 rounded-full border-2 border-black/10 flex items-center justify-center shrink-0">
                <Map size={18} className="text-black mobile-lg:w-5 mobile-lg:h-5" />
              </div>
              <div>
                 <h3 className="text-[15px] mobile-lg:text-[16px] font-bold text-black">Precise Alerts</h3>
                 <p className="text-[13px] mobile-lg:text-[14px] text-black/60 leading-snug">Get notified exactly when rain starts at your spot.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-2 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
             <Lock size={12} className="text-black/40" />
             <span className="text-[11px] font-semibold text-black/40 uppercase tracking-widest">Private & Secure</span>
        </div>
        <Button onClick={handleAllow}>Enable Location</Button>
        <Button variant="secondary" onClick={onNext}>Not Now</Button>
      </div>
    </ScreenLayout>
  );
};