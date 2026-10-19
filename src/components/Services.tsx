import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { SERVICES_DATA } from '../data/services';

interface ServicesProps {
  onSelectService?: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleServiceClick = (title: string) => {
    if (onSelectService) {
      onSelectService(title);
    }
    const contactElem = document.getElementById('contatti');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Header Observer: Trigger synchronized section introduction
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsHeaderVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsHeaderVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  // 2. Individual Card Observer: Reveal each service card when entering viewport
  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = Array.from(gridEl.querySelectorAll<HTMLElement>('.service-card'));

    if (prefersReduced || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('is-revealed'));
      return;
    }

    // Activate progressive enhancement styling
    gridEl.classList.add('services-scroll-active');

    let batchIndex = 0;
    let batchTimer: NodeJS.Timeout | null = null;

    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // Local stagger for cards entering in the same scroll slice
            const localDelay = Math.min(batchIndex * 85, 200);
            batchIndex++;

            if (batchTimer) clearTimeout(batchTimer);
            batchTimer = setTimeout(() => {
              batchIndex = 0;
            }, 80);

            target.style.transitionDelay = `${localDelay}ms`;
            target.classList.add('is-revealed');
            obs.unobserve(target);

            // Clear transitionDelay after entrance so hover responds immediately
            setTimeout(() => {
              target.style.transitionDelay = '';
            }, localDelay + 700);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    cards.forEach((card) => {
      if (!card.classList.contains('is-revealed')) {
        cardObserver.observe(card);
      }
    });

    return () => {
      cardObserver.disconnect();
      if (batchTimer) clearTimeout(batchTimer);
    };
  }, []);

  return (
    <section
      id="servizi"
      className="py-20 md:py-32 bg-[#FAF7F2] border-b border-[#E8E2D8]/60 scroll-mt-12"
      aria-label="Servizi fotografici professionali"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with synchronized editorial entry */}
        <div ref={headerRef} className="max-w-3xl mb-16 space-y-4">
          {/* Phase 1: Label */}
          <div
            className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#9A496B] font-semibold ${
              isHeaderVisible ? 'services-reveal-item' : 'opacity-0'
            }`}
            style={{ animationDelay: '0ms', animationDuration: '400ms' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Servizi & Collaborazioni</span>
          </div>

          {/* Phase 2: Title with editorial mask container */}
          <div className="overflow-hidden py-1">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#181615] leading-[1.18] pb-1 ${
                isHeaderVisible ? 'services-title-reveal' : 'opacity-0'
              }`}
              style={{ animationDelay: '90ms', animationDuration: '550ms' }}
            >
              Soluzioni visive per eventi, persone e brand
            </h2>
          </div>

          {/* Phase 3: Description */}
          <p
            className={`text-[#5A544F] text-base sm:text-lg leading-relaxed ${
              isHeaderVisible ? 'services-reveal-item' : 'opacity-0'
            }`}
            style={{ animationDelay: '180ms', animationDuration: '400ms' }}
          >
            Ogni progetto fotografico nasce dall’ascolto e si plasma sull’identità del cliente.
            Nessun pacchetto standardizzato: un approccio su misura pensato per valorizzare l’autenticità di ogni situazione.
          </p>
        </div>

        {/* Services Editorial Grid: Each Card Animates When Entering Viewport */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SERVICES_DATA.map((service, index) => (
            <article
              key={service.id}
              data-service-index={index}
              data-service-id={service.id}
              className="service-card group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-2xs"
            >
              {/* Image Preview with Tag & Cinematic Top-to-Bottom Mask */}
              <div className="service-img-container relative aspect-[16/10] overflow-hidden bg-[#E8E2D8]/50">
                <div className="service-img-mask w-full h-full overflow-hidden">
                  <img
                    src={service.imageSrc}
                    alt={service.imageAlt}
                    width="600"
                    height="375"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="service-card-img w-full h-full object-cover"
                  />
                </div>
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Tag Badge */}
                <div className="service-badge absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#181615]/85 text-[#FAF7F2] backdrop-blur-xs border border-white/10">
                    {service.tag}
                  </span>
                </div>

                {/* Number */}
                <div className="service-number absolute bottom-3 right-3 text-white/90 font-mono text-sm tracking-wider font-semibold">
                  {service.number}
                </div>
              </div>

              {/* Service Body with Cascading Text Choreography */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="service-title text-xl sm:text-2xl font-serif font-normal text-[#181615] transition-colors">
                    {service.title}
                  </h3>
                  <p className="service-subtitle text-xs uppercase tracking-widest text-[#5A544F] font-semibold">
                    {service.subtitle}
                  </p>
                  <p className="service-description text-sm text-[#5A544F] leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="service-highlights space-y-2.5 pt-4 border-t border-[#E8E2D8]/60">
                  <p className="text-[11px] uppercase tracking-widest text-[#181615] font-semibold">
                    Cosa comprende:
                  </p>
                  <ul className="space-y-2">
                    {service.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#5A544F]">
                        <CheckCircle2 className="w-4 h-4 text-[#9A496B] shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Service CTA */}
                <div className="service-cta pt-2">
                  <button
                    type="button"
                    onClick={() => handleServiceClick(service.title)}
                    className="service-cta-btn w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#181615] text-[#181615] hover:text-[#FAF7F2] border border-[#E8E2D8] text-xs uppercase tracking-widest font-semibold transition-all duration-300 group/btn cursor-pointer"
                  >
                    <span>Richiedi per questo servizio</span>
                    <ArrowRight className="service-cta-arrow w-4 h-4 text-[#9A496B] transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
