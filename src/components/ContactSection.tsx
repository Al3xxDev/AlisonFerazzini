import React, { useState } from 'react';
import { Mail, Copy, Check, Send, Sparkles, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './icons/InstagramIcon';

interface ContactSectionProps {
  selectedServicePreload?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ selectedServicePreload }) => {
  const [selectedService, setSelectedService] = useState(
    selectedServicePreload || 'DJ Set — Day & Night'
  );
  const [territory, setTerritory] = useState('Lago di Garda');
  const [clientName, setClientName] = useState('');
  const [details, setDetails] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const emailAddress = 'alisonferazzini.photo@gmail.com';
  const instagramUrl = 'https://www.instagram.com/alisonferazzini.ph/';

  const servicesList = [
    'DJ Set — Day & Night',
    'Eventi Privati & Aziendali',
    'Food & Drink Photography',
    'Cerimonie & Matrimoni',
    'Video Recap per Social Media',
    'Gestione Pagine Social per Locali',
  ];

  const territoriesList = ['Lago di Garda', 'Brescia', 'Bergamo', 'Altra zona'];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const getComposedSubject = () => {
    return encodeURIComponent(`Richiesta informazioni fotografiche — ${selectedService}`);
  };

  const getComposedBody = () => {
    const text = `Ciao Alison,
ti contatto tramite il tuo portfolio per avere informazioni sul servizio di fotografia.

Dettagli della richiesta:
- Servizio: ${selectedService}
- Territorio: ${territory}
${clientName ? `- Nome/Referente: ${clientName}` : ''}
${details ? `- Note e data indicativa: ${details}` : ''}

Resto in attesa di un tuo riscontro per parlare del progetto.
Grazie!`;
    return encodeURIComponent(text);
  };

  const getPlainTextForClipboard = () => {
    return `Ciao Alison! Ti scrivo dal tuo sito per il servizio di ${selectedService} in zona ${territory}.${
      clientName ? ` Sono ${clientName}.` : ''
    }${details ? ` Note: ${details}` : ''} Mi piacerebbe verificare la tua disponibilità. Grazie!`;
  };

  const handleCopyInstagramText = () => {
    navigator.clipboard.writeText(getPlainTextForClipboard());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <section
      id="contatti"
      className="py-20 md:py-32 bg-[#181615] text-[#FAF7F2] relative overflow-hidden scroll-mt-12"
      aria-label="Contatti e canali di comunicazione"
    >
      {/* Delicate background ambient light */}
      <div
        className="absolute top-10 right-10 w-96 h-96 bg-[#D48EA8]/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 reveal-on-scroll">
        
        {/* Section Heading */}
        <div className="max-w-2xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6B5CB] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inizia una collaborazione</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white">
            Parliamo del tuo progetto
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Hai in programma un evento, un matrimonio, un nuovo menù per il tuo ristorante o desideri creare contenuti per il tuo locale? Scrivimi direttamente: rispondo personalmente a ogni richiesta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Direct Channels Cards (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Email Direct Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#22201E] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#2D2A28] text-[#E6B5CB]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                      Email Diretta
                    </h3>
                    <p className="text-xs text-white/50">Risposta rapida</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Copia indirizzo email negli appunti"
                  aria-label="Copia indirizzo email negli appunti"
                >
                  {copiedEmail ? (
                    <span className="text-[#E6B5CB] flex items-center gap-1 text-[11px] font-mono">
                      <Check className="w-3.5 h-3.5" /> Copiato
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Copy className="w-3.5 h-3.5" /> Copia
                    </span>
                  )}
                </button>
              </div>

              <div className="font-mono text-sm sm:text-base text-white/90 break-all select-all">
                {emailAddress}
              </div>

              <a
                id="direct-email-link"
                href={`mailto:${emailAddress}?subject=Richiesta%20informazioni%20fotografiche%20%E2%80%94%20Alison%20Ferazzini`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#FAF7F2] text-[#181615] text-xs uppercase tracking-widest font-semibold hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <span>Scrivi un'email ad Alison</span>
                <ArrowUpRight className="w-4 h-4 text-[#D48EA8]" />
              </a>
            </div>

            {/* Instagram Direct Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#22201E] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#2D2A28] text-[#E6B5CB]">
                  <InstagramIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Instagram Direct
                  </h3>
                  <p className="text-xs text-white/50">@alisonferazzini.ph</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Segui i backstage, le anteprime degli eventi e inviami un messaggio privato in DM per verificare disponibilità e condividere riferimenti visivi.
              </p>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300"
              >
                <span>Scrivimi su Instagram</span>
                <ArrowUpRight className="w-4 h-4 text-[#E6B5CB]" />
              </a>
            </div>

            {/* Operating Area Reminder */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/70 space-y-2">
              <div className="flex items-center gap-2 text-white font-medium">
                <MapPin className="w-4 h-4 text-[#E6B5CB]" />
                <span>Base operativa & Spostamenti</span>
              </div>
              <p className="text-white/60 leading-relaxed">
                Disponibile per servizi fotografici ed eventi in tutto il territorio del Lago di Garda (sponda bresciana e veronese), Bergamo, Brescia e trasferte concordate.
              </p>
            </div>

          </div>

          {/* Interactive Request Builder (7 cols on lg) */}
          <div className="lg:col-span-7 bg-[#22201E] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6B5CB] font-semibold mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Assistente rapido</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-white">
                Componi la tua richiesta guidata
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Seleziona il tipo di progetto e genera un messaggio già pronto per la tua email o per Instagram DM.
              </p>
            </div>

            {/* Step 1: Select Service */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/80 font-semibold block">
                1. Di cosa hai bisogno?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {servicesList.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`p-3 rounded-xl text-left text-xs tracking-wide transition-all border cursor-pointer ${
                      selectedService === service
                        ? 'bg-[#FAF7F2] text-[#181615] font-semibold border-white shadow-xs'
                        : 'bg-[#181615]/60 text-white/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Territory */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/80 font-semibold block">
                2. In quale area si svolgerà?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {territoriesList.map((terr) => (
                  <button
                    key={terr}
                    type="button"
                    onClick={() => setTerritory(terr)}
                    className={`py-2 px-3 rounded-xl text-center text-xs tracking-wide transition-all border cursor-pointer ${
                      territory === terr
                        ? 'bg-[#E6B5CB] text-[#181615] font-bold border-[#E6B5CB]'
                        : 'bg-[#181615]/60 text-white/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {terr}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Name / Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="client-name"
                  className="text-xs uppercase tracking-wider text-white/80 font-semibold block"
                >
                  Il tuo nome o locale (facoltativo)
                </label>
                <input
                  id="client-name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Es. Marco / Locale Lago"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181615] border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-[#E6B5CB] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="client-details"
                  className="text-xs uppercase tracking-wider text-white/80 font-semibold block"
                >
                  Data o periodo indicativo
                </label>
                <input
                  id="client-details"
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Es. Prossimo mese, sabato sera..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181615] border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-[#E6B5CB] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Dynamic Actions */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  id="dynamic-email-link"
                  href={`mailto:${emailAddress}?subject=${getComposedSubject()}&body=${getComposedBody()}`}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#FAF7F2] text-[#181615] text-xs uppercase tracking-widest font-semibold hover:bg-white hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4 text-[#D48EA8]" />
                  <span>Invia Richiesta via Email</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyInstagramText}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-4 h-4 text-[#E6B5CB]" />
                      <span>Testo Copiato!</span>
                    </>
                  ) : (
                    <>
                      <InstagramIcon className="w-4 h-4 text-[#E6B5CB]" />
                      <span>Copia per Instagram DM</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-white/70 text-center">
                Il pulsante aprirà direttamente il tuo programma email con i dettagli già inseriti. Nessun dato viene trattenuto o inviato a server terzi.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
