import React, { useRef, useEffect, useState } from 'react';
import { Camera, Heart, Sparkles, Award } from 'lucide-react';

export const About: React.FC = () => {
  const [isMainVisible, setIsMainVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const mainEl = mainRef.current;
    const valuesEl = valuesRef.current;
    if (!containerEl || !mainEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsMainVisible(true);
      mainEl.classList.add('is-revealed');
      if (valuesEl) {
        valuesEl.querySelectorAll('.about-value-card').forEach((card) => {
          card.classList.add('is-revealed');
        });
      }
      return;
    }

    // Activate progressive enhancement styling
    containerEl.classList.add('about-scroll-active');

    // 1. Observer for Main Diptych (Photo + Narrative)
    const mainObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsMainVisible(true);
            mainEl.classList.add('is-revealed');
            mainObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    mainObserver.observe(mainEl);

    // 2. Observer for Values Cards (Spontaneità, Su Misura, Precisione)
    let valuesObserver: IntersectionObserver | null = null;
    if (valuesEl) {
      valuesObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cards = Array.from(entry.target.querySelectorAll<HTMLElement>('.about-value-card'));
              cards.forEach((card, idx) => {
                const delay = idx * 85;
                card.style.transitionDelay = `${delay}ms`;
                card.classList.add('is-revealed');

                // Clear transitionDelay after entrance settles so hover responds with 0ms delay
                setTimeout(() => {
                  card.style.transitionDelay = '';
                }, delay + 600);
              });
              valuesObserver?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -6% 0px',
        }
      );

      valuesObserver.observe(valuesEl);
    }

    return () => {
      mainObserver.disconnect();
      if (valuesObserver) valuesObserver.disconnect();
    };
  }, []);

  return (
    <section
      id="chi-sono"
      className="py-20 md:py-32 bg-[#FAF7F2] border-b border-[#E8E2D8]/60 scroll-mt-12 overflow-hidden"
      aria-label="Presentazione di Alison Ferazzini"
    >
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={mainRef} className="about-main-grid grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Diptych (5 cols on lg): Cinematic Photo Reveal */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Image with Vertical Mask Reveal */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-white bg-white aspect-[4/5]">
                <div className="about-photo-mask w-full h-full overflow-hidden">
                  <img
                    src="/images/photos/wedding2-sposa-bambino-960.webp"
                    srcSet="/images/photos/wedding2-sposa-bambino-520.webp 520w, /images/photos/wedding2-sposa-bambino-960.webp 960w"
                    sizes="(max-width: 1024px) 80vw, 400px"
                    alt="Momento intimo e spontaneo catturato da Alison Ferazzini"
                    width="1170"
                    height="1170"
                    loading="lazy"
                    decoding="async"
                    className="about-photo-img w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Photo Caption */}
                <div className="about-photo-caption absolute bottom-4 left-4 right-4 text-white text-xs pointer-events-none">
                  <span className="font-serif italic text-sm text-white/90">L'attenzione ai dettagli</span>
                  <p className="text-[11px] opacity-80 mt-0.5">Spontaneità e delicatezza in ogni scatto</p>
                </div>
              </div>

              {/* Floating Original Signature Stamp Card */}
              <div className="about-academy-stamp absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#E8E2D8] max-w-[200px] sm:max-w-[220px]">
                <img
                  src="/images/logo/logo-transparent.webp"
                  alt="Firma originale Alison Ferazzini"
                  width="160"
                  height="50"
                  className="h-10 w-auto object-contain mx-auto mb-1.5"
                />
                <p className="text-[10px] text-center uppercase tracking-widest text-[#5A544F] font-semibold">
                  Accademia di Fotografia · Milano
                </p>
              </div>

            </div>
          </div>

          {/* Narrative Column (7 cols on lg): Synchronized Typography Sequence */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag */}
            <div
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#9A496B] font-semibold ${
                isMainVisible ? 'about-reveal-item' : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms', animationDuration: '400ms' }}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Dietro l'obiettivo</span>
            </div>

            {/* Name & Secondary Title with Container Mask */}
            <div className="space-y-1">
              <div className="overflow-hidden py-1">
                <h2
                  className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#181615] leading-[1.15] ${
                    isMainVisible ? 'about-title-reveal' : 'opacity-0'
                  }`}
                  style={{ animationDelay: '100ms', animationDuration: '480ms' }}
                >
                  Alison Ferazzini
                </h2>
              </div>
              <div className="overflow-hidden py-1">
                <p
                  className={`text-xl sm:text-2xl md:text-3xl font-serif italic text-[#5A544F] leading-[1.3] pb-1 ${
                    isMainVisible ? 'about-title-reveal' : 'opacity-0'
                  }`}
                  style={{ animationDelay: '200ms', animationDuration: '550ms' }}
                >
                  Dalla passione all'arte del racconto visivo
                </p>
              </div>
            </div>

            {/* Biographical Paragraphs */}
            <div className="space-y-4 text-base text-[#5A544F] leading-relaxed">
              <p
                className={isMainVisible ? 'about-para-reveal' : 'opacity-0'}
                style={{ animationDelay: '280ms', animationDuration: '400ms' }}
              >
                Sono una giovane fotografa e dopo aver frequentato un’accademia di fotografia a Milano, ho scelto di trasformare la mia più grande passione nel mio lavoro quotidiano.
              </p>
              <p
                className={isMainVisible ? 'about-para-reveal' : 'opacity-0'}
                style={{ animationDelay: '340ms', animationDuration: '400ms' }}
              >
                Amo catturare l’energia travolgente degli eventi e trasformare momenti autentici in ricordi preziosi da conservare. Che si tratti delle vibes di una serata, della luce dorata al tramonto sul lago, o della gioia sincera di una tavola imbandita, il mio obiettivo è cogliere la verità di ciò che accade senza forzature.
              </p>
              <p
                className={isMainVisible ? 'about-para-reveal' : 'opacity-0'}
                style={{ animationDelay: '400ms', animationDuration: '400ms' }}
              >
                Presto una cura scrupolosa a ogni dettaglio e costruisco il mio approccio fotografico in funzione dello stile, delle esigenze e dell’identità del cliente. Credo profondamente che non esista una formula universale: ogni persona, matrimonio o locale ha una voce propria che merita di essere ascoltata e raccontata per immagini.
              </p>
              <p
                className={isMainVisible ? 'about-para-reveal' : 'opacity-0'}
                style={{ animationDelay: '460ms', animationDuration: '400ms' }}
              >
                Oggi mi sto specializzando con dedizione nella food photography e nelle diverse sfaccettature del wedding e degli eventi privati, operando stabilmente tra la splendida cornice del Lago di Garda e le province di Bergamo e Brescia.
              </p>
            </div>

            {/* Values badges with Staggered Entrance and Microinteractions */}
            <div
              ref={valuesRef}
              className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#E8E2D8]"
            >
              <div
                data-value-index="0"
                className="about-value-card p-4 rounded-xl bg-white border border-[#E8E2D8] cursor-default"
                tabIndex={0}
              >
                <Sparkles className="about-value-icon w-5 h-5 text-[#9A496B] mb-2" />
                <h3 className="text-sm font-semibold text-[#181615]">Spontaneità</h3>
                <p className="text-xs text-[#5A544F] mt-1">
                  Nessuna posa finta: spazio alle emozioni naturali.
                </p>
              </div>

              <div
                data-value-index="1"
                className="about-value-card p-4 rounded-xl bg-white border border-[#E8E2D8] cursor-default"
                tabIndex={0}
              >
                <Heart className="about-value-icon w-5 h-5 text-[#9A496B] mb-2" />
                <h3 className="text-sm font-semibold text-[#181615]">Su Misura</h3>
                <p className="text-xs text-[#5A544F] mt-1">
                  Ascolto attento e stile plasmato sul cliente.
                </p>
              </div>

              <div
                data-value-index="2"
                className="about-value-card p-4 rounded-xl bg-white border border-[#E8E2D8] cursor-default"
                tabIndex={0}
              >
                <Award className="about-value-icon w-5 h-5 text-[#9A496B] mb-2" />
                <h3 className="text-sm font-semibold text-[#181615]">Precisione</h3>
                <p className="text-xs text-[#5A544F] mt-1">
                  Cura del dettaglio e colorimetria naturale.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
