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
      <div className="flex-1 pt-8">
        <h1 className="text-[56px] font-black text-black leading-[0.95] tracking-tighter mb-8">
          Smart<br />Timing.
        </h1>
        
        <p className="text-[24px] font-bold text-black/80 mb-12 leading-tight">
          We need your location to warn you before you step into rain.
        </p>

        <div className="space-y-6">
           <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full border-2 border-black/10 flex items-center justify-center shrink-0">
                <Map size={24} className="text-black" />
              </div>
              <div>
                 <h3 className="text-[18px] font-bold text-black">Precise Alerts</h3>
                 <p className="text-[16px] text-black/60 leading-snug">Get notified exactly when rain starts at your spot.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-center gap-2 mb-4">
             <Lock size={14} className="text-black/40" />
             <span className="text-[12px] font-semibold text-black/40 uppercase tracking-widest">Private & Secure</span>
        </div>
        <Button onClick={handleAllow}>Enable Location</Button>
        <Button variant="secondary" onClick={onNext}>Not Now</Button>
      </div>
    </ScreenLayout>
  );
};