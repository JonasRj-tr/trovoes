import React from 'react';
import { 
  Home, 
  Activity, 
  Users, 
  Award, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  UserPlus, 
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { TabType } from './BottomNav';
import { UserProfile, Category } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: UserProfile | null;
  onOpenNewAthleteModal: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onOpenNewAthleteModal,
  selectedCategory,
  onSelectCategory
}) => {
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'home' as TabType, label: 'Dashboard Início', icon: Home },
    { id: 'trainings' as TabType, label: 'Treinos e Presença', icon: Activity },
    { id: 'callups' as TabType, label: 'Lista de Convocação', icon: Award },
    { id: 'roster' as TabType, label: 'Atletas / Turmas', icon: Users },
    { id: 'locations' as TabType, label: 'Locais de Treino', icon: MapPin },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin' as TabType, label: 'Painel do Administrador', icon: ShieldCheck });
  }

  const categories: Category[] = ['Sub 14', 'Sub 15', 'Sub 17', 'Sub 20'];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-[#0D1B2A] border-r border-[#1B2A41] p-4 shrink-0 min-h-[calc(100vh-65px)]">
      
      {/* Quick Action Button */}
      <div className="mb-6">
        <button
          onClick={onOpenNewAthleteModal}
          className="w-full flex items-center justify-center gap-2 bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black uppercase text-xs tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-[#FFCC00]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Atleta</span>
        </button>
      </div>

      {/* Main Nav Links */}
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 px-3 mb-2">
          Navegação Principal
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all ${
                isActive
                  ? 'bg-[#122336] text-[#FFCC00] border border-[#FFCC00]/40 shadow-md'
                  : 'text-slate-300 hover:bg-[#122336]/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFCC00]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Shortcuts */}
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 px-3 mb-2 flex items-center justify-between">
          <span>Categorias</span>
          <Zap className="w-3 h-3 text-[#FFCC00]" />
        </p>
        
        <button
          onClick={() => {
            onSelectCategory('Todas');
            onTabChange('roster');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
            selectedCategory === 'Todas'
              ? 'bg-[#122336] text-white font-black border border-[#1B2A41]'
              : 'text-slate-400 hover:bg-[#122336]/40 hover:text-slate-200'
          }`}
        >
          <span>Todas as Categorias</span>
          <span className="text-[10px] bg-[#0A2540] px-1.5 py-0.5 rounded text-slate-400 font-bold">BASE</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              onSelectCategory(cat);
              onTabChange('roster');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-[#FFCC00]/15 text-[#FFCC00] font-black border border-[#FFCC00]/30'
                : 'text-slate-400 hover:bg-[#122336]/40 hover:text-slate-200'
            }`}
          >
            <span>Turma {cat}</span>
            <span className="text-[10px] text-[#FFCC00] font-bold">⚡</span>
          </button>
        ))}
      </div>

      {/* Club Info Footer */}
      <div className="mt-auto pt-4 border-t border-[#1B2A41]">
        <div className="p-3 rounded-2xl bg-[#08131F] border border-[#1B2A41] text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-200 font-black uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
            TROVOES HQ
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Sincronização em tempo real com Firestore.
          </p>
        </div>
      </div>

    </aside>
  );
};
