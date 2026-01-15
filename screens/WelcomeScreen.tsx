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
        <div className="mb-12">
          <CloudSun className="w-24 h-24 text-black" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[64px] font-black text-black leading-[0.9] tracking-tighter mb-8">
          Your<br />
          Weather<br />
          Assistant.
        </h1>
        
        <p className="text-[20px] font-medium text-black/60 max-w-[280px] leading-tight">
          Personalized forecasts that actually matter to your daily routine.
        </p>
      </div>
      
      <div className="pb-[48px]">
        <Button onClick={onNext}>Get Started</Button>
      </div>
    </ScreenLayout>
  );
};