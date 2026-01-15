import React from 'react';
import { Thermometer, Clock, CloudRain, Sun, Sunrise, Wind, Droplets, Activity, Eye, Gauge } from 'lucide-react';
import { ScreenLayout, Button, Toggle } from '../components/ui';
import { OnboardingData, WeatherFeatures } from '../types';
import { ESSENTIAL_FEATURES, INITIAL_ONBOARDING_DATA } from '../constants';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FEATURE_CONFIG: { key: keyof WeatherFeatures; label: string; icon: React.ReactNode }[] = [
    { key: 'uvIndex', label: 'UV Index', icon: <Sun size={24} /> },
    { key: 'sunriseSunset', label: 'Sunrise', icon: <Sunrise size={24} /> },
    { key: 'windSpeed', label: 'Wind', icon: <Wind size={24} /> },
    { key: 'humidity', label: 'Humidity', icon: <Droplets size={24} /> },
    { key: 'airQuality', label: 'Air Quality', icon: <Activity size={24} /> },
    { key: 'visibility', label: 'Visibility', icon: <Eye size={24} /> },
];

export const FeaturesScreen: React.FC<Props> = ({ data, updateData, onNext, onBack }) => {
  // Defensive access to features to prevent crash
  const currentFeatures = data.weatherFeatures || INITIAL_ONBOARDING_DATA.weatherFeatures;

  const toggleFeature = (key: keyof WeatherFeatures) => {
    updateData({
      weatherFeatures: { ...currentFeatures, [key]: !currentFeatures[key] }
    });
  };

  return (
    <ScreenLayout step={5} showBack onBack={onBack} theme="purple">
      <div className="flex-1 pt-4 overflow-y-auto no-scrollbar">
        <h1 className="text-[48px] font-black text-black leading-[0.95] tracking-tighter mb-2">
          What Matters?
        </h1>
        <p className="text-[18px] font-bold text-black/60 mb-8">
            Customize your dashboard.
        </p>

        <div className="space-y-2 pb-4">
            {/* Essential (Static) */}
            <div className="p-5 rounded-[24px] bg-black/5 border border-black/5 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-4">
                    <Thermometer size={24} className="text-black" />
                    <span className="text-[20px] font-bold text-black">Essentials</span>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-black/40">Active</span>
            </div>

            {/* Customizables */}
             {FEATURE_CONFIG.map((item) => (
                <div key={item.key} className="p-5 rounded-[24px] bg-white/40 border border-white/50 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-black">{item.icon}</div>
                        <span className="text-[20px] font-bold text-black">{item.label}</span>
                    </div>
                    <Toggle 
                        checked={currentFeatures[item.key]} 
                        onChange={() => toggleFeature(item.key)} 
                    />
                </div>
            ))}
        </div>
      </div>

      <div className="mb-4 pt-4">
        <Button onClick={onNext}>Finish Setup</Button>
      </div>
    </ScreenLayout>
  );
};