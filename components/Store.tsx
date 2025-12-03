
import React, { useState } from 'react';
import { Building, Upgrade } from '../types';

interface StoreProps {
  bananas: number;
  totalBananas: number; // Lifetime bananas for unlocking
  prestigeCount: number;
  buildings: Building[];
  upgrades: Upgrade[];
  onPurchaseBuilding: (buildingId: string, quantity: number) => void;
  onPurchaseUpgrade: (upgradeId: string) => void;
  calculateCost: (building: Building, quantity: number) => number;
  calculateMax: (building: Building) => number;
}

// Helper local formatting just for the store header context
const formatCompact = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

const Store: React.FC<StoreProps> = ({ 
  bananas, 
  totalBananas, 
  prestigeCount,
  buildings, 
  upgrades, 
  onPurchaseBuilding, 
  onPurchaseUpgrade, 
  calculateCost,
  calculateMax
}) => {
  const [buyMultiplier, setBuyMultiplier] = useState<1 | 10 | 100 | 'MAX'>(1);

  // Filter upgrades: Not owned AND (trigger met OR prestige requirement met)
  const availableUpgrades = upgrades.filter(u => {
    if (u.owned) return false;
    // Basic requirement
    if (totalBananas < u.trigger) return false;
    // Prestige requirement
    if (u.minPrestige && prestigeCount < u.minPrestige) return false;
    return true;
  });
  
  // Show buildings if user meets prestige requirement
  const availableBuildings = buildings.filter(b => prestigeCount >= (b.minPrestige || 0));

  return (
    <div className="bg-gray-800 md:border-l-4 md:border-yellow-500 h-full flex flex-col shadow-2xl relative">
      <div className="p-3 md:p-4 bg-yellow-500 text-gray-900 shadow-md z-10 flex flex-col gap-2 sticky top-0">
        <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-display font-bold uppercase tracking-wider">Tienda</h2>
            {prestigeCount > 0 && (
            <span className={`text-xs font-bold px-2 py-1 rounded border ${prestigeCount >= 10 ? 'bg-red-600 text-white border-red-400' : 'bg-purple-900 text-purple-200 border-purple-500'}`}>
                {prestigeCount >= 10 ? '∞' : `R: ${prestigeCount}`}
            </span>
            )}
        </div>

        {/* Buy Multiplier Toggles - Larger Touch Targets */}
        <div className="flex bg-gray-900/20 p-1 rounded-lg gap-1">
           <button 
             onClick={() => setBuyMultiplier(1)}
             className={`flex-1 text-sm font-bold py-2 rounded transition-colors touch-manipulation ${buyMultiplier === 1 ? 'bg-gray-900 text-yellow-400' : 'text-gray-900 hover:bg-black/10'}`}
           >
             x1
           </button>
           <button 
             onClick={() => setBuyMultiplier(10)}
             className={`flex-1 text-sm font-bold py-2 rounded transition-colors touch-manipulation ${buyMultiplier === 10 ? 'bg-gray-900 text-yellow-400' : 'text-gray-900 hover:bg-black/10'}`}
           >
             x10
           </button>
           <button 
             onClick={() => setBuyMultiplier(100)}
             className={`flex-1 text-sm font-bold py-2 rounded transition-colors touch-manipulation ${buyMultiplier === 100 ? 'bg-gray-900 text-yellow-400' : 'text-gray-900 hover:bg-black/10'}`}
           >
             x100
           </button>
           <button 
             onClick={() => setBuyMultiplier('MAX')}
             className={`flex-1 text-sm font-bold py-2 rounded transition-colors touch-manipulation ${buyMultiplier === 'MAX' ? 'bg-red-600 text-white' : 'text-gray-900 hover:bg-black/10'}`}
           >
             MAX
           </button>
        </div>

        {/* Mobile-friendly balance display inside store */}
        <div className="flex items-center gap-2 md:hidden bg-black/20 rounded px-2 py-1.5 justify-center">
             <span className="text-xl">🍌</span>
             <span className="font-mono font-bold text-white text-xl">{Math.floor(bananas).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-24 md:pb-20 scroll-smooth">
        
        {/* UPGRADES SECTION */}
        {availableUpgrades.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white text-xs uppercase font-bold tracking-widest pl-1 opacity-70">Mejoras</h3>
            <div className="grid grid-cols-1 gap-2">
              {availableUpgrades.map((upgrade) => {
                 const canAfford = bananas >= upgrade.cost;
                 return (
                   <button
                    key={upgrade.id}
                    onClick={() => onPurchaseUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    className={`relative flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation
                      ${canAfford 
                        ? 'bg-purple-900 border-purple-500 hover:bg-purple-800 active:scale-95 cursor-pointer' 
                        : 'bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed'}
                    `}
                   >
                     <div className="w-12 h-12 min-w-[3rem] bg-purple-200 rounded flex items-center justify-center text-2xl mr-3 shadow-inner">
                        {upgrade.iconStr}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <span className="font-bold text-white text-sm truncate mr-2">{upgrade.name}</span>
                        </div>
                        <div className={`text-xs font-mono font-bold mb-0.5 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                            💰 {formatCompact(upgrade.cost)}
                        </div>
                        <div className="text-[10px] text-purple-200 leading-tight">{upgrade.description}</div>
                     </div>
                   </button>
                 );
              })}
            </div>
            <div className="h-px bg-white/10 w-full my-2"></div>
          </div>
        )}

        {/* BUILDINGS SECTION */}
        <div className="space-y-2">
           <h3 className="text-white text-xs uppercase font-bold tracking-widest pl-1 opacity-70">Estructuras</h3>
           {availableBuildings.map((building) => {
            const isMoonHeist = building.id === 'moon_heist';
            
            // Determine quantity and cost based on multiplier mode
            let quantity = 1;
            let cost = 0;

            if (isMoonHeist) {
                quantity = 1;
                cost = calculateCost(building, 1);
            } else if (buyMultiplier === 'MAX') {
                const maxBuy = calculateMax(building);
                // If can't afford any, show price of 1, but keep button disabled
                quantity = maxBuy > 0 ? maxBuy : 1;
                cost = calculateCost(building, quantity);
            } else {
                quantity = buyMultiplier;
                cost = calculateCost(building, quantity);
            }

            const canAfford = bananas >= cost;
            // Additional check for Max mode: if max is 0, we can't afford the 'quantity' (which defaults to 1 for display)
            const isDisabled = !canAfford || (buyMultiplier === 'MAX' && !isMoonHeist && calculateMax(building) === 0);
            
            return (
              <button
                key={building.id}
                onClick={() => onPurchaseBuilding(building.id, quantity)}
                disabled={isDisabled}
                className={`w-full group relative flex items-center p-3 rounded-xl border-b-4 transition-all duration-200 text-left touch-manipulation
                  ${!isDisabled
                    ? isMoonHeist 
                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-950 active:scale-95'
                        : 'bg-white border-gray-300 active:border-t-4 active:border-b-0 translate-y-0 active:translate-y-1' 
                    : 'bg-gray-400 opacity-60 cursor-not-allowed border-gray-500'}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 min-w-[3.5rem] rounded-lg flex items-center justify-center text-3xl shadow-inner mr-3 ${isMoonHeist ? 'bg-indigo-900 shadow-indigo-500/50' : 'bg-blue-100'}`}>
                  {building.iconStr}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-base leading-none truncate ${isMoonHeist ? 'text-yellow-400' : 'text-gray-800'}`}>{building.name}</span>
                    {!isMoonHeist && <span className="text-xl font-display text-gray-400 font-bold ml-2">{building.owned}</span>}
                  </div>
                  
                  <div className={`font-bold font-mono text-sm leading-none mb-1 ${!isDisabled ? 'text-green-600' : isMoonHeist ? 'text-red-400' : ''}`}>
                     💰 {Math.floor(cost).toLocaleString()} {quantity > 1 && !isMoonHeist && <span className="text-xs opacity-50 ml-1">(x{quantity})</span>}
                  </div>
                  
                  <div className={`text-[10px] truncate ${isMoonHeist ? 'text-indigo-300' : 'text-gray-500'}`}>
                    {isMoonHeist ? 'GANAR EL JUEGO' : `+${(building.baseCps * quantity).toLocaleString()} B/s`}
                  </div>
                </div>
                
                {/* Tooltip on hover (desktop only) */}
                <div className="hidden md:group-hover:block absolute right-full mr-2 top-1/2 -translate-y-1/2 w-64 bg-gray-900 text-white text-xs p-3 rounded z-50 pointer-events-none shadow-xl border border-yellow-500">
                  <p className="font-bold text-yellow-400 mb-1 text-sm">{building.name}</p>
                  <p className="mb-2 italic text-gray-300">"{building.description}"</p>
                  
                  {isMoonHeist ? (
                    <div className="mt-2 border-t border-gray-700 pt-2 bg-black/30 p-2 rounded">
                        <p className="text-purple-300 font-bold mb-1 uppercase tracking-wider">Recompensa de Renacimiento:</p>
                        <p className="text-gray-200">
                            Multiplicador Global: <span className="text-green-400 font-bold text-base">x{prestigeCount + 2}</span>
                        </p>
                    </div>
                  ) : (
                    <p>Produce: <span className="text-green-400 font-bold">{building.baseCps.toLocaleString()}</span> banana/s (cada una)</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Store;
