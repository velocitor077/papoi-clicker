
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicVolume: number;
  sfxVolume: number;
  onMusicVolumeChange: (val: number) => void;
  onSfxVolumeChange: (val: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  musicVolume,
  sfxVolume,
  onMusicVolumeChange,
  onSfxVolumeChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-gray-800 border-4 border-yellow-500 rounded-2xl p-6 w-[90%] md:w-96 max-w-lg shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors touch-manipulation"
        >
          ✕
        </button>
        
        <h2 className="text-2xl md:text-3xl font-display text-yellow-400 text-center mb-6 uppercase tracking-wider text-shadow-black">
          Ajustes
        </h2>

        <div className="space-y-6">
          {/* Music Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-white font-bold">
              <span>🎵 Música</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          {/* SFX Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-white font-bold">
              <span>🔊 Efectos</span>
              <span>{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs italic">
            Minion Mania: Banana Clicker<br/>
            Guarda automáticamente cada 10s
          </p>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 touch-manipulation"
        >
          ¡Listo!
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
