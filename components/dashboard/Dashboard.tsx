import React, { useState } from 'react';
import { TabNavigation, TabType } from './TabNavigation';
import { HomePage } from './HomePage';
import { TripsPage } from './TripsPage';

export const Dashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  return (
    <div className="relative flex flex-col w-full h-full min-h-screen max-w-md bg-white sm:rounded-[40px] sm:h-[844px] sm:min-h-0 sm:shadow-2xl sm:border-[8px] sm:border-black overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]">
        {/* Background Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {currentTab === 'home' && <HomePage />}
          {currentTab === 'trips' && <TripsPage />}
          {currentTab === 'profile' && (
            <div className="flex-1 flex items-center justify-center px-8 pb-24">
              <div className="text-center">
                <p className="text-[16px] font-bold text-black/60">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};
