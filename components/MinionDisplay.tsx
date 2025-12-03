
import React, { useState } from 'react';
import { MinionSkin } from '../types';

interface MinionDisplayProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  skin?: MinionSkin;
}

const MinionDisplay: React.FC<MinionDisplayProps> = ({ onClick, skin = 'default' }) => {
  const [isClicked, setIsClicked] = useState(false);
  const isPurple = skin === 'purple';
  const isGalaxy = skin === 'galaxy';

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsClicked(true);
    onClick(e);
  };

  const handleMouseUp = () => setIsClicked(false);

  // Determine colors based on skin
  let bodyFill = "#FACC15";
  let bodyStroke = "#CA8A04";
  
  if (isPurple) {
    bodyFill = "#9333EA";
    bodyStroke = "#581C87";
  } else if (isGalaxy) {
    bodyFill = "url(#galaxyGradient)";
    bodyStroke = "#22D3EE"; // Cyan neon glow
  }

  return (
    <div 
      className="relative flex justify-center items-center w-64 h-64 sm:w-80 sm:h-80 cursor-pointer select-none touch-manipulation"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        // Prevent default touch behavior (like scrolling) if needed, but usually better to let browser handle
        const touch = e.touches[0];
        handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY } as any);
      }}
      onTouchEnd={handleMouseUp}
    >
        <div className={`w-full h-full transition-transform duration-100 ease-out ${isClicked ? 'scale-90 rotate-[-5deg]' : 'scale-100 hover:scale-105 hover:rotate-3'}`}>
            <svg width="100%" height="100%" viewBox="0 0 200 200" className={isGalaxy ? "drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" : "drop-shadow-2xl"}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Galaxy Gradient and Pattern */}
                  <radialGradient id="galaxyGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="50%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                  
                  {/* Galaxy Stars Clip Path (used to animate stars inside banana) */}
                  <clipPath id="bananaClip">
                    <path
                        d="M 148 38 
                       Q 80 80 65 150 
                       Q 60 170 85 175 
                       Q 110 170 165 100 
                       Q 185 60 148 38"
                    />
                  </clipPath>
                </defs>

                {/* Stem Top */}
                <path 
                    d="M 135 45 C 130 40 135 25 145 20 C 155 15 160 35 150 45 Z" 
                    fill={isPurple ? "#3B0764" : isGalaxy ? "#000" : "#4A3728"}
                    stroke={isGalaxy ? "#22D3EE" : "none"}
                    strokeWidth={isGalaxy ? "1" : "0"} 
                />
                
                {/* Main Body */}
                <path
                    d="M 148 38 
                       Q 80 80 65 150 
                       Q 60 170 85 175 
                       Q 110 170 165 100 
                       Q 185 60 148 38"
                    fill={bodyFill}
                    stroke={bodyStroke}
                    strokeWidth={isGalaxy ? "3" : "2"}
                    strokeLinejoin="round"
                    className="transition-colors duration-500"
                />

                {/* Stars for Galaxy Skin */}
                {isGalaxy && (
                  <g clipPath="url(#bananaClip)">
                    <circle cx="90" cy="80" r="1.5" fill="white" className="animate-pulse" style={{ animationDuration: '2s' }} />
                    <circle cx="120" cy="130" r="1" fill="white" className="animate-pulse" style={{ animationDuration: '3s' }} />
                    <circle cx="150" cy="70" r="2" fill="cyan" className="animate-pulse" style={{ animationDuration: '4s' }} />
                    <circle cx="80" cy="150" r="1.5" fill="purple" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
                    <circle cx="100" cy="100" r="0.5" fill="white" />
                    <circle cx="140" cy="50" r="0.5" fill="white" />
                    <circle cx="70" cy="120" r="1" fill="white" />
                  </g>
                )}

                {/* Bottom Tip (Dark spot) */}
                <path 
                    d="M 85 175 Q 82 178 78 174"
                    stroke={isPurple ? "#3B0764" : isGalaxy ? "#000" : "#4A3728"}
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                 
                {/* Shine / Reflection (Hidden on Galaxy) */}
                {!isGalaxy && (
                  <path
                      d="M 135 60 Q 90 90 85 140"
                      fill="none"
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      style={{ filter: 'blur(1px)' }}
                  />
                )}

                {/* Eyes */}
                <g className="transition-transform duration-200" style={{ transform: isClicked ? 'scaleY(0.8) translateY(10px)' : 'none', transformOrigin: 'center' }}>
                   {/* Goggle Band */}
                   <path d="M 95 100 Q 125 115 155 95" stroke={isGalaxy ? "#E0E7FF" : "#1F2937"} strokeWidth="8" fill="none" opacity="0.8" />
                   
                   {/* Eye */}
                   <circle cx="125" cy="105" r="18" fill={isGalaxy ? "#000" : "#E5E7EB"} stroke={isGalaxy ? "#22D3EE" : "#9CA3AF"} strokeWidth="4" />
                   <circle cx="125" cy="105" r="6" fill={isPurple ? "#7C3AED" : isGalaxy ? "#22D3EE" : "#78350F"} />
                   <circle cx="127" cy="103" r="2" fill="white" />
                </g>

                {/* Mouth */}
                {isPurple ? (
                  // Purple Minion "Evil" Teeth Mouth
                  <g>
                    {/* Dark Mouth Interior */}
                    <path 
                      d="M 110 130 Q 125 145 140 130" 
                      fill="#370000" 
                      stroke="#370000" 
                      strokeWidth="1"
                    />
                    {/* Teeth jutting up from bottom lip */}
                    <path 
                      d="M 112 135 L 115 128 L 118 136 L 121 128 L 124 137 L 127 128 L 130 136 L 133 128 L 136 135" 
                      fill="white" 
                      stroke="none"
                    />
                    {/* Outline */}
                    <path 
                      d="M 110 130 Q 125 145 140 130" 
                      fill="none" 
                      stroke="#374151" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                    />
                  </g>
                ) : (
                  // Normal Smile (Used for Default and Galaxy)
                  <path 
                    d="M 115 130 Q 125 140 135 130" 
                    fill="none" 
                    stroke={isGalaxy ? "#22D3EE" : "#374151"} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                )}

            </svg>
        </div>
    </div>
  );
};

export default MinionDisplay;
