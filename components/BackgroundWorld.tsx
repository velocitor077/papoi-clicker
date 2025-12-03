import React, { useMemo } from 'react';
import { Building } from '../types';

interface BackgroundWorldProps {
  buildings: Building[];
}

interface VisualItem {
  id: string; // unique visual id
  icon: string;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  delay: number; // animation delay
  duration: number; // animation duration
}

const BackgroundWorld: React.FC<BackgroundWorldProps> = ({ buildings }) => {
  
  // Memoize the generation of visual items so they don't jump around on re-renders
  // We only want to regenerate if the *number* of owned buildings changes drastically, 
  // but since we cap the visual count, we can just derive it cleanly.
  const visualItems = useMemo(() => {
    const items: VisualItem[] = [];
    const MAX_VISIBLE_PER_TYPE = 8; // Don't clutter the screen too much
    
    buildings.forEach((b, bIndex) => {
      if (b.owned > 0) {
        // Limit how many we show
        const countToShow = Math.min(b.owned, MAX_VISIBLE_PER_TYPE);
        
        for (let i = 0; i < countToShow; i++) {
          // Deterministic "Random" Position based on building ID and index
          // This ensures the 1st farm always stays in the same spot when you buy the 2nd.
          const seed = b.id.charCodeAt(0) + b.id.charCodeAt(b.id.length - 1) + (i * 1357);
          
          // Helper for pseudo-random 0-1
          const pseudoRand = (offset: number) => {
            const x = Math.sin(seed + offset) * 10000;
            return x - Math.floor(x);
          };

          // Logic to avoid the center (where the main Minion is)
          // Center is approx 50% x, 50% y. Let's keep items in the outer 0-25% or 75-100% ranges primarily,
          // or just scatter them widely but keep z-index low.
          let x = pseudoRand(1) * 90; // 0-90%
          let y = pseudoRand(2) * 90; // 0-90%

          // Simple layout adjustment:
          // If x is between 30 and 70, push it out
          if (x > 30 && x < 70) {
             x = x < 50 ? x - 30 : x + 30;
          }
          // Clamp
          x = Math.max(2, Math.min(95, x));
          y = Math.max(5, Math.min(90, y));

          items.push({
            id: `${b.id}-${i}`,
            icon: b.iconStr,
            x,
            y,
            size: 24 + (pseudoRand(3) * 20), // Random size between 24px and 44px
            delay: pseudoRand(4) * 5,
            duration: 3 + pseudoRand(5) * 4, // 3s to 7s float duration
          });
        }
      }
    });
    return items;
  }, [buildings]); // Re-calc when building counts change (technically efficiently handled by React)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {visualItems.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center opacity-60 select-none animate-float-bg hover:opacity-100 transition-opacity"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {item.icon}
        </div>
      ))}
      <style>{`
        @keyframes float-bg {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float-bg {
          animation-name: float-bg;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default BackgroundWorld;
