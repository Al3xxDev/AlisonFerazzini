import React from 'react';
import { ArrowDown, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-[#E8E2D8]/60"
      aria-label="Presentazione e introduzione"
    >
      {/* Subtle background ambient glow */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#E6B5CB]/15 via-[#FDF5F8]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Editorial Text Column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Tag badge with subtle blush camera accent */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8E2D8] shadow-2xs animate-motion-fade-up"
              style={{ animationDelay: '160ms', animationDuration: '500ms' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#9A496B] animate-pulse" />
              <span className="text-xs uppercase font-semibold tracking-widest text-[#5A544F]">
                Fotografa & Content Creator
              </span>
            </div>

            {/* Headline with Masked Line-by-Line Editorial Reveal */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-serif font-normal leading-[1.08] tracking-tight text-[#181615]">
              <span className="block overflow-hidden pt-1 pb-2">
                <span
                  className="animate-motion-title"
                  style={{ animationDelay: '260ms', animationDuration: '750ms' }}
                >
                  Racconto momenti.
                </span>
              </span>
              <span className="block overflow-hidden pt-1 pb-3 -mt-1 sm:-mt-2">
                <span
                  className="animate-motion-title italic font-light text-[#181615]/90 pr-2"
                  style={{ animationDelay: '400ms', animationDuration: '750ms' }}
                >
                  Custodisco emozioni.
                </span>
              </span>
            </h1>

            {/* Subtitle / Bio essence */}
            <p
              className="text-base sm:text-lg text-[#5A544F] font-normal leading-relaxed max-w-xl animate-motion-fade-up"
              style={{ animationDelay: '560ms', animationDuration: '500ms' }}
            >
              Uno sguardo contemporaneo, attento ai dettagli e all’identità di ogni persona.
              Dalla carica travolgente dei DJ set all’eleganza autentica dei matrimoni, fino alla cura materica della food photography tra il <strong className="font-medium text-[#181615]">Lago di Garda</strong>, <strong className="font-medium text-[#181615]">Bergamo</strong> e <strong className="font-medium text-[#181615]">Brescia</strong>.
            </p>

            {/* Call to actions with coordinated entry & refined microinteractions */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#181615] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-[#2C2927] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group animate-motion-fade-up"
                style={{ animationDelay: '680ms', animationDuration: '450ms' }}
              >
                <span>Esplora il Portfolio</span>
                <ArrowDown className="w-4 h-4 text-[#E6B5CB] transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <a
                href="#contatti"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#181615]/20 bg-white/60 text-[#181615] text-xs uppercase tracking-widest font-semibold hover:bg-white hover:border-[#181615] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group animate-motion-fade-up"
                style={{ animationDelay: '760ms', animationDuration: '450ms' }}
              >
                <span>Parliamo del tuo evento</span>
                <ArrowRight className="w-4 h-4 text-[#8C847C] transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Territorials & Credentials */}
            <div className="pt-6 border-t border-[#E8E2D8] w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                className="space-y-1 animate-motion-fade-up"
                style={{ animationDelay: '860ms', animationDuration: '420ms' }}
              >
                <div className="flex items-center gap-1.5 text-xs text-[#5A544F] uppercase tracking-wider font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#9A496B]" />
                  <span>Territorio</span>
                </div>
                <p className="text-sm font-medium text-[#181615]">Lago di Garda · BG · BS</p>
              </div>

              <div
                className="space-y-1 animate-motion-fade-up"
                style={{ animationDelay: '940ms', animationDuration: '420ms' }}
              >
                <div className="flex items-center gap-1.5 text-xs text-[#5A544F] uppercase tracking-wider font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#9A496B]" />
                  <span>Formazione</span>
                </div>
                <p className="text-sm font-medium text-[#181615]">Accademia Foto Milano</p>
              </div>

              <div
                className="col-span-2 sm:col-span-1 space-y-1 animate-motion-fade-up"
                style={{ animationDelay: '1020ms', animationDuration: '420ms' }}
              >
                <div className="flex items-center gap-1.5 text-xs text-[#5A544F] uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9A496B]" />
                  <span>Specializzazioni</span>
                </div>
                <p className="text-sm font-medium text-[#181615]">Eventi · Food · Wedding</p>
              </div>
            </div>

          </div>

          {/* Asymmetrical Editorial Visual (5 cols on lg) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Image: Lake Garda Sunset */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-[#E8E2D8]/40 aspect-[4/5] animate-motion-fade-up"
                style={{ animationDelay: '300ms', animationDuration: '850ms' }}
              >
                <div className="w-full h-full animate-motion-photo-zoom" style={{ animationDelay: '300ms' }}>
                  <img
                    src="/images/photos/weareiconico-scenico-tramonto-persone-960.webp"
                    srcSet="/images/photos/weareiconico-scenico-tramonto-persone-520.webp 520w, /images/photos/weareiconico-scenico-tramonto-persone-960.webp 960w, /images/photos/weareiconico-scenico-tramonto-persone-1440.webp 1440w"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 420px"
                    alt="Momento spontaneo al tramonto sul Lago di Garda durante l'evento Iconico"
                    width="1170"
                    height="1462"
                    fetchPriority="high"
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                
                {/* Subtle gradient overlay at bottom for legible badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                
                {/* Location chip */}
                <div
                  className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between text-xs backdrop-blur-xs bg-black/30 px-3.5 py-2 rounded-xl border border-white/15 animate-motion-fade-up"
                  style={{ animationDelay: '850ms', animationDuration: '450ms' }}
                >
                  <span className="font-serif italic text-sm tracking-wide">We Are Iconico</span>
                  <span className="uppercase tracking-wider text-[11px] opacity-90">Lago di Garda</span>
                </div>
              </div>

              {/* Floating Asymmetric Detail Card: DJ Set Nightlife */}
              <div
                className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-44 sm:w-52 rounded-xl overflow-hidden shadow-2xl border-2 border-white bg-[#181615] text-[#FAF7F2] p-2.5 backdrop-blur-md hidden sm:block animate-motion-card-diagonal hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300 cursor-default group"
                style={{ animationDelay: '780ms', animationDuration: '650ms' }}
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                  <img
                    src="/images/photos/takeover-night-scenico-folla-520.webp"
                    alt="Takeover Night DJ set atmosfera notturna"
                    width="520"
                    height="520"
                    loading="eager"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[10px] uppercase font-bold tracking-wider text-[#E6B5CB]">
                    DJ Set · Night
                  </span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-medium text-white/90">Energia della notte</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B5CB] transition-transform duration-300 group-hover:scale-125" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
