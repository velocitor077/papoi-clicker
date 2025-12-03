
import React, { useState, useEffect } from 'react';

interface CheatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, prestige: number) => void;
  currentBananas: number;
  currentPrestige: number;
}

const CheatModal: React.FC<CheatModalProps> = ({ isOpen, onClose, onSubmit, currentBananas, currentPrestige }) => {
  const [bananaVal, setBananaVal] = useState('');
  const [prestigeVal, setPrestigeVal] = useState('');

  // Pre-fill values when opened
  useEffect(() => {
    if (isOpen) {
        setBananaVal(Math.floor(currentBananas).toString());
        setPrestigeVal(currentPrestige.toString());
    }
  }, [isOpen, currentBananas, currentPrestige]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseFloat(bananaVal);
    const p = parseInt(prestigeVal);
    
    if (!isNaN(b) && !isNaN(p)) {
      onSubmit(b, p);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 border-2 border-red-500 p-6 rounded-xl w-80 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h3 className="text-red-500 font-bold text-xl mb-4 font-mono flex items-center gap-2">
          <span>👾</span> DEV CONSOLE
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Bananas Input */}
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-mono">SET BANANAS:</label>
            <input 
              type="number" 
              className="w-full bg-black text-green-400 font-mono p-2 border border-gray-600 rounded focus:outline-none focus:border-red-500 text-lg"
              placeholder="0"
              value={bananaVal}
              onChange={e => setBananaVal(e.target.value)}
            />
          </div>

          {/* Prestige Input */}
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-mono">SET PRESTIGE (Multiplicador):</label>
            <input 
              type="number" 
              className="w-full bg-black text-purple-400 font-mono p-2 border border-gray-600 rounded focus:outline-none focus:border-red-500 text-lg"
              placeholder="0"
              value={prestigeVal}
              onChange={e => setPrestigeVal(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 font-mono mt-1">
              Current Multiplier: x{(parseInt(prestigeVal || '0') + 1)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-400 hover:text-white font-mono text-sm"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold font-mono text-sm transition-colors"
            >
              APPLY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheatModal;
