import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ScreenLayout, Button } from '../components/ui';
import { OnboardingData } from '../types';

interface Props {
  data: OnboardingData;
  onComplete: () => void;
}

export const CompletionScreen: React.FC<Props> = ({ data, onComplete }) => {
  return (
    <ScreenLayout theme="green">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-12 relative"
        >
          <div className="w-[120px] h-[120px] rounded-full bg-black text-white flex items-center justify-center shadow-2xl">
             <Check className="w-[60px] h-[60px]" strokeWidth={4} />
          </div>
        </motion.div>
        
        <h1 className="text-[64px] font-black text-black leading-[0.9] tracking-tighter mb-6">
          You're<br />Ready.
        </h1>
        
        <p className="text-[20px] font-medium text-black/60 max-w-[280px] leading-tight mb-12">
          Your personalized weather dashboard has been created.
        </p>

        <div className="bg-black/5 rounded-[20px] p-6 w-full">
            <div className="text-[14px] font-bold uppercase tracking-widest text-black/40 mb-2">First Update</div>
            <div className="text-[24px] font-black text-black">Tomorrow, 7:00 AM</div>
        </div>
      </div>
      
      <div className="pb-[48px]">
        <Button onClick={onComplete}>Open Weather</Button>
      </div>
    </ScreenLayout>
  );
};