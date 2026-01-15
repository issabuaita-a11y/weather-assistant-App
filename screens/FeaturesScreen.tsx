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
    { key: 'uvIndex', label: 'UV Index', icon: <Sun size={20} /> },
    { key: 'sunriseSunset', label: 'Sunrise', icon: <Sunrise size={20} /> },
    { key: 'windSpeed', label: 'Wind', icon: <Wind size={20} /> },
    { key: 'humidity', label: 'Humidity', icon: <Droplets size={20} /> },
    { key: 'airQuality', label: 'Air Quality', icon: <Activity size={20} /> },
    { key: 'visibility', label: 'Visibility', icon: <Eye size={20} /> },
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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 pt-2 mobile-lg:pt-4 overflow-y-auto no-scrollbar pb-24">
          <h1 className="text-[36px] mobile-lg:text-[40px] font-black text-black leading-[0.95] tracking-tighter mb-1 mobile-lg:mb-2">
            What Matters?
          </h1>
          <p className="text-[14px] mobile-lg:text-[15px] font-bold text-black/60 mb-4 mobile-lg:mb-5">
              Customize your dashboard.
          </p>

          <div className="space-y-1.5">
              {/* Essential (Static) */}
              <div className="p-4 mobile-lg:p-5 rounded-[24px] bg-black/5 border border-black/5 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                      <Thermometer size={20} className="text-black mobile-lg:w-5 mobile-lg:h-5" />
                      <span className="text-[16px] mobile-lg:text-[17px] font-bold text-black">Essentials</span>
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-black/40">Active</span>
              </div>

              {/* Customizables */}
               {FEATURE_CONFIG.map((item) => (
                  <div key={item.key} className="p-4 mobile-lg:p-5 rounded-[24px] bg-white/40 border border-white/50 backdrop-blur-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="text-black">{item.icon}</div>
                          <span className="text-[16px] mobile-lg:text-[17px] font-bold text-black">{item.label}</span>
                      </div>
                      <Toggle 
                          checked={currentFeatures[item.key]} 
                          onChange={() => toggleFeature(item.key)} 
                      />
                  </div>
              ))}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 px-8 pt-4 pb-4 z-20 bg-transparent">
          <Button onClick={onNext}>Finish Setup</Button>
        </div>
      </div>
    </ScreenLayout>
  );
};