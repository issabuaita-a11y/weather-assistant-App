import React from 'react';
import { Luggage } from 'lucide-react';

export const TripsPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center px-8">
      <div className="text-center">
        <Luggage className="mx-auto mb-4 text-black/30" size={48} />
        <p className="text-[16px] font-bold text-black mb-2">Coming soon</p>
        <p className="text-[14px] font-medium text-black/60">
          Trip planning feature with extended forecasts and packing suggestions.
        </p>
      </div>
    </div>
  );
};
