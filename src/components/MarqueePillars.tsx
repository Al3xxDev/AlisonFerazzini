import React from 'react';

export const MarqueePillars: React.FC = () => {
  const pillars = [
    'DJ Set & Clubbing',
    'Matrimoni & Cerimonie',
    'Food & Beverage Styling',
    'Eventi Privati & Brand',
    'Video Recap per Social',
    'Lago di Garda · Brescia · Bergamo',
  ];

  // Repeat sequence twice per set so each half has 12 items, preventing any visual gap on wide monitors
  const sequence = [...pillars, ...pillars];

  return (
    <div
      className="py-5 bg-[#181615] text-[#FAF7F2] overflow-hidden border-y border-[#2A2826] relative select-none w-full"
      aria-label="Discipline fotografiche"
    >
      <div className="animate-marquee flex items-center text-xs tracking-[0.2em] uppercase font-medium">
        {/* Set 1: primary sequence */}
        <div className="flex shrink-0 items-center">
          {sequence.map((item, idx) => (
            <div key={`set1-${idx}`} className="flex items-center shrink-0">
              <span className="px-6 text-[#FAF7F2]/90 hover:text-[#E6B5CB] transition-colors whitespace-nowrap">
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6B5CB]/60 shrink-0" aria-hidden="true" />
            </div>
          ))}
        </div>

        {/* Set 2: seamless duplicate for infinite loop */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {sequence.map((item, idx) => (
            <div key={`set2-${idx}`} className="flex items-center shrink-0">
              <span className="px-6 text-[#FAF7F2]/90 hover:text-[#E6B5CB] transition-colors whitespace-nowrap">
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6B5CB]/60 shrink-0" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
