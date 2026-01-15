import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
export type ThemeVariant = 'blue' | 'peach' | 'purple' | 'green';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center font-bold text-[16px] mobile-lg:text-[17px] tracking-tight transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100";
  
  const variants = {
    // Solid Black Pill
    primary: `h-[56px] mobile-lg:h-[60px] rounded-full bg-black text-white shadow-xl ${className}`,
    // Outline Black
    secondary: `h-[52px] mobile-lg:h-[56px] rounded-full border-2 border-black/10 bg-white/20 text-black backdrop-blur-sm ${className}`,
    // Text only
    ghost: `h-[44px] mobile-lg:h-[48px] bg-transparent text-black/60 hover:text-black ${className}`,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-black">
          {icon}
        </div>
      )}
      <input
        className={`w-full h-[56px] mobile-lg:h-[60px] bg-transparent border-b-2 border-black/20 text-[20px] mobile-lg:text-[22px] font-bold text-black placeholder-black/30 outline-none transition-all focus:border-black ${
          icon ? 'pl-10' : 'pl-0'
        }`}
        {...props}
      />
    </div>
  );
};

// --- Screen Layout ---
interface ScreenLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  theme?: ThemeVariant;
  title?: string; // Optional small title for header
}

const gradients: Record<ThemeVariant, string> = {
  blue: 'bg-gradient-to-b from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
  peach: 'bg-gradient-to-b from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]',
  purple: 'bg-gradient-to-b from-[#F3E8FF] via-[#E9D5FF] to-[#D8B4FE]',
  green: 'bg-gradient-to-b from-[#DCFCE7] via-[#BBF7D0] to-[#86EFAC]',
};

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ 
  children, 
  step, 
  totalSteps = 5, 
  onBack, 
  onSkip,
  showBack,
  theme = 'blue'
}) => {
  return (
    <div className={`relative flex flex-col w-full overflow-hidden viewport-height ${gradients[theme]} text-black`}>
      {/* Dynamic Background Noise/Texture Overlay (Optional) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Safe Area Top */}
      <div className="pt-[calc(env(safe-area-inset-top)+16px)] px-8 flex-1 flex flex-col relative z-10 min-h-0">
        
        {/* Minimal Header */}
        <div className="h-[36px] flex items-center justify-between w-full mb-3">
          <div className="flex items-center">
            {showBack && onBack && (
              <button 
                onClick={onBack}
                className="w-[44px] h-[44px] flex items-center justify-start -ml-2 text-black/80 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-8 h-8" strokeWidth={2.5} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step !== undefined && step > 0 && (
              <span className="text-[14px] font-bold text-black/60">
                {step}<span className="text-black/30">/</span>{totalSteps}
              </span>
            )}
            {onSkip && (
              <button onClick={onSkip} className="text-[14px] font-bold uppercase tracking-wider text-black/40">
                Skip
              </button>
            )}
          </div>
        </div>
        
        {children}
      </div>

    </div>
  );
};

// --- Toggle ---
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`w-[60px] h-[36px] rounded-full relative transition-all duration-300 border-2 ${
        checked ? 'bg-black border-black' : 'bg-transparent border-black/20'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      <div
        className={`absolute top-[2px] left-[2px] w-[28px] h-[28px] rounded-full shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-[24px] bg-white' : 'translate-x-0 bg-black/20'
        }`}
      />
    </button>
  );
};
