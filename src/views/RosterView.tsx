import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  UserPlus, 
  Zap, 
  Check, 
  X, 
  Eye, 
  FileText, 
  Ruler, 
  Scale, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Player, Category, RegistrationStatus } from '../types';
import { calculateAge, formatDateBR } from '../lib/utils';
import { db, doc, updateDoc, deleteDoc } from '../lib/firebase';

interface RosterViewProps {
  players: Player[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenNewAthleteModal: () => void;
  onSelectPlayer: (player: Player) => void;
  isAdmin: boolean;
  onEditPlayer?: (player: Player) => void;
}

export const RosterView: React.FC<RosterViewProps> = ({
  players,
  selectedCategory,
  onSelectCategory,
  onOpenNewAthleteModal,
  onSelectPlayer,
  isAdmin,
  onEditPlayer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | RegistrationStatus>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente o atleta ${playerName}?`)) {
      try {
        await deleteDoc(doc(db, 'players', playerId));
        alert('Atleta excluído com sucesso.');
      } catch (error) {
        console.error("Error deleting player: ", error);
        alert('Erro ao excluir atleta.');
      }
    }
  };

  const categories: string[] = ['Todas', 'Sub 14', 'Sub 15', 'Sub 17', 'Sub 20'];

  // Filter players
  const filteredPlayers = players.filter((player) => {
    const matchesCategory = selectedCategory === 'Todas' || player.category === selectedCategory;
    const matchesStatus = statusFilter === 'Todos' || player.status === statusFilter;
    const matchesSearch = 
      player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.rgCpf.includes(searchTerm);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (playerId: string, newStatus: RegistrationStatus) => {
    try {
      await updateDoc(doc(db, 'players', playerId), { status: newStatus });
    } catch (err) {
      console.error('Error updating player status:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-syne text-white flex items-center gap-2 uppercase tracking-tight">
            Controle de Turmas & Atletas
            <span className="bg-[#FFCC00]/20 text-[#FFCC00] text-xs font-black px-3 py-1 rounded-full border border-[#FFCC00]/40">
              {filteredPlayers.length} Inscritos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Gestão das categorias Sub 14, Sub 15, Sub 17 e Sub 20 do time TROVOES.
          </p>
        </div>

        <button
          onClick={onOpenNewAthleteModal}
          className="bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-lg shadow-[#FFCC00]/20 transition flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Atleta</span>
        </button>
      </div>

      {/* Category Pills + Filters */}
      <div className="trovoes-card p-4 rounded-3xl space-y-4">
        
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = cat === 'Todas' ? players.length : players.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#FFCC00] text-[#0A2540] shadow-lg shadow-[#FFCC00]/20'
                    : 'bg-[#08131F] text-slate-300 hover:bg-[#122336] hover:text-white border border-[#1B2A41]'
                }`}
              >
                <span>{cat === 'Todas' ? 'Todas as Turmas' : `Categoria ${cat}`}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#0A2540]/20 text-[#0A2540]' : 'bg-[#0A2540] text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Layout Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1B2A41]">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, posição ou RG..."
              className="w-full bg-[#08131F] border border-[#1B2A41] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFCC00]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#08131F] border border-[#1B2A41] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#FFCC00] font-bold uppercase tracking-wider"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Aprovado">Aprovados</option>
              <option value="Pendente">Pendentes</option>
              <option value="Recusado">Recusados</option>
            </select>

            {/* Grid vs Table View Toggle */}
            <div className="flex items-center bg-[#08131F] p-1 rounded-xl border border-[#1B2A41] shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-[#FFCC00] text-[#0A2540]' : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-[#FFCC00] text-[#0A2540]' : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização em Tabela"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Players List Display */}
      {filteredPlayers.length === 0 ? (
        <div className="trovoes-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Nenhum atleta encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente mudar o filtro de busca ou cadastre novos atletas na categoria selecionada.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const age = calculateAge(player.birthDate);

            return (
              <div
                key={player.id}
                className="trovoes-card p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Status Badge Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {player.category}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      player.status === 'Aprovado'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : player.status === 'Pendente'
                        ? 'bg-amber-950/80 text-amber-400 border-amber-500/40 animate-pulse'
                        : 'bg-red-950/80 text-red-400 border-red-500/40'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>

                {/* Player Photo & Basic Info */}
                <div className="text-center space-y-2 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={player.photoUrl}
                      alt={player.fullName}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-0 right-0 bg-black text-amber-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-400">
                      {player.position.slice(0, 3)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm truncate">{player.fullName}</h3>
                    <p className="text-xs text-amber-400 font-semibold">{player.position}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-xl text-[10px] text-slate-300 font-medium">
                    <div>
                      <span className="text-slate-500 block">Idade</span>
                      <span className="font-bold text-white">{age} anos</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pé</span>
                      <span className="font-bold text-white">{player.dominantFoot}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Altura</span>
                      <span className="font-bold text-white">{player.height} cm</span>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Action Controls or View Profile */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onSelectPlayer(player)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ver Ficha Completa</span>
                  </button>

                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onEditPlayer && onEditPlayer(player)}
                        className="py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id, player.fullName)}
                        className="py-1.5 bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 text-red-400 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        Excluir
                      </button>
                    </div>
                  )}

                  {isAdmin && player.status === 'Pendente' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(player.id, 'Aprovado')}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Aprovar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(player.id, 'Recusado')}
                        className="py-1.5 bg-red-900 hover:bg-red-800 text-red-200 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Recusar
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* TABLE VIEW */
        <div className="trovoes-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Posição</th>
                  <th className="py-3 px-4">Idade</th>
                  <th className="py-3 px-4">Pé Dominante</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPlayers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-amber-400/40" />
                        <div>
                          <span className="font-bold text-white block">{p.fullName}</span>
                          <span className="text-[10px] text-slate-500">{p.rgCpf}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">{p.position}</td>
                    <td className="py-3 px-4">{calculateAge(p.birthDate)} anos</td>
                    <td className="py-3 px-4">{p.dominantFoot}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {p.guardians[0]?.name || 'Não informado'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'Aprovado'
                            ? 'bg-emerald-950 text-emerald-400'
                            : p.status === 'Pendente'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPlayer(p)}
                          className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold px-2.5 py-1 rounded-lg transition"
                          title="Ficha"
                        >
                          Ficha
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEditPlayer && onEditPlayer(p)}
                              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded-lg transition"
                              title="Editar"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(p.id, p.fullName)}
                              className="bg-red-950/40 hover:bg-red-900/40 text-red-400 font-bold px-2.5 py-1 rounded-lg transition"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
