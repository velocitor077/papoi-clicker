import React from 'react';
import { FloatingText } from '../types';

interface FloatingTextLayerProps {
  items: FloatingText[];
}

const FloatingTextLayer: React.FC<FloatingTextLayerProps> = ({ items }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-3xl font-bold font-display text-white drop-shadow-md select-none animate-bounce"
          style={{
            left: item.x,
            top: item.y,
            textShadow: '2px 2px 0 #000',
            animation: 'floatUp 1s ease-out forwards',
          }}
        >
          +{Math.floor(item.value)}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default FloatingTextLayer;