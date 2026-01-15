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

        <div className="bg-black/5 rounded-[20px] p-3 w-full">
            <div className="text-[12px] font-bold uppercase tracking-widest text-black/40 mb-1">First Update</div>
            <div className="text-[16px] font-black text-black">Tomorrow, 7:00 AM</div>
        </div>
      </div>
      
      <div className="pb-[24px]">
        <Button onClick={onComplete}>Open Weather</Button>
      </div>
    </ScreenLayout>
  );
};