import React from 'react';
import { 
  Home, 
  Activity, 
  Users, 
  Award, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

export type TabType = 'home' | 'trainings' | 'callups' | 'roster' | 'locations' | 'admin';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
  callupsBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  callupsBadgeCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Início', icon: Home },
    { id: 'trainings' as TabType, label: 'Treinos', icon: Activity },
    { id: 'callups' as TabType, label: 'Convocação', icon: Award, badge: callupsBadgeCount },
    { id: 'roster' as TabType, label: 'Atletas', icon: Users },
    { id: 'locations' as TabType, label: 'Locais', icon: MapPin },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin' as TabType, label: 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A2540]/95 backdrop-blur-xl border-t border-[#1B2A41] pb-safe sm:hidden shadow-2xl">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#FFCC00] font-black scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-bold'
              }`}
            >
              {/* Active Glow Pill Indicator */}
              {isActive && (
                <div className="absolute -top-2 w-8 h-1 bg-[#FFCC00] rounded-full shadow-[0_0_12px_#FFCC00]"></div>
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#FFCC00] fill-[#FFCC00]/20' : ''}`} />
                {Boolean(tab.badge) && tab.badge! > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FFCC00] text-[#0A2540] font-black text-[9px] px-1.5 py-0.2 rounded-full border border-black shadow">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 font-extrabold tracking-tight uppercase">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
