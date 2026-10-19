import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Eye, Sliders, CheckCircle } from 'lucide-react';

export const Method: React.FC = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      num: '01',
      title: 'Ascolto & Allineamento',
      desc: 'Prima di ogni scatto ci confrontiamo sul contesto, sulle preferenze e sul tono visivo desiderato. Capire la personalità del cliente è la base per un risultato coerente.',
      icon: MessageSquare,
    },
    {
      num: '02',
      title: 'Presenza Discreta sullo Scatto',
      desc: 'Durante l’evento o la sessione lavoro senza interferire con lo svolgimento naturale. Catturo sguardi autentici, dettagli preziosi e la vera energia della situazione.',
      icon: Eye,
    },
    {
      num: '03',
      title: 'Post-produzione Fedele',
      desc: 'Un color grading attento che rispetta la luce reale della scena e la cromia naturale. Nessun filtro esagerato o omologato: ogni fotografia conserva la propria atmosfera.',
      icon: Sliders,
    },
    {
      num: '04',
      title: 'Consegna & Supporto',
      desc: 'I file vengono consegnati in duplice formato: alta risoluzione per stampe o ingrandimenti, e file compressi e ottimizzati per la condivisione immediata sui canali social.',
      icon: CheckCircle,
    },
  ];

  useEffect(() => {
    const containerEl = containerRef.current;
    const headerEl = headerRef.current;
    const gridEl = gridRef.current;
    if (!containerEl || !headerEl || !gridEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = Array.from(gridEl.querySelectorAll<HTMLElement>('.method-card'));
    const connectorLine = containerEl.querySelector<HTMLElement>('.method-connector-line');

    if (prefersReduced || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsHeaderVisible(true);
      headerEl.classList.add('is-revealed');
      cards.forEach((card) => card.classList.add('is-revealed'));
      if (connectorLine) connectorLine.classList.add('is-revealed');
      return;
    }

    // Activate progressive enhancement styling
    containerEl.classList.add('method-scroll-active');

    // 1. Observer for Section Header (Label, Title, Description)
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsHeaderVisible(true);
            headerEl.classList.add('is-revealed');
            headerObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    headerObserver.observe(headerEl);

    // 2. Observer for Method Cards (01, 02, 03, 04)
    let batchIndex = 0;
    let batchTimer: NodeJS.Timeout | null = null;

    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // Local stagger for cards entering in the same viewport slice
            const localDelay = Math.min(batchIndex * 90, 270);
            batchIndex++;

            if (batchTimer) clearTimeout(batchTimer);
            batchTimer = setTimeout(() => {
              batchIndex = 0;
            }, 80);

            target.style.transitionDelay = `${localDelay}ms`;
            target.classList.add('is-revealed');
            obs.unobserve(target);

            if (connectorLine && !connectorLine.classList.contains('is-revealed')) {
              connectorLine.classList.add('is-revealed');
            }

            // Clear transitionDelay after entrance settles so hover responds with 0ms delay
            setTimeout(() => {
              target.style.transitionDelay = '';
            }, localDelay + 650);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    cards.forEach((card) => cardObserver.observe(card));

    return () => {
      headerObserver.disconnect();
      cardObserver.disconnect();
      if (batchTimer) clearTimeout(batchTimer);
    };
  }, []);

  return (
    <section
      id="metodo"
      className="py-20 md:py-32 bg-[#FAF7F2] border-b border-[#E8E2D8]/60 scroll-mt-12 overflow-hidden"
      aria-label="Metodo di lavoro"
    >
      <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div ref={headerRef} className="method-header max-w-2xl mb-16 space-y-3">
          <div className="overflow-hidden py-0.5">
            <span
              className={`inline-block text-xs uppercase tracking-widest text-[#9A496B] font-semibold method-header-item ${
                isHeaderVisible ? 'method-reveal-label' : ''
              }`}
            >
              Come Lavoro
            </span>
          </div>

          <div className="overflow-hidden py-1">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#181615] leading-[1.18] method-header-item ${
                isHeaderVisible ? 'method-reveal-title' : ''
              }`}
            >
              Un approccio concreto, attento e rispettoso
            </h2>
          </div>

          <div className="overflow-hidden py-0.5">
            <p
              className={`text-[#5A544F] text-base leading-relaxed method-header-item ${
                isHeaderVisible ? 'method-reveal-desc' : ''
              }`}
            >
              Dalla prima telefonata alla consegna dei file, ogni fase è pensata per farti sentire a tuo agio e garantire immagini all’altezza delle tue aspettative.
            </p>
          </div>
        </div>

        {/* 4 Steps Grid Container */}
        <div className="relative">
          {/* Subtle connecting progression line on desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[44px] left-[60px] right-[60px] h-[1px] bg-gradient-to-r from-transparent via-[#E8E2D8] to-transparent pointer-events-none method-connector-line z-0"
          />

          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  data-step-index={idx}
                  className="method-card relative p-6 sm:p-7 rounded-2xl bg-white border border-[#E8E2D8] shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="method-number font-mono text-2xl font-semibold text-[#9A496B]">
                        {step.num}
                      </span>
                      <div className="method-icon-box p-2.5 rounded-xl bg-[#FAF7F2] text-[#181615]">
                        <Icon className="method-icon w-5 h-5 text-[#181615]" />
                      </div>
                    </div>

                    <h3 className="method-card-title text-lg font-serif font-normal text-[#181615] mb-2">
                      {step.title}
                    </h3>
                    
                    <p className="method-card-desc text-xs sm:text-sm text-[#5A544F] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
