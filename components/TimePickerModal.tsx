import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui';

interface TimePickerModalProps {
  isOpen: boolean;
  currentTime: string; // Format: "7:00 AM"
  onSave: (time: string) => void;
  onCancel: () => void;
  title: string;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  currentTime,
  onSave,
  onCancel,
  title,
}) => {
  // Parse current time (e.g., "7:00 AM" -> { hour: 7, minute: 0, period: 'AM' })
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: parseInt(match[2]),
        period: match[3].toUpperCase(),
      };
    }
    return { hour: 7, minute: 0, period: 'AM' };
  };

  const initialTime = parseTime(currentTime);
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialTime.period as 'AM' | 'PM');

  // Update state when modal opens with new currentTime
  React.useEffect(() => {
    if (isOpen) {
      const parsed = parseTime(currentTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period as 'AM' | 'PM');
    }
  }, [isOpen, currentTime]);

  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleSave = () => {
    onSave(formatTime(selectedHour, selectedMinute, selectedPeriod));
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, ..., 55

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

        {/* Time Picker */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4">
            {/* Hour Selector */}
            <div className="flex flex-col items-center">
              <label className="text-[12px] font-bold text-black/60 mb-2 uppercase tracking-wider">Hour</label>
              <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border border-white/50 p-2 max-h-[200px] overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold transition-all ${
                      selectedHour === hour
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-white/40'
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Selector */}
            <div className="flex flex-col items-center">
              <label className="text-[12px] font-bold text-black/60 mb-2 uppercase tracking-wider">Minute</label>
              <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border border-white/50 p-2 max-h-[200px] overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold transition-all ${
                      selectedMinute === minute
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-white/40'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Selector */}
            <div className="flex flex-col items-center">
              <label className="text-[12px] font-bold text-black/60 mb-2 uppercase tracking-wider">Period</label>
              <div className="bg-white/60 backdrop-blur-sm rounded-[20px] border border-white/50 p-2">
                <button
                  onClick={() => setSelectedPeriod('AM')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold transition-all mb-1 ${
                    selectedPeriod === 'AM'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-black hover:bg-white/40'
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => setSelectedPeriod('PM')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
                    selectedPeriod === 'PM'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-black hover:bg-white/40'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 text-center">
            <div className="text-[32px] font-black text-black">
              {formatTime(selectedHour, selectedMinute, selectedPeriod)}
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
