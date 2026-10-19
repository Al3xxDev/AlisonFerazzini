import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { Photo, PhotoCategory } from '../types';
import photosData from '../data/photos.json';
import { Lightbox } from './Lightbox';

export const Portfolio: React.FC = () => {
  const photos: Photo[] = photosData as Photo[];

  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('all');
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>(photos);
  const [displayedCount, setDisplayedCount] = useState<number>(photos.length);
  const [filterState, setFilterState] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingCategoryRef = useRef<PhotoCategory>(selectedCategory);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Observer for the Section Header (Title, description, filters)
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsHeaderVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeaderVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -5% 0px',
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 2. Individual Photo Card Observer: Reveals each photo when it enters viewport
  useEffect(() => {
    if (filterState === 'exiting') return;

    const gridEl = gridRef.current;
    if (!gridEl) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cards = Array.from(gridEl.querySelectorAll<HTMLElement>('.portfolio-card'));

    // If reduced motion is preferred or IntersectionObserver unsupported: reveal immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window) || prefersReduced) {
      cards.forEach((card) => card.classList.add('is-revealed'));
      return;
    }

    // Activate progressive enhancement styling for cards
    gridEl.classList.add('portfolio-scroll-active');

    // Local stagger tracker for cards entering in the same scroll slice
    let batchIndex = 0;
    let batchTimer: NodeJS.Timeout | null = null;

    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;

            // Apply a subtle local stagger (0ms, 45ms, 90ms) for simultaneous items
            const localDelay = Math.min(batchIndex * 45, 135);
            batchIndex++;

            if (batchTimer) clearTimeout(batchTimer);
            batchTimer = setTimeout(() => {
              batchIndex = 0;
            }, 80);

            target.style.transitionDelay = `${localDelay}ms`;
            target.classList.add('is-revealed');
            obs.unobserve(target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
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
  }, [displayedPhotos, filterState]);

  const categories: { id: PhotoCategory; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'Tutti i Lavori', count: photos.length },
      {
        id: 'dj-events',
        label: 'DJ Set & Nightlife',
        count: photos.filter((p) => p.category === 'dj-events').length,
      },
      {
        id: 'lifestyle',
        label: 'Eventi & Lago',
        count: photos.filter((p) => p.category === 'lifestyle').length,
      },
      {
        id: 'food-drink',
        label: 'Food & Drink',
        count: photos.filter((p) => p.category === 'food-drink').length,
      },
      {
        id: 'weddings',
        label: 'Matrimoni & Cerimonie',
        count: photos.filter((p) => p.category === 'weddings').length,
      },
      {
        id: 'private-events',
        label: 'Privati & Brand',
        count: photos.filter((p) => p.category === 'private-events').length,
      },
    ];
  }, [photos]);

  // Handle category change with graceful coordinated transition
  const handleSelectCategory = (catId: PhotoCategory) => {
    if (catId === selectedCategory && filterState === 'idle') return;

    // 1. Immediately update active pill state for instant visual feedback
    setSelectedCategory(catId);
    pendingCategoryRef.current = catId;

    // Clear any pending timeout from previous rapid click
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Check for reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const next = catId === 'all' ? photos : photos.filter((p) => p.category === catId);
      setDisplayedPhotos(next);
      setDisplayedCount(next.length);
      setFilterState('idle');
      return;
    }

    // 2. Stage A: Exit animation on current grid
    setFilterState('exiting');

    transitionTimeoutRef.current = setTimeout(() => {
      // 3. Stage B: Swap photos to latest pending target & update counter
      const target = pendingCategoryRef.current;
      const next = target === 'all' ? photos : photos.filter((p) => p.category === target);

      setDisplayedPhotos(next);
      setDisplayedCount(next.length);
      setFilterState('entering');

      // 4. Stage C: Settle into idle state after entrance transition completes
      transitionTimeoutRef.current = setTimeout(() => {
        setFilterState('idle');
        transitionTimeoutRef.current = null;
      }, 380);
    }, 160);
  };

  const handleOpenLightbox = (index: number) => {
    setActivePhotoIndex(index);
  };

  const handleCloseLightbox = () => {
    setActivePhotoIndex(null);
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev! > 0 ? prev! - 1 : displayedPhotos.length - 1
    );
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) =>
      prev! < displayedPhotos.length - 1 ? prev! + 1 : 0
    );
  };

  return (
    <section
      id="portfolio"
      className="py-20 md:py-32 bg-[#FAF7F2] border-b border-[#E8E2D8]/60 scroll-mt-12"
      aria-label="Galleria portfolio fotografico"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Coordinated Editorial Sequence */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl space-y-3">
            {/* Phase A: Label */}
            <div
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#9A496B] font-semibold ${
                isHeaderVisible ? 'portfolio-reveal-item' : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms', animationDuration: '400ms' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selezione d'autore</span>
            </div>

            {/* Phase B: Title */}
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-[#181615] ${
                isHeaderVisible ? 'portfolio-reveal-item' : 'opacity-0'
              }`}
              style={{ animationDelay: '90ms', animationDuration: '600ms' }}
            >
              Portfolio Fotografico
            </h2>

            {/* Phase C: Description */}
            <p
              className={`text-[#5A544F] text-base leading-relaxed ${
                isHeaderVisible ? 'portfolio-reveal-item' : 'opacity-0'
              }`}
              style={{ animationDelay: '180ms', animationDuration: '400ms' }}
            >
              Una selezione curata di fotografie reali scattate tra il Lago di Garda, Bergamo e Brescia.
              Ritratti spontanei, dettagli gastronomici, vibrazioni notturne e cerimonie intime.
            </p>
          </div>

          {/* Phase C: Counter */}
          <div
            className={`text-xs uppercase tracking-widest text-[#5A544F] font-mono font-medium ${
              isHeaderVisible ? 'portfolio-reveal-item' : 'opacity-0'
            }`}
            style={{ animationDelay: '220ms', animationDuration: '400ms' }}
            aria-live="polite"
          >
            Mostrando{' '}
            <span className="font-semibold text-[#181615] transition-opacity duration-200">
              {displayedCount}
            </span>{' '}
            di {photos.length} fotografie
          </div>
        </div>

        {/* Phase D: Filter Pills with Staggered Entrance */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar"
          role="tablist"
          aria-label="Filtra fotografie per categoria"
        >
          {categories.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isHeaderVisible ? 'portfolio-reveal-item' : 'opacity-0'
                } ${
                  isActive
                    ? 'bg-[#181615] text-[#FAF7F2] shadow-sm'
                    : 'bg-white/90 text-[#403B37] hover:bg-white hover:text-[#181615] border border-[#E8E2D8]'
                }`}
                style={{
                  animationDelay: `${260 + idx * 45}ms`,
                  animationDuration: '400ms',
                }}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors duration-300 ${
                    isActive
                      ? 'bg-white/20 text-[#E6B5CB]'
                      : 'bg-[#E8E2D8] text-[#403B37]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive Editorial Grid: Every Photo Animates When It Enters Viewport */}
        <div
          ref={gridRef}
          className={`columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 ${
            filterState === 'exiting'
              ? 'portfolio-grid-exiting'
              : filterState === 'entering'
              ? 'portfolio-grid-entering'
              : ''
          }`}
        >
          {displayedPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${selectedCategory}`}
              data-photo-index={index}
              data-photo-id={photo.id}
              className="portfolio-card break-inside-avoid group relative rounded-xl overflow-hidden bg-[#E8E2D8]/40 border border-[#E8E2D8]/60 shadow-xs hover:shadow-xl hover:border-[#D48EA8]/40 cursor-pointer"
              onClick={() => handleOpenLightbox(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenLightbox(index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Ingrandisci fotografia: ${photo.title} (${photo.context})`}
            >
              {/* Image with LQIP background */}
              <div
                className="w-full relative overflow-hidden"
                style={{
                  aspectRatio: `${photo.aspectRatio}`,
                  backgroundImage: `url(${photo.lqip})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <img
                  src={photo.srcMedium}
                  srcSet={photo.srcset}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  alt={`${photo.title} — ${photo.context}`}
                  width={photo.width}
                  height={photo.height}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="portfolio-img-zoom w-full h-full object-cover"
                />

                {/* Subtle gradient vignette */}
                <div className="portfolio-vignette absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* Overlay details */}
                <div className="portfolio-overlay-info absolute inset-0 p-5 flex flex-col justify-between text-white pointer-events-none">
                  {/* Top category badge & eye button */}
                  <div className="portfolio-overlay-top flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[#FAF7F2] border border-white/20">
                      {photo.categoryLabel}
                    </span>
                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-xs text-white">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Bottom title & context */}
                  <div className="portfolio-overlay-bottom">
                    <p className="text-xs uppercase tracking-wider text-[#E6B5CB] font-mono font-medium">
                      {photo.context}
                    </p>
                    <h3 className="text-base sm:text-lg font-serif font-normal text-white mt-0.5">
                      {photo.title}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && (
        <Lightbox
          photo={displayedPhotos[activePhotoIndex]}
          currentIndex={activePhotoIndex}
          totalCount={displayedPhotos.length}
          onClose={handleCloseLightbox}
          onPrev={handlePrevPhoto}
          onNext={handleNextPhoto}
        />
      )}
    </section>
  );
};
