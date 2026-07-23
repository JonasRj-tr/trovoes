import React, { useState } from 'react';
import { 
  Zap, 
  Download, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  announcementsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenProfile,
  deferredPrompt,
  onInstallPwa,
  announcementsCount = 0
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0A2540] border-b border-[#1B2A41] px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-[#FFCC00] rounded-full blur opacity-40 group-hover:opacity-75 transition"></div>
            <img 
              src="https://i.imgur.com/BQI5VnK.jpeg" 
              alt="TROVOES Logo" 
              className="relative w-10 h-10 rounded-full object-cover border-2 border-[#FFCC00] shadow-lg shadow-[#FFCC00]/20"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-syne font-black text-xl tracking-tighter uppercase text-white flex items-center gap-1">
                TROVOES
              </span>
              <span className="bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black px-2 py-0.5 rounded-md border border-[#FFCC00]/40 flex items-center gap-1 uppercase tracking-wider">
                <Zap className="w-2.5 h-2.5 text-[#FFCC00] fill-[#FFCC00]" />
                BASE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-bold uppercase tracking-widest opacity-80">
              Management System
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] text-xs font-black uppercase px-3.5 py-2 rounded-xl shadow-lg shadow-[#FFCC00]/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Instalar App</span>
            </button>
          )}

          {/* User Role Badge */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 bg-[#0D1B2A] px-3 py-1.5 rounded-xl border border-[#1B2A41] text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFCC00]" />
              <span className="capitalize font-bold text-slate-200">{user.role}</span>
            </div>
          )}

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-[#0D1B2A] hover:bg-[#122336] text-slate-300 hover:text-white transition relative border border-[#1B2A41]"
              title="Notificações"
            >
              <Bell className="w-4 h-4 text-[#FFCC00]" />
              {announcementsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFCC00] rounded-full animate-ping"></span>
              )}
              {announcementsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFCC00] rounded-full border border-[#0A2540]"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0D1B2A] border border-[#1B2A41] rounded-2xl shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1B2A41]">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" />
                    Avisos do Clube
                  </span>
                  <span className="text-[10px] text-[#FFCC00] font-bold bg-[#FFCC00]/10 px-2 py-0.5 rounded border border-[#FFCC00]/20">
                    TROVOES HQ
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-[#08131F] border-l-4 border-[#FFCC00]">
                    <p className="font-bold text-[#FFCC00]">⚡ Abertura de Treinos Sub 15 e Sub 17</p>
                    <p className="text-slate-300 text-[11px] mt-1">
                      Lembrem-se de confirmar a presença com 24h de antecedência pelo aplicativo.
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1">Hoje às 08:30</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#08131F] border-l-4 border-[#FF6600]">
                    <p className="font-bold text-slate-200">📋 Documentos Pendentes</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Atletas com autorização pendente devem anexar a assinatura legal do responsável.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-[#0D1B2A] hover:bg-[#122336] border border-[#1B2A41] transition"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FFCC00] text-[#0A2540] flex items-center justify-center font-black text-xs shadow-[0_0_10px_rgba(255,204,0,0.3)]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0D1B2A] border border-[#1B2A41] rounded-2xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#1B2A41]">
                    <p className="font-bold text-slate-100 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#122336] flex items-center gap-2 font-bold"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#FFCC00]" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/30 flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-[#FFCC00] bg-[#FFCC00]/10 px-3 py-1.5 rounded-xl border border-[#FFCC00]/30">
              Visitante
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
