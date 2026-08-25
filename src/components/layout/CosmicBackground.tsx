'use client';

import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  opacity: number;
}

export const CosmicBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate deterministic stars for cosmic starlight atmosphere
    const generated: Star[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() > 0.8 ? 3 : Math.random() > 0.4 ? 2 : 1,
      delay: Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.7,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden flex flex-col selection:bg-cosmic-purple/30 selection:text-white">
      {/* Deep cosmic nebula glow gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-cosmic-purple/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-cosmic-pink/8 blur-[150px]" />
        <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] rounded-full bg-cosmic-indigo/10 blur-[140px]" />

        {/* Twinkling starlight particles */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col flex-1 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
};
