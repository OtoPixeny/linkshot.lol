import React from 'react';

export function NoiseBackground({ 
  children, 
  containerClassName = "", 
  gradientColors = ["rgb(255, 100, 150)", "rgb(100, 150, 255)", "rgb(255, 200, 100)"] 
}) {
  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        background: `linear-gradient(135deg, ${gradientColors.join(", ")})`,
      }}
    >
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
