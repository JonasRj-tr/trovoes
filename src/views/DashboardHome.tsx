import React from 'react';
import { 
  Zap, 
  Users, 
  Activity, 
  Award, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Bell,
  Sparkles,
  TrendingUp,
  Flame
} from 'lucide-react';
import { Player, Training, Callup, Announcement, UserProfile } from '../types';
import { formatDateBR } from '../lib/utils';

interface DashboardHomeProps {
  user: UserProfile | null;
  players: Player[];
  trainings: Training[];
  callups: Callup[];
  announcements: Announcement[];
  onNavigate: (tab: any) => void;
  onOpenNewAthleteModal: () => void;
  onSelectPlayer: (player: Player) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  user,
  players,
  trainings,
  callups,
  announcements,
  onNavigate,
  onOpenNewAthleteModal,
  onSelectPlayer
}) => {
  const approvedPlayers = players.filter(p => p.status === 'Aprovado');
  const pendingPlayers = players.filter(p => p.status === 'Pendente');

  // Stats calculation
  const totalApproved = approvedPlayers.length;
  const sub14Count = approvedPlayers.filter(p => p.category === 'Sub 14').length;
  const sub15Count = approvedPlayers.filter(p => p.category === 'Sub 15').length;
  const sub17Count = approvedPlayers.filter(p => p.category === 'Sub 17').length;
  const sub20Count = approvedPlayers.filter(p => p.category === 'Sub 20').length;

  const nextTraining = trainings[0];
  const activeCallup = callups[0];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl trovoes-card-hero p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFCC00]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#FFCC00] text-[#0A2540] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 fill-[#0A2540]" /> TROVOES HQ
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-syne text-white tracking-tight">
              Olá, <span className="trovoes-text-gradient">{user?.name || 'Treinador / Atleta'}</span>! ⚡
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
              Painel de gestão do time de futebol de base. Sincronização em tempo real de treinos, convocações e fichas dos atletas.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNewAthleteModal}
              className="bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-[#FFCC00]/20 transition flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Inscrição</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {user?.role === 'jogador' ? (
          <>
            <div 
              className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
              onClick={() => {
                const myPlayer = players.find(p => p.fullName.toLowerCase() === user.name.toLowerCase());
                if (myPlayer) onSelectPlayer(myPlayer);
              }}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minha Ficha</span>
                <div className="p-2 rounded-xl bg-[#FFCC00]/10 text-[#FFCC00] group-hover:scale-110 transition">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black font-syne text-white truncate max-w-full">
                  {user.name}
                </span>
              </div>
              <p className="text-[10px] text-[#FFCC00] mt-2 font-medium">Ver detalhes da minha inscrição</p>
            </div>

            <div 
              className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
              onClick={() => onNavigate('trainings')}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minha Presença</span>
                <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400 group-hover:scale-110 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-syne text-emerald-400">92%</span>
                <span className="text-[10px] text-emerald-400 font-extrabold">Frequência</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Comparecimento aos treinos
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Total Atletas */}
            <div 
              onClick={() => onNavigate('roster')}
              className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Atletas</span>
                <div className="p-2 rounded-xl bg-[#FFCC00]/10 text-[#FFCC00] group-hover:scale-110 transition">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-syne text-white">{totalApproved}</span>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  Aprovados
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 truncate font-medium">
                Sub 14: {sub14Count} | Sub 15: {sub15Count} | Sub 17: {sub17Count} | Sub 20: {sub20Count}
              </p>
            </div>

            {/* Presença Média */}
            <div 
              onClick={() => onNavigate('trainings')}
              className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presença Média</span>
                <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400 group-hover:scale-110 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-syne text-emerald-400">92%</span>
                <span className="text-[10px] text-emerald-400 font-extrabold">↑ +4% mês</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Excelente presença nos treinos
              </p>
            </div>
          </>
        )}

        {/* Treinos Agendados */}
        <div 
          onClick={() => onNavigate('trainings')}
          className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Próximos Treinos</span>
            <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400 group-hover:scale-110 transition">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-white">{trainings.length}</span>
            <span className="text-[10px] text-slate-400 font-bold">sessões</span>
          </div>
          <p className="text-[10px] text-[#FFCC00] mt-2 font-bold truncate">
            Próximo: {nextTraining ? `${nextTraining.title} (${nextTraining.category})` : 'Nenhum'}
          </p>
        </div>

        {/* Convocatórias Ativas */}
        <div 
          onClick={() => onNavigate('callups')}
          className="trovoes-card p-4 rounded-2xl hover:border-[#FFCC00]/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Convocação Ativa</span>
            <div className="p-2 rounded-xl bg-[#FF6600]/10 text-[#FF6600] group-hover:scale-110 transition">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-[#FF6600]">{callups.length}</span>
            <span className="text-[10px] text-[#FF6600] font-extrabold bg-[#FF6600]/10 px-2 py-0.5 rounded border border-[#FF6600]/30 uppercase">
              {activeCallup ? activeCallup.type : 'Nenhuma'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate font-medium">
            {activeCallup ? `${activeCallup.title} - ${activeCallup.category}` : 'Ver convocações'}
          </p>
        </div>

      </div>

      {/* Pending Approvals Admin Notice Banner */}
      {user?.role === 'admin' && pendingPlayers.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFCC00]/10 border border-[#FFCC00]/40 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFCC00] text-[#0A2540] font-black shrink-0">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-extrabold text-[#FFCC00] uppercase tracking-wider">
                Você tem {pendingPlayers.length} cadastro(s) de atleta aguardando aprovação
              </p>
              <p className="text-slate-300 text-[11px] mt-0.5 font-medium">
                Revise as fichas de inscrição e assine a liberação para inclusão nas turmas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0 uppercase tracking-wider"
          >
            Aprovar Fichas
          </button>
        </div>
      )}

      {/* Content Grid: Left Column (Trainings & Convocations) + Right Column (Announcements & Roster Quick View) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Próximo Treino Card */}
          <div className="trovoes-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2A41] pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FFCC00]" />
                <h3 className="font-syne font-black text-base text-white uppercase tracking-wider">Próxima Sessão de Treino</h3>
              </div>
              <button
                onClick={() => onNavigate('trainings')}
                className="text-xs text-[#FFCC00] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                Agenda <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {nextTraining ? (
              <div className="p-5 rounded-2xl bg-[#08131F] border border-[#1B2A41] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="bg-[#FFCC00]/20 text-[#FFCC00] text-[10px] font-black px-3 py-1 rounded-full border border-[#FFCC00]/40 uppercase tracking-widest">
                      Turma {nextTraining.category}
                    </span>
                    <h4 className="text-lg font-black text-white mt-2">{nextTraining.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#FFCC00] block uppercase">{formatDateBR(nextTraining.date)}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 justify-end font-bold">
                      <Clock className="w-3 h-3 text-slate-500" /> {nextTraining.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                  <MapPin className="w-4 h-4 text-[#FFCC00] shrink-0" />
                  <span>{nextTraining.locationName}</span>
                </div>

                {nextTraining.notes && (
                  <p className="text-xs text-slate-400 bg-[#0A2540]/60 p-3 rounded-xl border border-[#1B2A41] font-medium">
                    💡 {nextTraining.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#1B2A41] text-xs">
                  <span className="text-slate-400 font-medium">Chamada de Presença liberada</span>
                  <button
                    onClick={() => onNavigate('trainings')}
                    className="bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black uppercase text-xs px-4 py-2 rounded-xl transition shadow-md shadow-[#FFCC00]/10"
                  >
                    Fazer Chamada
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                Nenhum treino agendado no momento.
              </div>
            )}
          </div>

          {/* Convocatória em Destaque */}
          <div className="trovoes-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2A41] pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF6600]" />
                <h3 className="font-syne font-black text-base text-white uppercase tracking-wider">Convocação da Semana</h3>
              </div>
              <button
                onClick={() => onNavigate('callups')}
                className="text-xs text-[#FFCC00] hover:underline flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                Gerenciar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeCallup ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#08131F] to-[#122336] border border-[#FF6600]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#FF6600]/20 text-[#FF6600] text-[10px] font-black px-3 py-1 rounded-full border border-[#FF6600]/40 uppercase tracking-widest">
                    {activeCallup.type} - {activeCallup.category}
                  </span>
                  <span className="text-xs text-slate-300 font-extrabold uppercase">
                    {formatDateBR(activeCallup.eventDate)} às {activeCallup.eventTime}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{activeCallup.title}</h4>
                  {activeCallup.opponent && (
                    <p className="text-xs text-[#FFCC00] font-extrabold uppercase mt-1">
                      Adversário: {activeCallup.opponent}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between bg-[#0A2540]/60 p-3 rounded-xl border border-[#1B2A41] text-xs">
                  <span className="text-slate-400 font-medium">Atletas Convocados:</span>
                  <span className="font-black text-[#FFCC00] uppercase">
                    {activeCallup.selectedPlayerIds?.length || 0} jogadores
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('callups')}
                  className="w-full py-2.5 bg-[#FF6600] hover:bg-[#ff7b1a] text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-[#FF6600]/20 transition"
                >
                  Ver Lista de Atletas Convocados
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                Nenhuma convocação ativa no momento.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col) - Feed e Elenco em Destaque */}
        <div className="space-y-6">
          
          {/* Feed de Comunicados */}
          <div className="trovoes-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2A41] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FFCC00]" />
                <h3 className="font-syne font-black text-xs text-white uppercase tracking-wider">Comunicação Oficial</h3>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-[#08131F] rounded-2xl border border-[#1B2A41] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-[#FFCC00] bg-[#FFCC00]/10 px-2 py-0.5 rounded border border-[#FFCC00]/20 uppercase">
                      {ann.category}
                    </span>
                    <span className="text-slate-500 font-bold">{ann.author}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs">{ann.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Destaque Atletas Recentes */}
          <div className="trovoes-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2A41] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF6600]" />
                <h3 className="font-syne font-black text-xs text-white uppercase tracking-wider">Atletas do Time</h3>
              </div>
              <button
                onClick={() => onNavigate('roster')}
                className="text-[11px] text-[#FFCC00] hover:underline font-bold uppercase tracking-wider"
              >
                Ver Todos
              </button>
            </div>

            <div className="space-y-2">
              {approvedPlayers.slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  onClick={() => onSelectPlayer(player)}
                  className="p-3 rounded-2xl bg-[#08131F] hover:bg-[#122336] border border-[#1B2A41] flex items-center justify-between gap-3 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={player.photoUrl}
                      alt={player.fullName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-[#FFCC00]/60"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs truncate max-w-[120px]">{player.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{player.position} • {player.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#FFCC00] bg-[#FFCC00]/10 px-2.5 py-1 rounded-xl border border-[#FFCC00]/30 uppercase">
                    {player.dominantFoot}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
