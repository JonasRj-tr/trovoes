import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  X, 
  AlertCircle, 
  Zap, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { Callup, Player, EventType, ConfirmationStatus, Category, UserProfile } from '../types';
import { formatDateBR } from '../lib/utils';
import { db, collection, setDoc, doc, updateDoc, deleteDoc } from '../lib/firebase';

interface CallupsViewProps {
  callups: Callup[];
  players: Player[];
  user: UserProfile | null;
  isAdmin: boolean;
}

export const CallupsView: React.FC<CallupsViewProps> = ({
  callups,
  players,
  user,
  isAdmin
}) => {
  const [selectedCallup, setSelectedCallup] = useState<Callup | null>(callups[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Callup Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Jogo Oficial');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [locationName, setLocationName] = useState('CT TROVOES Arena');
  const [category, setCategory] = useState<Category>('Sub 17');
  const [opponent, setOpponent] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Category players available for selection
  const categoryPlayers = players.filter(p => p.status === 'Aprovado' && p.category === category);
  const myPlayer = players.find(p => p.fullName.toLowerCase() === user?.name.toLowerCase());

  const handleTogglePlayerSelect = (id: string) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, id]);
    }
  };

  const handleSelectAllCategoryPlayers = () => {
    if (selectedPlayerIds.length === categoryPlayers.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(categoryPlayers.map(p => p.id));
    }
  };

  const handleCreateCallup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate || selectedPlayerIds.length === 0) {
      alert('Selecione pelo menos um atleta convocando para o evento.');
      return;
    }
    setLoading(true);

    try {
      const initialConfirmations: Record<string, ConfirmationStatus> = {};
      selectedPlayerIds.forEach(id => {
        initialConfirmations[id] = 'Pendente';
      });

      const newRef = doc(collection(db, 'callups'));
      const newCallup: Callup = {
        id: newRef.id,
        title: title.trim(),
        type,
        eventDate,
        eventTime,
        locationName,
        category,
        opponent: opponent.trim(),
        selectedPlayerIds,
        playerConfirmations: initialConfirmations,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await setDoc(newRef, newCallup);
      setSelectedCallup(newCallup);
      setShowCreateModal(false);
      setTitle('');
      setOpponent('');
      setNotes('');
    } catch (err) {
      console.error('Error creating callup:', err);
    } finally {
      setLoading(false);
    }
  };

  // Player / Responsável confirm callup status
  const handleConfirmCallupStatus = async (playerId: string, status: ConfirmationStatus) => {
    if (!selectedCallup) return;

    try {
      const updatedConfirmations = {
        ...selectedCallup.playerConfirmations,
        [playerId]: status
      };

      await updateDoc(doc(db, 'callups', selectedCallup.id), {
        playerConfirmations: updatedConfirmations
      });

      setSelectedCallup({
        ...selectedCallup,
        playerConfirmations: updatedConfirmations
      });
    } catch (err) {
      console.error('Error updating confirmation:', err);
    }
  };

  const handleDeleteCallup = async (id: string) => {
    if (window.confirm('Excluir esta convocatória?')) {
      try {
        await deleteDoc(doc(db, 'callups', id));
        if (selectedCallup?.id === id) {
          setSelectedCallup(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Summary counts
  const confirmedCount = selectedCallup
    ? Object.values(selectedCallup.playerConfirmations || {}).filter(s => s === 'Confirmado').length
    : 0;
  const pendingCount = selectedCallup
    ? Object.values(selectedCallup.playerConfirmations || {}).filter(s => s === 'Pendente').length
    : 0;
  const absentCount = selectedCallup
    ? Object.values(selectedCallup.playerConfirmations || {}).filter(s => s === 'Ausente').length
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-syne text-white flex items-center gap-2">
            Lista de Convocação
            <span className="bg-orange-400/20 text-orange-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-orange-400/40">
              {callups.length} Ativas
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Convocações para jogos oficiais, amistosos e treinos especiais com confirmação em tempo real.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg trovoes-glow-yellow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Convocação</span>
          </button>
        )}
      </div>

      {/* Callups Tabs List */}
      <div className="trovoes-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Selecione a Convocatória:
        </span>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {callups.map((c) => {
            const isSelected = selectedCallup?.id === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCallup(c)}
                className={`p-3 rounded-2xl text-left min-w-[220px] shrink-0 transition border ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-600/10 border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                    {c.type} • {c.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{formatDateBR(c.eventDate)}</span>
                </div>
                <p className="font-bold text-white text-xs truncate">{c.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {c.eventTime} • {c.locationName}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Callup Active Sheet */}
      {selectedCallup ? (
        <div className="space-y-4">
          
          {/* Active Callup Banner */}
          <div className="trovoes-card-gold p-5 rounded-3xl border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="bg-orange-500/20 text-orange-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/30">
                  {selectedCallup.type} — Categoria {selectedCallup.category}
                </span>
                <h2 className="text-xl font-bold font-syne text-white mt-1">{selectedCallup.title}</h2>
                {selectedCallup.opponent && (
                  <p className="text-xs text-amber-400 font-semibold">Adversário: {selectedCallup.opponent}</p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="text-right">
                  <span className="font-bold text-white block">{formatDateBR(selectedCallup.eventDate)} às {selectedCallup.eventTime}</span>
                  <span className="text-slate-400 text-[11px]">{selectedCallup.locationName}</span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteCallup(selectedCallup.id)}
                    className="p-2 rounded-xl bg-red-950/80 text-red-300 hover:bg-red-900 transition"
                    title="Excluir Convocatória"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40">
                <span className="text-emerald-400 font-bold block">Confirmados</span>
                <span className="text-lg font-bold font-syne text-emerald-300">{confirmedCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40">
                <span className="text-amber-400 font-bold block">Pendentes</span>
                <span className="text-lg font-bold font-syne text-amber-300">{pendingCount}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40">
                <span className="text-red-400 font-bold block">Ausentes</span>
                <span className="text-lg font-bold font-syne text-red-300">{absentCount}</span>
              </div>
            </div>

            {selectedCallup.notes && (
              <p className="text-xs text-slate-300 bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                💡 <b>Observação:</b> {selectedCallup.notes}
              </p>
            )}
          </div>

          {/* List of Convocated Athletes & Realtime Confirmation Controls */}
          <div className="trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-syne font-bold text-base text-white border-b border-slate-800 pb-2">
              Atletas Convocados ({selectedCallup.selectedPlayerIds.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCallup.selectedPlayerIds.map((pid) => {
                const player = players.find(p => p.id === pid);
                if (!player) return null;

                const status = selectedCallup.playerConfirmations?.[pid] || 'Pendente';

                return (
                  <div
                    key={pid}
                    className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.photoUrl}
                        alt={player.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs">{player.fullName}</h4>
                        <p className="text-[10px] text-slate-400">{player.position} • {player.category}</p>
                      </div>
                    </div>

                    {/* Status Button or Confirm Controls */}
                    <div className="flex items-center gap-1.5">
                      {((isAdmin || user?.role === 'tecnico') || (user?.role === 'jogador' && myPlayer?.id === pid)) ? (
                        <>
                          <button
                            onClick={() => handleConfirmCallupStatus(pid, 'Confirmado')}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              status === 'Confirmado'
                                ? 'bg-emerald-500 text-black shadow'
                                : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>Confirmado</span>
                          </button>

                          <button
                            onClick={() => handleConfirmCallupStatus(pid, 'Ausente')}
                            className={`px-2 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              status === 'Ausente'
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Ausente</span>
                          </button>
                        </>
                      ) : (
                        <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                           {status === 'Confirmado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                           {status === 'Ausente' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                           {status === 'Pendente' && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
                           <span className={`text-[10px] font-bold ${
                             status === 'Confirmado' ? 'text-emerald-500' :
                             status === 'Ausente' ? 'text-red-500' : 'text-slate-500'
                           }`}>{status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          Nenhuma convocação cadastrada ou selecionada.
        </div>
      )}

      {/* Create Callup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0A111E] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-syne text-white">Criar Nova Convocação</h3>

            <form onSubmit={handleCreateCallup} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Amistoso vs Santos FC Base"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="Jogo Oficial">Jogo Oficial</option>
                    <option value="Amistoso">Amistoso</option>
                    <option value="Treino Especial">Treino Especial</option>
                    <option value="Torneio">Torneio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Categoria Target</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as any);
                      setSelectedPlayerIds([]);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="Sub 14">Sub 14</option>
                    <option value="Sub 15">Sub 15</option>
                    <option value="Sub 17">Sub 17</option>
                    <option value="Sub 20">Sub 20</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Horário</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Adversário (se houver)</label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Nome do time adversário..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Select Athletes with Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">Selecione os Atletas da Categoria {category}:</label>
                  <button
                    type="button"
                    onClick={handleSelectAllCategoryPlayers}
                    className="text-amber-400 hover:underline font-bold text-[10px]"
                  >
                    {selectedPlayerIds.length === categoryPlayers.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {categoryPlayers.map((p) => {
                    const isChecked = selectedPlayerIds.includes(p.id);

                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-amber-500/20 text-white font-bold' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlayerSelect(p.id)}
                            className="accent-amber-400"
                          />
                          <span>{p.fullName} ({p.position})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{p.dominantFoot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Observações (Apresentação, fardamento...)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Local de encontro, levar documento oficial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-extrabold shadow trovoes-glow-yellow"
                >
                  {loading ? 'Publicando...' : 'Publicar Convocação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
