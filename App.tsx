import React, { useState, useEffect } from 'react';
import { OnboardingData, ScreenStep } from './types';
import { INITIAL_ONBOARDING_DATA } from './constants';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { AddressScreen } from './screens/AddressScreen';
import { LocationPermissionScreen } from './screens/LocationPermissionScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { FeaturesScreen } from './screens/FeaturesScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { Dashboard } from './components/dashboard/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'weather_app_onboarding_v2';

export default function App() {
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
  const [step, setStep] = useState<ScreenStep>(ScreenStep.Welcome);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // In development mode, skip localStorage to always start fresh
    if (import.meta.env.DEV) {
      setLoaded(true);
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Robust hydration: Merge initial data with parsed data
        // This ensures that if the saved data is missing keys (like weatherFeatures),
        // the app falls back to the initial defaults instead of crashing.
        setData(prev => ({
            ...INITIAL_ONBOARDING_DATA,
            ...parsed,
            // Ensure permissions object is merged, not replaced
            permissions: {
                ...INITIAL_ONBOARDING_DATA.permissions,
                ...(parsed.permissions || {})
            },
            // Ensure weatherFeatures object is merged
            weatherFeatures: {
                ...INITIAL_ONBOARDING_DATA.weatherFeatures,
                ...(parsed.weatherFeatures || {})
            }
        }));

        // If onboarding is completed, we'll show Dashboard (handled in render)
        // Otherwise, restore the step they were on
        if (!parsed.completed && typeof parsed.currentStep === 'number') {
            setStep(parsed.currentStep);
        }
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
        // If parsing fails, we stick to initial data
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // Only persist to localStorage in production
    if (!loaded || import.meta.env.DEV) return;
    const dataToSave = { ...data, currentStep: step };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [data, step, loaded]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setStep(prev => {
      const next = prev + 1;
      // Skip LocationPermission step (merged into Address)
      if (next === ScreenStep.LocationPermission) {
        return ScreenStep.Calendar;
      }
      return Math.min(next, ScreenStep.Completion);
    });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, ScreenStep.Welcome));
  };

  const completeOnboarding = () => {
    updateData({ completed: true });
  };

  if (!loaded) return null;

  // Show Dashboard if onboarding is completed
  if (data.completed) {
    return (
      <div className="bg-black min-h-screen w-full flex items-center justify-center font-sans overflow-hidden">
        <Dashboard />
      </div>
    );
  }

  const renderScreen = () => {
    const commonProps = {
      data,
      updateData,
      onNext: nextStep,
      onBack: prevStep,
    };

    switch (step) {
      case ScreenStep.Welcome:
        return <WelcomeScreen onNext={nextStep} />;
      case ScreenStep.Address:
        return <AddressScreen {...commonProps} onSkip={nextStep} />;
      case ScreenStep.LocationPermission:
        // Skip LocationPermission step - merged into Address screen
        // This should never be reached due to nextStep() logic, but handle it just in case
        return <CalendarScreen {...commonProps} />;
      case ScreenStep.Calendar:
        return <CalendarScreen {...commonProps} />;
      case ScreenStep.Notifications:
        return <NotificationScreen {...commonProps} />;
      case ScreenStep.Features:
        return <FeaturesScreen {...commonProps} />;
      case ScreenStep.Completion:
        return <CompletionScreen data={data} onComplete={completeOnboarding} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="bg-black min-h-screen w-full flex items-center justify-center font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full min-h-screen max-w-md bg-white relative overflow-hidden sm:rounded-[40px] sm:h-[844px] sm:min-h-0 sm:shadow-2xl sm:border-[8px] sm:border-black"
        >
            {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}