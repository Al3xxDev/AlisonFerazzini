import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueePillars } from './components/MarqueePillars';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { About } from './components/About';
import { Method } from './components/Method';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('DJ Set — Day & Night');

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
  };

  useEffect(() => {
    // If IntersectionObserver is not supported or window is unavailable, immediately reveal
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#181615] antialiased selection:bg-[#E6B5CB]/30 selection:text-black">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[#181615] text-white rounded-md text-xs uppercase tracking-wider font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#D48EA8]"
      >
        Salta al contenuto principale
      </a>

      {/* Main Header */}
      <Header />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1">
        <Hero />
        <MarqueePillars />
        <Portfolio />
        <Services onSelectService={handleSelectService} />
        <About />
        <Method />
        <ContactSection selectedServicePreload={selectedService} />
      </main>

      {/* Footer Landmark */}
      <Footer />
    </div>
  );
};

export default App;
