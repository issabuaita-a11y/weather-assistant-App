import React from 'react';

interface WeatherMetricBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const WeatherMetricBadge: React.FC<WeatherMetricBadgeProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-sm border border-white/50">
      <div className="text-black/80">{icon}</div>
      <span className="text-[12px] font-bold text-black">
        {label}: <span className="text-black/70">{value}</span>
      </span>
    </div>
  );
};
