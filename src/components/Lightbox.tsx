import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Photo } from '../types';

interface LightboxProps {
  photo: Photo | null;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photo,
  currentIndex,
  totalCount,
  onClose,
  onPrev,
  onNext,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Keyboard navigation & Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (!photo) return;

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('lock-scroll');

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('lock-scroll');
    };
  }, [photo, handleKeyDown]);

  if (!photo) return null;

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      onNext();
    } else if (diff < -50) {
      onPrev();
    }
    setTouchStart(null);
  };

  // Close when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizzazione ingrandita: ${photo.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header / Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between text-white/90 z-10 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest font-mono text-[#E6B5CB]">
            {String(currentIndex + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline-block text-white/40">|</span>
          <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-white/70">
            {photo.categoryLabel}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <a
            href={`#contatti`}
            onClick={onClose}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs uppercase tracking-wider text-white transition-colors"
          >
            <span>Richiedi servizio simile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E6B5CB]" />
          </a>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#E6B5CB]"
            aria-label="Chiudi visualizzazione ingrandita (Escape)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Prev Navigation Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-xs z-10 focus-visible:ring-2 focus-visible:ring-[#E6B5CB]"
        aria-label="Fotografia precedente (Freccia sinistra)"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Next Navigation Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-xs z-10 focus-visible:ring-2 focus-visible:ring-[#E6B5CB]"
        aria-label="Fotografia successiva (Freccia destra)"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Main Image Container */}
      <div className="relative max-w-5xl max-h-[82vh] w-full mx-4 flex flex-col items-center justify-center">
        <div
          key={photo.id}
          className="relative max-h-[72vh] flex items-center justify-center rounded-lg overflow-hidden shadow-2xl animate-lightbox-image"
          style={{
            backgroundImage: `url(${photo.lqip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img
            src={photo.srcLarge}
            srcSet={photo.srcset}
            sizes="(max-width: 1024px) 95vw, 1200px"
            alt={photo.title}
            width={photo.width}
            height={photo.height}
            className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg select-none transition-opacity duration-300"
          />
        </div>

        {/* Caption & Metadata */}
        <div className="mt-4 text-center text-white max-w-xl px-4">
          <div className="inline-block mb-1">
            <span className="text-[11px] uppercase tracking-widest text-[#E6B5CB] font-semibold">
              {photo.context}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-normal text-white">
            {photo.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-1 line-clamp-2">
            {photo.description}
          </p>
        </div>
      </div>
    </div>
  );
};
