import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

interface DurationPickerModalProps {
  isOpen: boolean;
  currentDuration: string; // Format: "1 hour before heading out" or "30 min before heading out"
  onSave: (duration: string) => void;
  onCancel: () => void;
  title: string;
}

export const DurationPickerModal: React.FC<DurationPickerModalProps> = ({
  isOpen,
  currentDuration,
  onSave,
  onCancel,
  title,
}) => {
  // Parse current duration (e.g., "1 hour before heading out" -> { hours: 1, minutes: 0 })
  const parseDuration = (durationStr: string) => {
    const hourMatch = durationStr.match(/(\d+)\s*hour/i);
    const minMatch = durationStr.match(/(\d+)\s*min/i);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 1;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return { hours, minutes };
  };

  const initialDuration = parseDuration(currentDuration);
  const [selectedHours, setSelectedHours] = useState(initialDuration.hours);
  const [selectedMinutes, setSelectedMinutes] = useState(initialDuration.minutes);

  // Update state when modal opens with new currentDuration
  React.useEffect(() => {
    if (isOpen) {
      const parsed = parseDuration(currentDuration);
      setSelectedHours(parsed.hours);
      setSelectedMinutes(parsed.minutes);
    }
  }, [isOpen, currentDuration]);

  const formatDuration = (hours: number, minutes: number): string => {
    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'min' : 'min'}`);
    }
    if (parts.length === 0) {
      return '30 min';
    }
    return parts.join(' ');
  };

  const handleSave = () => {
    const duration = formatDuration(selectedHours, selectedMinutes);
    onSave(`${duration} before heading out`);
  };

  // Generate hour options (0-6)
  const hours = Array.from({ length: 7 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74] rounded-[32px] p-6 w-full max-w-sm mx-4 shadow-2xl border-2 border-white/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-black text-black">{title}</h2>
          <button
            onClick={onCancel}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-black" />
          </button>
        </div>

        {/* Duration Picker */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            {/* Hours Selector */}
            <div className="flex flex-col items-center">
              <label className="text-[12px] font-bold text-black/60 mb-2 uppercase tracking-wider">Hours</label>
              <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border border-white/50 p-2 max-h-[200px] overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHours(hour)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold transition-all ${
                      selectedHours === hour
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-white/40'
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Selector */}
            <div className="flex flex-col items-center">
              <label className="text-[12px] font-bold text-black/60 mb-2 uppercase tracking-wider">Minutes</label>
              <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border border-white/50 p-2 max-h-[200px] overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinutes(minute)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold transition-all ${
                      selectedMinutes === minute
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-white/40'
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 text-center">
            <div className="text-[24px] font-black text-black">
              {formatDuration(selectedHours, selectedMinutes)} before heading out
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
