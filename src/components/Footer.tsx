import React from 'react';
import { Mail, ArrowUp, MapPin } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#121110] text-[#FAF7F2] border-t border-white/10 pt-16 pb-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          
          {/* Brand & Logo Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-block">
              <img
                src="/images/logo/logo-white.webp"
                alt="Alison Ferazzini Fotografa"
                width="200"
                height="67"
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
            
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Fotografia d'autore e content creation per eventi musicali, matrimoni, food & beverage e comunicazione social. Spontaneità, cura del dettaglio e identità visiva.
            </p>

            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#E6B5CB] font-mono">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lago di Garda · Bergamo · Brescia</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/alisonferazzini.ph/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram di Alison Ferazzini"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:alisonferazzini.photo@gmail.com"
                aria-label="Email ad Alison Ferazzini"
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white/90 font-semibold">
              Navigazione
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase">
              <li>
                <a href="#portfolio" className="text-white/60 hover:text-[#E6B5CB] transition-colors">
                  Portfolio Fotografico
                </a>
              </li>
              <li>
                <a href="#servizi" className="text-white/60 hover:text-[#E6B5CB] transition-colors">
                  Servizi Offerti
                </a>
              </li>
              <li>
                <a href="#chi-sono" className="text-white/60 hover:text-[#E6B5CB] transition-colors">
                  Chi Sono & Bio
                </a>
              </li>
              <li>
                <a href="#metodo" className="text-white/60 hover:text-[#E6B5CB] transition-colors">
                  Metodo di Lavoro
                </a>
              </li>
              <li>
                <a href="#contatti" className="text-white/60 hover:text-[#E6B5CB] transition-colors">
                  Contatti & Preventivi
                </a>
              </li>
            </ul>
          </div>

          {/* Specializzazioni (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-white/90 font-semibold">
              Ambiti Fotografici
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>DJ Set — Day & Night e Clubbing</li>
              <li>Eventi Privati, Compleanni & Feste</li>
              <li>Food & Drink Photography per Ristoranti</li>
              <li>Matrimoni, Cerimonie & Banchetti</li>
              <li>Video Recap per Reels e TikTok</li>
              <li>Gestione Pagine Social per Locali F&B</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {currentYear} Alison Ferazzini · Tutti i diritti riservati. Fotografia & Content Creation.
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px]">Accademia di Fotografia, Milano</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Torna all'inizio della pagina"
            >
              <span>Torna su</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
