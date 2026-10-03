import React from 'react';
import { 
  Menu, 
  MapPin, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Languages, 
  Type,
  Compass,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { FarmProfile } from '@/src/types';
import { useI18n, TextSize } from '@/src/lib/i18n/context';

interface HeaderProps {
  currentTab: NavTab;
  farm: FarmProfile;
  onOpenMobileMenu: () => void;
  onGeneratePlanClick: () => void;
  onOpenOnboarding: () => void;
  isGeneratingPlan?: boolean;
  farmSummaryText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  farm,
  onOpenMobileMenu,
  onGeneratePlanClick,
  onOpenOnboarding,
  isGeneratingPlan = false,
  farmSummaryText = ''
}) => {
  const { language, setLanguage, textSize, setTextSize, t, isSpeaking, speak, stopSpeaking } = useI18n();

  const getPageInfo = (): { title: string; subtitle: string } => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: language === 'bn' ? 'খামার ওভারভিউ' : 'Farm Overview',
          subtitle: language === 'bn' ? 'আজ আপনার খামারের সামগ্রিক পরিস্থিতি' : 'Here is what is happening on your farm.'
        };
      case 'farm':
        return {
          title: language === 'bn' ? 'আমার খামার' : 'My Farm',
          subtitle: language === 'bn' ? 'মাটির বিবরণ, জমির সীমানা ও পরিমাপ' : 'Soil parameters, geography, and botanical history.'
        };
      case 'planner':
        return {
          title: language === 'bn' ? 'ফসল পরিকল্পনা' : 'Crop Planner',
          subtitle: language === 'bn' ? 'পরবর্তী মৌসুমের জন্য উপযুক্ত ফসলের ক্রম' : 'Explore a suitable path for your next crops.'
        };
      case 'climate':
        return {
          title: language === 'bn' ? 'আবহাওয়া মানচিত্র' : 'Climate Map',
          subtitle: language === 'bn' ? 'নাসার মাল্টি-লেয়ার উপগ্রহ পর্যবেক্ষণ' : 'Multi-layer radiometric satellite telemetry and indicators.'
        };
      case 'scenarios':
        return {
          title: language === 'bn' ? 'পরিস্থিতি পরীক্ষা' : 'Scenario Lab',
          subtitle: language === 'bn' ? 'বৃষ্টি বা তাপমাত্রা পরিবর্তনের প্রভাব' : 'Explore how changing conditions affect your crop plan.'
        };
      case 'assistant':
        return {
          title: language === 'bn' ? 'টেরা সহকারী' : 'Ask Terra',
          subtitle: language === 'bn' ? 'আপনার খামার সংক্রান্ত প্রশ্নের উত্তর' : 'Contextual AI assistance grounded in NASA observations.'
        };
      case 'sources':
        return {
          title: language === 'bn' ? 'তথ্যের উৎস' : 'Data Sources',
          subtitle: language === 'bn' ? 'নাসা ও বৈজ্ঞানিক তথ্যের স্বচ্ছতা' : 'Verified sensor products, resolutions, and refresh intervals.'
        };
      default:
        return { title: 'Farm Intelligence', subtitle: '' };
    }
  };

  const current = getPageInfo();

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const handleToggleTextSize = () => {
    const nextSize: Record<TextSize, TextSize> = {
      'normal': 'large',
      'large': 'extra-large',
      'extra-large': 'normal'
    };
    setTextSize(nextSize[textSize]);
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const textToRead = farmSummaryText || `${current.title}. ${current.subtitle}`;
      speak(textToRead);
    }
  };

  return (
    <header className="bg-white border-b border-[#DCE2D8] px-4 sm:px-8 py-3.5 sticky top-0 z-20 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#243428] hover:bg-[#F1F4EF] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#193D25]" />
          </button>

          <div className="truncate">
            <h1 className="text-base sm:text-xl font-semibold text-[#193D25] tracking-tight truncate">
              {current.title}
            </h1>
            <p className="text-[12px] text-[#697568] hidden sm:block truncate mt-0.5">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Data Status, Accessibility & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Data Freshness Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1F4EF] border border-[#DCE2D8] text-[11px] text-[#697568]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36764A]" />
            <span className="font-medium">NASA SMAP Synchronized</span>
          </div>

          {/* Read Aloud Voice Button */}
          <button
            onClick={handleToggleSpeech}
            className={`min-h-[38px] px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-[#B9822A]/15 border-[#B9822A] text-[#B9822A] animate-pulse'
                : 'bg-white border-[#DCE2D8] text-[#697568] hover:text-[#193D25] hover:bg-[#F2F1E8]'
            }`}
            title={isSpeaking ? t.stopAudio : t.readAloud}
          >
            {isSpeaking ? (
              <VolumeX className="w-3.5 h-3.5 text-[#B9822A]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#71966B]" />
            )}
            <span className="hidden md:inline text-[11px]">
              {isSpeaking ? t.stopAudio : t.readAloud}
            </span>
          </button>

          {/* Text Size Accessibility Switcher */}
          <button
            onClick={handleToggleTextSize}
            className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-full border border-[#DCE2D8] bg-white text-[#697568] hover:text-[#193D25] hover:bg-[#F2F1E8] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title={`${t.textSize}: ${textSize}`}
          >
            <Type className="w-3.5 h-3.5 text-[#71966B]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {textSize === 'normal' ? 'A' : textSize === 'large' ? 'A+' : 'A++'}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={handleToggleLanguage}
            className="min-h-[38px] px-3 py-1.5 rounded-full border border-[#DCE2D8] bg-white text-[#243428] hover:bg-[#F2F1E8] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-[#71966B]" />
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Farm Location Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#697568] bg-[#F1F4EF] border border-[#DCE2D8] px-3 py-1.5 rounded-full">
            <MapPin className="w-3 h-3 text-[#71966B] shrink-0" />
            <span className="font-medium truncate max-w-[120px]">{farm.location.region || farm.name}</span>
          </div>

          {/* Primary Action Button — Adaline Pill Style */}
          <button
            onClick={onGeneratePlanClick}
            disabled={isGeneratingPlan}
            className={`min-h-[38px] flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs cursor-pointer ${
              isGeneratingPlan
                ? 'bg-[#F2F1E8] text-[#8A9286] cursor-not-allowed border border-[#DCE2D8]'
                : 'bg-[#193D25] hover:bg-[#285C35] text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#DDE8D8]" />
            <span>
              {isGeneratingPlan 
                ? (language === 'bn' ? 'হিসাব হচ্ছে...' : 'Optimizing...') 
                : (language === 'bn' ? 'ফসল পরিকল্পনা' : 'Plan Next Crop')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
