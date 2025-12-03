
import React from 'react';
import { Achievement } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedIds: string[];
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({ 
  isOpen, 
  onClose, 
  achievements, 
  unlockedIds 
}) => {
  if (!isOpen) return null;

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;
  const bonus = unlockedCount * 10; // 10% bonus per achievement

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-800 border-4 border-yellow-500 rounded-2xl w-[95%] md:w-[600px] max-w-full max-h-[85vh] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-xl flex justify-between items-center">
            <div>
                <h2 className="text-xl md:text-2xl font-display text-yellow-400 uppercase tracking-wider text-shadow-black flex items-center gap-2">
                    🏆 Logros
                </h2>
                <p className="text-gray-400 text-xs">
                    Bonus Global: <span className="text-green-400 font-bold">+{bonus}% Producción</span>
                </p>
            </div>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors touch-manipulation"
            >
            ✕
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
            {achievements.map(ach => {
                const isUnlocked = unlockedIds.includes(ach.id);
                return (
                    <div 
                        key={ach.id} 
                        className={`flex items-center p-3 rounded-xl border-2 transition-all ${
                            isUnlocked 
                                ? 'bg-indigo-900/50 border-yellow-500/50 shadow-lg shadow-yellow-500/5' 
                                : 'bg-gray-700 border-gray-600 opacity-60 grayscale'
                        }`}
                    >
                        <div className={`w-10 h-10 min-w-[2.5rem] md:w-14 md:h-14 md:min-w-[3.5rem] rounded-full flex items-center justify-center text-xl md:text-3xl shadow-inner mr-3 md:mr-4 ${
                            isUnlocked ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-400'
                        }`}>
                            {ach.iconStr}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-sm md:text-base ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                {ach.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-300 leading-tight">
                                {ach.description}
                            </p>
                        </div>
                        {isUnlocked && (
                            <div className="text-xl md:text-2xl animate-pulse ml-2">
                                ✅
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b-xl text-center">
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden relative">
                <div 
                    className="bg-green-500 h-full transition-all duration-1000" 
                    style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
                    {unlockedCount} / {totalCount} Completado
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
