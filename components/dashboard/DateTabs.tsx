import React from 'react';

export interface DateTab {
  date: Date;
  label: string;
  isToday: boolean;
  isTomorrow: boolean;
}

interface DateTabsProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateTabs: React.FC<DateTabsProps> = ({ selectedDate, onDateSelect }) => {
  // Generate date tabs: Today, Tomorrow, and next 5 days
  const generateDateTabs = (): DateTab[] => {
    const tabs: DateTab[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today
    tabs.push({
      date: new Date(today),
      label: 'Today',
      isToday: true,
      isTomorrow: false,
    });
    
    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tabs.push({
      date: tomorrow,
      label: 'Tomorrow',
      isToday: false,
      isTomorrow: true,
    });
    
    // Next 5 days
    for (let i = 2; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      tabs.push({
        date,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: false,
        isTomorrow: false,
      });
    }
    
    return tabs;
  };

  const dateTabs = generateDateTabs();
  
  // Compare dates by day (ignore time)
  const isDateSelected = (tabDate: Date): boolean => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const tab = new Date(tabDate);
    tab.setHours(0, 0, 0, 0);
    return selected.getTime() === tab.getTime();
  };

  return (
    <div className="px-8 pt-4 pb-3 shrink-0">
      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {dateTabs.map((tab) => {
          const isSelected = isDateSelected(tab.date);
          
          return (
            <button
              key={tab.date.getTime()}
              onClick={() => onDateSelect(tab.date)}
              className={`
                shrink-0 px-4 py-2 rounded-full font-bold text-[13px] transition-all duration-200
                ${isSelected 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-white/60 text-black/70 hover:bg-white/80'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
