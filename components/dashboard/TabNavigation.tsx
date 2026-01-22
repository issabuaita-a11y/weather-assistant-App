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
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 z-50">
      <div className="bg-black/95 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-black/40 border border-white/10">
        <div className="flex items-center justify-around px-8 py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isDisabled = tab.id === 'profile';

            return (
              <div key={tab.id} className="flex flex-col items-center relative">
                <button
                  onClick={() => !isDisabled && onTabChange(tab.id)}
                  disabled={isDisabled}
                  className={`
                    transition-all duration-200
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                  `}
                  title={isDisabled ? 'Coming soon' : tab.label}
                >
                  {isActive ? (
                    <div className="bg-white rounded-2xl px-8 py-3 shadow-lg">
                      <Icon className="w-6 h-6 text-black" fill="black" strokeWidth={0} />
                    </div>
                  ) : (
                    <div className="px-8 py-3">
                      <Icon className="w-6 h-6 text-gray-400" strokeWidth={2} />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
