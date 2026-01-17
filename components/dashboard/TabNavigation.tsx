import React from 'react';
import { Home, Luggage, User } from 'lucide-react';

export type TabType = 'home' | 'trips' | 'profile';

interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'trips' as TabType, label: 'Trips', icon: Luggage },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 shadow-lg">
      <div className="flex items-center justify-around h-[64px] px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isDisabled = tab.id === 'profile';

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3
                transition-all duration-200
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                ${isActive ? 'text-white' : 'text-[#666666]'}
              `}
              title={isDisabled ? 'Coming soon' : tab.label}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={isActive ? 'text-white stroke-white' : 'text-[#666666] stroke-[#666666]'} 
              />
              <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-[#666666]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
