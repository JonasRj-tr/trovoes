import React, { useState, useEffect } from 'react';
import { Download, X, Zap, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallModalProps {
  deferredPrompt: any;
  onInstallNative: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  deferredPrompt,
  onInstallNative
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);

    // If not already installed as standalone app, open install modal automatically
    if (!standaloneMode) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      onInstallNative();
      setIsOpen(false);
    } else {
      // Fallback for devices/browsers where beforeinstallprompt was already consumed or on Safari
      onInstallNative();
      setIsOpen(false);
    }
  };

  if (isStandalone || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0D1B2A] border-t sm:border border-[#1B2A41] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white relative space-y-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#08131F] border border-[#1B2A41]"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Header Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative inline-block mx-auto">
            <div className="absolute -inset-2 bg-[#FFCC00] rounded-3xl blur opacity-60 animate-pulse"></div>
            <img 
              src="https://i.imgur.com/BQI5VnK.jpeg" 
              alt="TROVOES APP" 
              className="relative w-20 h-20 rounded-3xl object-cover border-2 border-[#FFCC00] shadow-2xl mx-auto"
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-syne font-black text-2xl tracking-tight text-white uppercase">
                TROVOES BASE
              </h2>
              <span className="bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#FFCC00]/40 uppercase">
                APP
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold mt-1">
              Aplicativo Oficial de Gestão de Futebol
            </p>
          </div>
        </div>

        {/* Single Big Action Button */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleInstallClick}
            className="w-full py-4 bg-[#FFCC00] hover:bg-[#ffe066] active:scale-95 text-[#0A2540] font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-[#FFCC00]/25 transition flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6 stroke-[2.5] animate-bounce" />
            <span>INSTALAR APLICATIVO AGORA</span>
          </button>
          
          <p className="text-[11px] text-slate-400 text-center font-medium">
            Clique no botão acima para adicionar o app à sua tela inicial.
          </p>
        </div>

        {/* Benefits Quick Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-semibold">
          <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#08131F] border border-[#1B2A41]">
            <Zap className="w-3.5 h-3.5 text-[#FFCC00]" />
            <span>Instalação Rápida</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#08131F] border border-[#1B2A41]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Direto no Celular</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="w-full text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider text-center transition"
        >
          Continuar no Navegador
        </button>
      </div>
    </div>
  );
};

