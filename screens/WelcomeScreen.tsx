import React from 'react';
import { CloudSun } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';

interface Props {
  onNext: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onNext }) => {
  return (
    <ScreenLayout theme="blue">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-6 mobile-lg:mb-8">
          <CloudSun className="w-16 h-16 mobile-lg:w-[72px] mobile-lg:h-[72px] text-black" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[42px] mobile-lg:text-[46px] font-black text-black leading-[0.9] tracking-tighter mb-4 mobile-lg:mb-5">
          Your<br />
          Weather<br />
          Assistant.
        </h1>
        
        <p className="text-[15px] mobile-lg:text-[16px] font-medium text-black/60 max-w-[280px] leading-tight">
          Personalized forecasts that actually matter to your daily routine.
        </p>
      </div>
      
      <div className="pb-[24px] mobile-lg:pb-[28px]">
        <Button onClick={onNext}>Get Started</Button>
      </div>
    </ScreenLayout>
  );
};