import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';

interface HeaderProps {
  onOpenContactModal?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
    return () => document.body.classList.remove('lock-scroll');
  }, [mobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Servizi', href: '#servizi' },
    { label: 'Chi Sono', href: '#chi-sono' },
    { label: 'Metodo', href: '#metodo' },
    { label: 'Contatti', href: '#contatti' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        mobileMenuOpen
          ? 'bg-[#FAF7F2] py-4 border-b border-[#E8E2D8]'
          : isScrolled
          ? 'glass-header py-3 shadow-xs'
          : 'bg-[#FAF7F2]/90 backdrop-blur-xs py-4 md:py-6 border-b border-[#E8E2D8]/40'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo link */}
          <a
            href="#"
            className="flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D48EA8] rounded-md transition-opacity animate-motion-header"
            style={{ animationDelay: '40ms', animationDuration: '600ms' }}
            aria-label="Alison Ferazzini — Home"
          >
            <img
              src="/images/logo/logo-transparent.webp"
              alt="Alison Ferazzini Fotografa"
              width="180"
              height="60"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              loading="eager"
            />
          </a>

          {/* Desktop Navigation with staggered entrance */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigazione principale">
            {navLinks.map((link, idx) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wider uppercase text-[#5A544F] hover:text-[#181615] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#D48EA8] hover:after:w-full after:transition-all after:duration-300 animate-motion-header"
                style={{ animationDelay: `${140 + idx * 60}ms`, animationDuration: '450ms' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://www.instagram.com/alisonferazzini.ph/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profilo Instagram di Alison Ferazzini (apre nuova scheda)"
              className="p-2 text-[#5A544F] hover:text-[#181615] hover:bg-[#E8E2D8]/40 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 animate-motion-header"
              style={{ animationDelay: '440ms', animationDuration: '420ms' }}
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="#contatti"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#181615] text-[#FAF7F2] hover:bg-[#2C2927] transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 animate-motion-header"
              style={{ animationDelay: '500ms', animationDuration: '480ms' }}
            >
              <span>Parliamo del tuo progetto</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E6B5CB] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#181615] hover:bg-[#E8E2D8]/50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#D48EA8] animate-motion-header"
            style={{ animationDelay: '200ms', animationDuration: '450ms' }}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        id="mobile-navigation"
        style={{ backgroundColor: '#FAF7F2' }}
        className={`fixed top-[68px] left-0 right-0 bottom-0 w-full h-[calc(100vh-68px)] z-50 transition-all duration-300 md:hidden flex flex-col justify-between p-6 shadow-2xl overflow-y-auto ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto translate-y-0 visible'
            : 'opacity-0 pointer-events-none -translate-y-4 invisible'
        }`}
        hidden={!mobileMenuOpen}
      >
        <nav className="flex flex-col gap-6 pt-4" aria-label="Menu mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-serif tracking-wide text-[#181615] hover:text-[#D48EA8] transition-colors border-b border-[#E8E2D8]/50 pb-3 flex items-center justify-between"
            >
              <span>{link.label}</span>
              <ArrowUpRight className="w-5 h-5 text-[#8C847C]" />
            </a>
          ))}
        </nav>

        <div className="pt-8 border-t border-[#E8E2D8] flex flex-col gap-4">
          <p className="text-xs tracking-wider uppercase text-[#5A544F] font-medium">
            Lago di Garda · Bergamo · Brescia
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:alisonferazzini.photo@gmail.com"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#181615] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2927] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#E6B5CB]" />
              <span>Email</span>
            </a>
            <a
              href="https://www.instagram.com/alisonferazzini.ph/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram di Alison Ferazzini"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#181615] text-[#181615] text-xs font-semibold uppercase tracking-wider hover:bg-[#181615]/5 transition-colors"
            >
              <InstagramIcon className="w-4 h-4 text-[#D48EA8]" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
