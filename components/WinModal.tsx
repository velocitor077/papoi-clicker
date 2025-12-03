
import React, { useState, useEffect } from 'react';

interface WinModalProps {
  isOpen: boolean;
  prestigeCount: number;
  onRebirth: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ isOpen, prestigeCount, onRebirth }) => {
  const [step, setStep] = useState<'info' | 'confirm'>('info');

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) setStep('info');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 w-[95%] md:w-[500px] max-w-full shadow-2xl relative text-center transition-all overflow-y-auto max-h-[90vh]">
        
        {step === 'info' ? (
          <>
            <div className="text-6xl mb-4 animate-bounce">🌑</div>
            
            <h2 className="text-3xl md:text-5xl font-display text-yellow-400 mb-2 uppercase tracking-wider text-shadow-black">
              ¡LA LUNA ES TUYA!
            </h2>
            
            <p className="text-indigo-200 text-base md:text-lg mb-6 md:mb-8 leading-tight">
              Has completado el plan maestro. Gru está orgulloso de ti.
              Pero... ¿es suficiente una sola Luna?
            </p>

            <div className="bg-black/40 p-4 md:p-6 rounded-xl border border-white/10 mb-6 md:mb-8">
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">RENACIMIENTO (Prestigio)</h3>
              <p className="text-gray-300 text-xs md:text-sm mb-4">
                Reinicia tus bananas y estructuras, pero desbloquea nuevos desafíos.
              </p>
              <ul className="text-left text-sm text-yellow-200 space-y-2 pl-2 md:pl-4">
                <li>✅ Desbloquea estructuras secretas.</li>
                <li>📈 "Robo de la Luna" será más caro.</li>
                <li>✨ Nivel de Prestigio: <span className="text-white font-bold">{prestigeCount}</span> → <span className="text-green-400 font-bold">{prestigeCount + 1}</span></li>
                <li>💰 Multiplicador Global: <span className="text-white font-bold">x{prestigeCount + 1}</span> → <span className="text-green-400 font-bold text-lg">x{prestigeCount + 2}</span></li>
              </ul>
            </div>
            
            <button 
              onClick={() => setStep('confirm')}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-display font-bold py-3 md:py-4 rounded-xl transition-all border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 shadow-lg shadow-yellow-500/20 touch-manipulation"
            >
              ¡RENACER! 🔁
            </button>
          </>
        ) : (
          <div className="py-4 animate-fade-in">
             <div className="text-6xl mb-6">⚠️</div>
             <h3 className="text-2xl md:text-3xl font-display text-red-500 mb-4 uppercase tracking-wider text-shadow-black">
               ¿Estás seguro?
             </h3>
             <p className="text-white mb-2 text-base md:text-lg">
               Esta acción reiniciará todo tu progreso actual.
             </p>
             <p className="text-red-300 text-xs md:text-sm italic mb-8 border border-red-500/30 bg-red-900/20 p-2 rounded">
               Perderás tus bananas, edificios y mejoras actuales.<br/>
               Obtendrás un multiplicador permanente <strong>x{prestigeCount + 2}</strong>.
             </p>
             
             <div className="flex gap-4">
                <button 
                  onClick={() => setStep('info')}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 transition-all touch-manipulation"
                >
                  Cancelar
                </button>
                <button 
                  onClick={onRebirth}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-red-900/50 touch-manipulation"
                >
                  Sí, Renacer
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WinModal;
