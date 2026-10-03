import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  Droplets, 
  Coins, 
  Sparkles, 
  CloudSun, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  CheckSquare, 
  ArrowLeft,
  HelpCircle,
  Sun,
  Flame,
  CloudRain,
  Compass
} from 'lucide-react';
import { PlayerStats, GameWeatherScenario } from '@/src/types/game';
import { sound } from '@/src/lib/game/soundEffects';

export interface HotbarItem {
  id: string;
  name: string;
  icon: string;
  type: 'tool' | 'seed' | 'action';
  cropId?: string;
  count?: number;
}

interface GameHUDProps {
  player: PlayerStats;
  scenario: GameWeatherScenario;
  onOpenFieldGuide: () => void;
  onOpenQuests: () => void;
  onOpenNASA: () => void;
  onOpenTerra: () => void;
  onOpenSeedDepot: () => void;
  onReturnToApp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onScenarioChange: (scenarioId: string) => void;
  scenarios: GameWeatherScenario[];
  showControlsHelp: boolean;
  onToggleControlsHelp: () => void;
  activeToolId: string;
  onSelectTool: (toolId: string, seedCropId?: string) => void;
  onAdvanceDay: () => void;
  currentDay: number;
}

export const HOTBAR_ITEMS: HotbarItem[] = [
  { id: 'hoe', name: 'Hoe', icon: '⛏️', type: 'tool' },
  { id: 'water_can', name: 'Water Can', icon: '💧', type: 'tool' },
  { id: 'seed_wheat', name: 'Wheat Seed', icon: '🌾', type: 'seed', cropId: 'wheat' },
  { id: 'seed_lentils', name: 'Lentil Seed', icon: '🫘', type: 'seed', cropId: 'lentils' },
  { id: 'seed_tomato', name: 'Tomato Seed', icon: '🍅', type: 'seed', cropId: 'tomato' },
  { id: 'seed_turnip', name: 'Turnip Seed', icon: '🥕', type: 'seed', cropId: 'turnip' },
  { id: 'scythe', name: 'Harvest', icon: '🧺', type: 'tool' },
  { id: 'pet', name: 'Pet Animals', icon: '❤️', type: 'action' }
];

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  scenario,
  onOpenFieldGuide,
  onOpenQuests,
  onOpenNASA,
  onOpenTerra,
  onOpenSeedDepot,
  onReturnToApp,
  soundEnabled,
  onToggleSound,
  onScenarioChange,
  scenarios,
  showControlsHelp,
  onToggleControlsHelp,
  activeToolId,
  onSelectTool,
  onAdvanceDay,
  currentDay
}) => {
  // Listen for keyboard 1-8 hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= HOTBAR_ITEMS.length) {
        const item = HOTBAR_ITEMS[num - 1];
        sound.playBlip();
        onSelectTool(item.id, item.cropId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTool]);

  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayName = weekdays[(currentDay - 1) % weekdays.length];

  return (
    <div className="pointer-events-none absolute inset-0 p-3 sm:p-4 flex flex-col justify-between z-30 select-none font-mono">
      {/* Top Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Left: Cozy Health & Stamina Bar (Stardew / Fields of Mistria style) */}
        <div className="pointer-events-auto bg-[#F7EFE2] text-[#3E2723] px-3.5 py-2.5 rounded-2xl border-3 border-[#A07044] shadow-xl flex items-center gap-3">
          {/* Level Circle */}
          <div className="w-10 h-10 rounded-full bg-[#388E3C] border-2 border-white flex flex-col items-center justify-center text-white shadow-inner">
            <span className="text-[9px] font-bold leading-none">LVL</span>
            <span className="text-xs font-black leading-none">{player.level}</span>
          </div>

          <div className="flex flex-col gap-1 min-w-[120px] sm:min-w-[150px]">
            {/* Stamina bar */}
            <div className="flex items-center justify-between text-[10px] font-bold leading-none">
              <span className="text-[#2E7D32]">ENERGY</span>
              <span>{player.energy}/{player.maxEnergy}</span>
            </div>
            <div className="h-3 w-full bg-[#D7CCC8] rounded-full overflow-hidden border border-[#8D6E63] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#81C784] rounded-full transition-all duration-300"
                style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
              />
            </div>

            {/* Water Can Meter */}
            <div className="flex items-center justify-between text-[10px] font-bold text-[#0277BD]">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 fill-current" />
                WATER
              </span>
              <span>{player.water}L</span>
            </div>
          </div>
        </div>

        {/* Center: Climate Scenario & Advance Day button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Scenario selector */}
          <div className="bg-[#F7EFE2] text-[#3E2723] px-3 py-1.5 rounded-2xl border-2 border-[#A07044] shadow-lg flex items-center gap-2 text-xs">
            <CloudSun className="w-4 h-4 text-[#E65100]" />
            <select
              value={scenario.id}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#3E2723] outline-none cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#F7EFE2] text-[#3E2723]">
                  {sc.name} ({sc.temperatureC}°C, {sc.rainfallMm}mm)
                </option>
              ))}
            </select>
          </div>

          {/* Child-Friendly "Advance Day" Button (Grows crops!) */}
          <button
            type="button"
            onClick={() => {
              sound.playHarvest();
              onAdvanceDay();
            }}
            className="px-3.5 py-1.5 rounded-2xl bg-[#E65100] hover:bg-[#F57C00] text-white border-2 border-[#FFE082] shadow-lg text-xs font-bold tracking-wider cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
            title="Advance Day: Sun rises and watered crops grow!"
          >
            <Sun className="w-3.5 h-3.5 text-[#FFE082] animate-spin" style={{ animationDuration: '6s' }} />
            <span>NEXT DAY ☀️</span>
          </button>
        </div>

        {/* Right: Authentic Cozy Clock & Calendar Box (Reference Visual) */}
        <div className="pointer-events-auto flex items-start gap-2">
          <div className="bg-[#F7EFE2] border-3 border-[#A07044] rounded-2xl shadow-xl p-2.5 flex items-center gap-3 text-[#3E2723]">
            {/* Season & Time */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#E65100] flex items-center gap-1">
                <span>🌸</span>
                <span>{scenario.season}</span>
              </span>
              <span className="text-sm font-black tracking-wider text-[#2E7D32]">
                9:50 AM
              </span>
            </div>

            {/* Calendar Card */}
            <div className="w-11 h-12 bg-white rounded-xl border-2 border-[#8D6E63] shadow-inner flex flex-col items-center justify-between p-1">
              <span className="text-[8px] font-bold text-white bg-[#D32F2F] px-1.5 rounded-xs w-full text-center">
                {dayName}
              </span>
              <span className="text-base font-black leading-none text-[#212121]">
                {currentDay}
              </span>
            </div>

            {/* Money & Gems */}
            <div className="flex flex-col justify-center text-xs font-bold leading-tight">
              <div className="flex items-center gap-1 text-[#E65100]">
                <span>🪙</span>
                <span>${player.coins}</span>
              </div>
              <div className="flex items-center gap-1 text-[#0288D1]">
                <span>💎</span>
                <span>{player.knowledge} XP</span>
              </div>
            </div>
          </div>

          {/* Sound & Exit button */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-[#F7EFE2] hover:bg-white text-[#3E2723] border-2 border-[#A07044] shadow-md transition-all cursor-pointer"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#388E3C]" /> : <VolumeX className="w-4 h-4 text-[#9E9E9E]" />}
            </button>

            <button
              type="button"
              onClick={onReturnToApp}
              className="p-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-white border-2 border-[#81C784] shadow-md transition-all cursor-pointer flex items-center justify-center"
              title="Return to TerraCrop Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls Help Overlay */}
      {showControlsHelp && (
        <div className="pointer-events-auto mx-auto max-w-md p-4 rounded-3xl bg-[#F7EFE2] border-3 border-[#A07044] text-[#3E2723] text-xs shadow-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-[#D7CCC8] pb-1.5">
            <span className="font-bold text-[#E65100]">🌱 HOW TO FARM IN TERRAFARM</span>
            <button onClick={onToggleControlsHelp} className="text-black/60 hover:text-black font-bold cursor-pointer">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-white/80 p-2 rounded-xl border border-[#D7CCC8]">
              <strong>Walk:</strong> WASD or Arrow Keys
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-[#D7CCC8]">
              <strong>Select Tool:</strong> Keys [1] to [8]
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-[#D7CCC8]">
              <strong>Farm:</strong> Click any plot or press [E]
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-[#D7CCC8]">
              <strong>Animals:</strong> Click cow/sheep to pet ❤️
            </div>
          </div>
        </div>
      )}

      {/* Bottom Area: Tool Belt Hotbar (Reference Visual 1, 2, 4) & Station Shortcuts */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Top Mini Buttons: Stations & Field Guide */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuests}
            className="px-3 py-1.5 rounded-xl bg-[#F7EFE2] hover:bg-white text-[#3E2723] border-2 border-[#A07044] shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#388E3C]" />
            <span>MISSIONS</span>
          </button>

          <button
            type="button"
            onClick={onOpenFieldGuide}
            className="px-3 py-1.5 rounded-xl bg-[#F7EFE2] hover:bg-white text-[#3E2723] border-2 border-[#A07044] shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0288D1]" />
            <span>FIELD GUIDE</span>
          </button>

          <button
            type="button"
            onClick={onOpenNASA}
            className="px-3 py-1.5 rounded-xl bg-[#F7EFE2] hover:bg-white text-[#3E2723] border-2 border-[#A07044] shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <span>🛰️</span>
            <span>NASA LAB</span>
          </button>

          <button
            type="button"
            onClick={onOpenTerra}
            className="px-3 py-1.5 rounded-xl bg-[#004D40] hover:bg-[#00695C] text-[#A7FFEB] border-2 border-[#00E676] shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <span>🤖</span>
            <span>ASK TERRA</span>
          </button>

          <button
            type="button"
            onClick={onOpenSeedDepot}
            className="px-3 py-1.5 rounded-xl bg-[#E65100] hover:bg-[#F57C00] text-white border-2 border-[#FFE082] shadow-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <span>🌾</span>
            <span>SEEDS MATRIX</span>
          </button>

          <button
            type="button"
            onClick={onToggleControlsHelp}
            className="p-1.5 rounded-xl bg-[#F7EFE2] hover:bg-white text-[#3E2723] border-2 border-[#A07044] shadow-md cursor-pointer"
            title="Controls & Tips"
          >
            <HelpCircle className="w-4 h-4 text-[#E65100]" />
          </button>
        </div>

        {/* AUTHENTIC RETRO TOOL BELT / HOTBAR (10 SLOTS) */}
        <div className="pointer-events-auto bg-[#EEDCC4] p-1.5 sm:p-2 rounded-2xl border-3 border-[#A07044] shadow-2xl flex items-center gap-1.5 sm:gap-2">
          {HOTBAR_ITEMS.map((item, index) => {
            const isSelected = activeToolId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.playBlip();
                  onSelectTool(item.id, item.cropId);
                }}
                className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#FFF8E1] border-[#E65100] ring-3 ring-[#FFA000] -translate-y-1 shadow-lg'
                    : 'bg-[#FAF3E8] border-[#BCAAA4] hover:border-[#8D6E63]'
                }`}
              >
                {/* Number Key Indicator */}
                <span className="absolute top-0.5 left-1 text-[9px] font-black text-[#8D6E63] leading-none">
                  {index + 1}
                </span>

                {/* Item Icon */}
                <span className="text-lg sm:text-xl">{item.icon}</span>

                {/* Tool label on hover */}
                <span className="text-[7px] sm:text-[8px] font-bold text-[#4E342E] leading-none truncate max-w-[40px]">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
