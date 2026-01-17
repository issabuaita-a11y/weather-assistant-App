import React from 'react';
import { SuggestionPriority } from '../../types/suggestions';

interface SmartSuggestionChipProps {
  text: string;
  icon: string;
  priority: SuggestionPriority;
}

export const SmartSuggestionChip: React.FC<SmartSuggestionChipProps> = ({ text, icon, priority }) => {
  const priorityStyles = {
    high: 'bg-red-100/80 border-red-200/50 text-red-900',
    medium: 'bg-blue-100/80 border-blue-200/50 text-blue-900',
    low: 'bg-gray-100/80 border-gray-200/50 text-gray-700',
  };

  return (
    <div className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-full border
      ${priorityStyles[priority]}
    `}>
      <span className="text-[14px]">{icon}</span>
      <span className="text-[12px] font-bold">{text}</span>
    </div>
  );
};
