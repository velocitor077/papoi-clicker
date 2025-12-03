
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MinionDisplay from './components/MinionDisplay';
import Store from './components/Store';
import FloatingTextLayer from './components/FloatingTextLayer';
import BackgroundWorld from './components/BackgroundWorld';
import SettingsModal from './components/SettingsModal';
import WinModal from './components/WinModal';
// CheatModal removed
import AchievementsModal from './components/AchievementsModal';
import { Building, FloatingText, SaveState, Upgrade, MinionSkin, Achievement } from './types';
import { INITIAL_BUILDINGS, INITIAL_UPGRADES, INITIAL_ACHIEVEMENTS, SAVE_KEY } from './constants';
import { soundManager } from './utils/audio';

// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000000000000) return (num / 1000000000000000).toFixed(2) + ' Q';
  if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + ' T';
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + ' B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + ' M';
  if (num >= 1000) return (num / 1000).toFixed(1) + ' k';
  return Math.floor(num).toLocaleString();
};

const formatDecimal = (num: number): string => {
  if (num < 1000) {
    // Show 1 decimal place for small numbers
    return num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  return formatNumber(num);
};

type Tab = 'game' | 'store';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [bananas, setBananas] = useState<number>(0);
  const [totalBananas, setTotalBananas] = useState<number>(0);
  const [prestigeCount, setPrestigeCount] = useState<number>(0);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  // Cheat modal state removed
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [musicVol, setMusicVol] = useState(0.5);
  const [sfxVol, setSfxVol] = useState(0.5);
  
  // Notification State
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [achievementToast, setAchievementToast] = useState<{show: boolean, name: string} | null>(null);
  
  // Visual State
  const [minionSkin, setMinionSkin] = useState<MinionSkin>('default');

  // Refs for Game Loop and Save
  const lastTimeRef = useRef<number>(Date.now());
  const buildingsRef = useRef<Building[]>(buildings);
  const saveIntervalRef = useRef<number | null>(null);
  

  // Keep refs synced
  useEffect(() => {
    buildingsRef.current = buildings;
  }, [buildings]);

  // Sync Audio Settings
  useEffect(() => {
    soundManager.setMusicVolume(musicVol);
  }, [musicVol]);

  useEffect(() => {
    soundManager.setSfxVolume(sfxVol);
  }, [sfxVol]);

  // Determine active skin
  useEffect(() => {
    if (prestigeCount >= 10) {
        setMinionSkin('galaxy');
        return;
    }

    // Simple check for Purple upgrade
    const hasPurpleSerum = upgrades.some(u => u.id === 'px41_serum' && u.owned);
    if (hasPurpleSerum) {
        setMinionSkin('purple');
    } else {
        setMinionSkin('default');
    }
  }, [upgrades, prestigeCount]);

  // --- Achievement Logic ---
  useEffect(() => {
    const checkAchievements = () => {
        const newUnlocks: string[] = [];
        
        INITIAL_ACHIEVEMENTS.forEach(ach => {
            if (unlockedAchievements.includes(ach.id)) return;

            let conditionMet = false;

            if (ach.conditionType === 'totalBananas') {
                if (totalBananas >= ach.conditionValue) conditionMet = true;
            } else if (ach.conditionType === 'prestige') {
                if (prestigeCount >= ach.conditionValue) conditionMet = true;
            } else if (ach.conditionType === 'building' && ach.conditionTarget) {
                const building = buildings.find(b => b.id === ach.conditionTarget);
                if (building && building.owned >= ach.conditionValue) conditionMet = true;
            }

            if (conditionMet) {
                newUnlocks.push(ach.id);
                // Trigger Toast for the first new achievement found in this loop
                setAchievementToast({ show: true, name: ach.name });
                soundManager.playBuySound(); // Re-use buy sound for satisfaction
                setTimeout(() => setAchievementToast(null), 4000);
            }
        });

        if (newUnlocks.length > 0) {
            setUnlockedAchievements(prev => [...prev, ...newUnlocks]);
        }
    };

    // Check every second to avoid spamming loop
    const interval = setInterval(checkAchievements, 1000);
    return () => clearInterval(interval);

  }, [totalBananas, prestigeCount, buildings, unlockedAchievements]);

  // --- Logic ---

  const calculateAchievementBonus = useCallback(() => {
      // 10% additive bonus per achievement (or could be 1.1 multiplier)
      // Let's go with +10% additive to base multiplier
      return 1 + (unlockedAchievements.length * 0.1);
  }, [unlockedAchievements]);

  const calculateCPS = useCallback(() => {
    const rawCps = buildings.reduce((acc, b) => acc + (b.owned * b.baseCps), 0);
    return rawCps * calculateAchievementBonus();
  }, [buildings, calculateAchievementBonus]);

  // Updated to calculate cost for multiple items using Geometric Series Formula
  const calculateBulkCost = useCallback((building: Building, quantity: number) => {
    if (building.id === 'moon_heist') {
       // Moon heist is unique, ignore quantity, always 1
       const prestigeMultiplier = Math.pow(14, prestigeCount);
       return building.baseCost * prestigeMultiplier;
    }
    
    // Formula: Sum = Base * 1.15^Owned * (1.15^n - 1) / (1.15 - 1)
    const basePriceCurrent = building.baseCost * Math.pow(1.15, building.owned);
    const totalCost = basePriceCurrent * (Math.pow(1.15, quantity) - 1) / 0.15;
    
    return Math.floor(totalCost);
  }, [prestigeCount]);

  // Calculate max affordable quantity
  const calculateMaxAffordable = useCallback((building: Building) => {
    if (building.id === 'moon_heist') {
        const cost = calculateBulkCost(building, 1);
        return bananas >= cost ? 1 : 0;
    }

    // Formula to find n:
    // Cost = Base * (r^n - 1) / (r-1)
    // Budget * (r-1) / Base + 1 = r^n
    // n = log_r ( ... )
    
    const basePriceCurrent = building.baseCost * Math.pow(1.15, building.owned);
    if (bananas < basePriceCurrent) return 0; // Can't even afford one

    const r = 1.15;
    const step1 = (bananas * (r - 1)) / basePriceCurrent;
    const step2 = step1 + 1;
    const n = Math.floor(Math.log(step2) / Math.log(r));

    return Math.max(0, n);
  }, [bananas, calculateBulkCost]);

  const calculateClickPower = useCallback(() => {
    let multiplier = 1;
    upgrades.filter(u => u.owned).forEach(u => multiplier *= u.multiplier);
    const cps = calculateCPS();
    
    const prestigeMultiplier = 1 + prestigeCount; 
    const achievementBonus = calculateAchievementBonus();

    // Note: Achievement bonus is already in CPS, but we also apply it to the base click
    return ((1 * multiplier * achievementBonus) + (cps * 0.05)) * prestigeMultiplier; 
  }, [calculateCPS, upgrades, prestigeCount, calculateAchievementBonus]);

  // Load Game
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed: SaveState = JSON.parse(saved);
        setBananas(parsed.bananas);
        setTotalBananas(parsed.totalBananas);
        setPrestigeCount(parsed.prestigeCount || 0);
        
        setBuildings(INITIAL_BUILDINGS.map(b => ({
          ...b,
          owned: parsed.buildings[b.id] || 0
        })));

        const ownedUpgradeIds = new Set(parsed.upgrades || []);
        setUpgrades(INITIAL_UPGRADES.map(u => ({
          ...u,
          owned: ownedUpgradeIds.has(u.id)
        })));

        if (parsed.achievements) {
            setUnlockedAchievements(parsed.achievements);
        }

        if (parsed.settings) {
            setMusicVol(parsed.settings.musicVolume);
            setSfxVol(parsed.settings.sfxVolume);
        }

      } catch (e) {
        console.error("Error loading save", e);
      }
    }
  }, []);

  // Save Game Loop
  useEffect(() => {
    saveIntervalRef.current = window.setInterval(() => {
      const stateToSave: SaveState = {
        bananas,
        totalBananas,
        prestigeCount,
        startTime: Date.now(),
        buildings: buildings.reduce((acc, b) => ({ ...acc, [b.id]: b.owned }), {}),
        upgrades: upgrades.filter(u => u.owned).map(u => u.id),
        achievements: unlockedAchievements,
        settings: {
            musicVolume: musicVol,
            sfxVolume: sfxVol
        }
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);

    }, 10000);

    return () => {
      if (saveIntervalRef.current) window.clearInterval(saveIntervalRef.current);
    };
  }, [bananas, totalBananas, prestigeCount, buildings, upgrades, unlockedAchievements, musicVol, sfxVol]);

  // Real Game Loop Implementation
  useEffect(() => {
      const loop = () => {
          const now = Date.now();
          const dt = (now - lastTimeRef.current) / 1000;
          lastTimeRef.current = now;
          
          if (dt > 0) {
             // Loop logic handled by interval below for simplicity in this React setup
          }
          requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
  }, []);

  // SIMPLE GAME LOOP
  useEffect(() => {
    const interval = setInterval(() => {
        const cps = calculateCPS();
        const prestigeBonus = 1 + prestigeCount;
        const earned = cps * prestigeBonus * 0.1; // 100ms interval = 0.1s
        
        if (earned > 0) {
            setBananas(prev => prev + earned);
            setTotalBananas(prev => prev + earned);
        }
    }, 100); // 10 ticks per second is smoother for UI updates than 1s

    return () => clearInterval(interval);
  }, [calculateCPS, prestigeCount]);


  // Interaction Handlers
  const handleMinionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    soundManager.init();
    soundManager.playClickSound();
    soundManager.playMusic();

    const amount = calculateClickPower();
    setBananas(prev => prev + amount);
    setTotalBananas(prev => prev + amount);

    const id = Date.now();
    const newText: FloatingText = {
      id,
      x: e.clientX - 20,
      y: e.clientY - 40,
      text: `+${amount < 1 && amount > 0 ? amount.toFixed(1) : formatDecimal(amount)}`,
      value: amount
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  const handlePurchaseBuilding = (buildingId: string, quantity: number) => {
    soundManager.init();
    
    if (buildingId === 'moon_heist') {
       const b = buildings.find(b => b.id === 'moon_heist');
       if (b) {
          const cost = calculateBulkCost(b, 1);
          if (bananas >= cost) {
              setBananas(curr => curr - cost);
              soundManager.playBuySound();
              setShowWinModal(true);
          }
       }
       return;
    }

    setBuildings(prev => prev.map(b => {
      if (b.id !== buildingId) return b;
      
      // Calculate actual cost for quantity (using updated formula)
      const cost = calculateBulkCost(b, quantity);
      
      if (bananas >= cost) {
        setBananas(curr => curr - cost);
        soundManager.playBuySound();
        return { ...b, owned: b.owned + quantity };
      }
      return b;
    }));
  };

  const handlePurchaseUpgrade = (upgradeId: string) => {
    soundManager.init();

    setUpgrades(prev => prev.map(u => {
      if (u.id !== upgradeId) return u;
      
      if (!u.owned && bananas >= u.cost) {
        setBananas(curr => curr - u.cost);
        soundManager.playBuySound();
        return { ...u, owned: true };
      }
      return u;
    }));
  };
  
  const handleRebirth = () => {
      const newPrestige = prestigeCount + 1;
      setPrestigeCount(newPrestige);
      setBananas(0);
      setTotalBananas(0);
      setBuildings(INITIAL_BUILDINGS);
      setUpgrades(INITIAL_UPGRADES); 
      // Keep achievements unlocked!
      setShowWinModal(false);
      
      const stateToSave: SaveState = {
        bananas: 0,
        totalBananas: 0,
        prestigeCount: newPrestige,
        startTime: Date.now(),
        buildings: INITIAL_BUILDINGS.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}),
        upgrades: [],
        achievements: unlockedAchievements,
        settings: { musicVolume: musicVol, sfxVolume: sfxVol }
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
  };

  let bgGradient = 'from-blue-400 to-blue-600';
  if (minionSkin === 'purple') bgGradient = 'from-purple-800 to-purple-950';
  if (minionSkin === 'galaxy') bgGradient = 'from-black via-indigo-950 to-purple-900';

  const currentCPS = calculateCPS() * (1 + prestigeCount);
  const currentClickPower = calculateClickPower();
  const isInfiniteMode = prestigeCount >= 10;
  const achievementBonusPct = Math.round((calculateAchievementBonus() - 1) * 100);

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row bg-gray-900 text-white overflow-hidden`}>
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        musicVolume={musicVol}
        sfxVolume={sfxVol}
        onMusicVolumeChange={setMusicVol}
        onSfxVolumeChange={setSfxVol}
      />

      <WinModal 
        isOpen={showWinModal}
        prestigeCount={prestigeCount}
        onRebirth={handleRebirth}
      />

      <AchievementsModal 
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        achievements={INITIAL_ACHIEVEMENTS}
        unlockedIds={unlockedAchievements}
      />

      <FloatingTextLayer items={floatingTexts} />

      {/* TOASTS */}
      <div className="fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        
        {/* Save Toast */}
        <div 
            className={`bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-500 transform ${showSaveToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <span>💾</span> Guardado
        </div>

        {/* Achievement Toast */}
        <div 
            className={`bg-yellow-500 text-black border-2 border-white px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center gap-3 transition-all duration-500 transform w-full ${achievementToast ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}`}
        >
            <span className="text-3xl animate-bounce">🏆</span> 
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">¡Logro Desbloqueado!</p>
                <p className="font-display font-bold text-lg leading-none truncate">{achievementToast?.name}</p>
            </div>
        </div>

      </div>

      {/* LEFT SECTION: GAMEPLAY */}
      <div 
        className={`flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-b ${bgGradient} overflow-hidden transition-colors duration-1000 ${activeTab === 'store' ? 'hidden md:flex' : 'flex'}`}
        style={{ paddingBottom: '5rem' }}
      >
        
        {/* Header Controls (Z-INDEX INCREASED TO 50) */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button 
                onClick={() => setShowAchievementsModal(true)}
                className="bg-black/30 hover:bg-yellow-500/80 hover:text-black text-yellow-400 p-2 rounded-full transition-colors backdrop-blur-sm border border-yellow-400/30 touch-manipulation"
                title="Logros"
            >
                <span className="text-xl">🏆</span>
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm touch-manipulation"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-[spin_20s_linear_infinite]"></div>
        </div>

        {/* Floating background icons */}
        <BackgroundWorld buildings={buildings} />

        <div className="absolute top-10 md:top-8 w-full text-center z-40 drop-shadow-lg select-none px-2 pointer-events-none">
          <h1 
            className={`text-4xl md:text-6xl font-display ${minionSkin === 'galaxy' ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 stroke-white' : minionSkin === 'purple' ? 'text-purple-300 stroke-purple-900' : 'text-yellow-400 stroke-black'} mb-2 transition-all`} 
            style={{ textShadow: minionSkin === 'galaxy' ? '0 0 10px rgba(255,255,255,0.5)' : '4px 4px 0 #000' }}
          >
            {formatDecimal(bananas)} Bananas
          </h1>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="flex items-center gap-2">
                 <p className="text-lg md:text-xl font-bold bg-black/30 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    {formatDecimal(currentCPS)}/seg
                 </p>
                 {achievementBonusPct > 0 && (
                     <span className="text-xs bg-green-600 px-2 py-1 rounded-full font-bold animate-pulse">
                         +{achievementBonusPct}% Bonus
                     </span>
                 )}
            </div>
            <div className="flex gap-2">
                <p className="text-xs md:text-sm font-bold bg-purple-900/50 inline-block px-3 py-0.5 rounded-full backdrop-blur-sm border border-purple-400/30 text-purple-200">
                Click: {formatDecimal(currentClickPower)}
                </p>
                {prestigeCount > 0 && (
                     <p className={`text-xs md:text-sm font-bold inline-block px-3 py-0.5 rounded-full backdrop-blur-sm border text-black ${isInfiniteMode ? 'bg-red-500 border-red-700 animate-pulse text-white' : 'bg-yellow-500/80 border-yellow-300'}`}>
                     {isInfiniteMode ? '♾️ INFINITO' : `⭐ Nivel ${prestigeCount}`}
                     </p>
                )}
            </div>
          </div>
        </div>

        <div className="z-20 scale-100">
          <MinionDisplay onClick={handleMinionClick} skin={minionSkin} />
        </div>
      </div>

      {/* RIGHT SECTION: STORE - Hidden on mobile if game tab active */}
      <div className={`md:h-full md:w-[400px] w-full z-30 relative ${activeTab === 'game' ? 'hidden md:flex' : 'flex h-full'}`}>
        <Store 
          bananas={bananas} 
          totalBananas={totalBananas}
          prestigeCount={prestigeCount}
          buildings={buildings}
          upgrades={upgrades} 
          onPurchaseBuilding={handlePurchaseBuilding} 
          onPurchaseUpgrade={handlePurchaseUpgrade}
          calculateCost={calculateBulkCost}
          calculateMax={calculateMaxAffordable}
        />
      </div>

      {/* MOBILE BOTTOM NAV BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-gray-900 border-t border-gray-700 z-50 grid grid-cols-2 shadow-2xl safe-area-bottom">
        <button 
            onClick={() => setActiveTab('game')}
            className={`flex flex-col items-center justify-center gap-1 touch-manipulation active:scale-95 transition-transform ${activeTab === 'game' ? 'text-yellow-400 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <span className="text-2xl">🍌</span>
            <span className="font-display font-bold text-xs uppercase">Juego</span>
        </button>
        <button 
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center justify-center gap-1 touch-manipulation active:scale-95 transition-transform ${activeTab === 'store' ? 'text-yellow-400 bg-gray-800' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <span className="text-2xl">🛒</span>
            <span className="font-display font-bold text-xs uppercase">Tienda</span>
        </button>
      </div>

    </div>
  );
}
