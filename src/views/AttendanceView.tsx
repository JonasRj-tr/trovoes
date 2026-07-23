import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Check, 
  X, 
  FileSpreadsheet, 
  FileText, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Zap,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Training, Player, AttendanceRecord, Category, AttendanceStatus } from '../types';
import { formatDateBR, exportToCSV, printReport } from '../lib/utils';
import { db, collection, addDoc, setDoc, doc, onSnapshot } from '../lib/firebase';

interface AttendanceViewProps {
  trainings: Training[];
  players: Player[];
  locations: any[];
  isAdmin: boolean;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  trainings,
  players,
  locations,
  isAdmin
}) => {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(trainings[0] || null);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [showNewTrainingModal, setShowNewTrainingModal] = useState(false);

  // New Training Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [category, setCategory] = useState<Category | 'Todas'>('Sub 17');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync Attendance Records in Realtime for Selected Training
  useEffect(() => {
    if (!selectedTraining) return;

    const unsub = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const recordsMap: Record<string, AttendanceRecord> = {};
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceRecord;
        if (data.trainingId === selectedTraining.id) {
          recordsMap[data.playerId] = data;
        }
      });
      setAttendanceRecords(recordsMap);
    });

    return () => unsub();
  }, [selectedTraining]);

  // Filter players for this training category
  const categoryPlayers = players.filter(p => 
    p.status === 'Aprovado' && (selectedTraining?.category === 'Todas' || p.category === selectedTraining?.category)
  );

  // Mark 1-tap attendance
  const handleMarkAttendance = async (player: Player, status: AttendanceStatus) => {
    if (!selectedTraining) return;

    const recordId = `${selectedTraining.id}_${player.id}`;
    const newRecord: AttendanceRecord = {
      id: recordId,
      trainingId: selectedTraining.id,
      playerId: player.id,
      playerName: player.fullName,
      category: player.category,
      status,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'attendance', recordId), newRecord);
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setLoading(true);

    try {
      const loc = locations.find(l => l.id === locationId) || locations[0];
      const newRef = doc(collection(db, 'trainings'));
      const newTraining: Training = {
        id: newRef.id,
        title: title.trim(),
        date,
        time,
        locationId: loc?.id || 'loc1',
        locationName: loc?.name || 'CT TROVOES Arena',
        category,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await setDoc(newRef, newTraining);
      setSelectedTraining(newTraining);
      setShowNewTrainingModal(false);
      setTitle('');
      setNotes('');
    } catch (err) {
      console.error('Error creating training:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export CSV / Excel
  const handleExportCSV = () => {
    if (!selectedTraining) return;
    const rows = categoryPlayers.map((p) => {
      const rec = attendanceRecords[p.id];
      return {
        'Nome do Atleta': p.fullName,
        'Categoria': p.category,
        'Posição': p.position,
        'Status Chamada': rec ? rec.status : 'Pendente',
        'Treino': selectedTraining.title,
        'Data Treino': formatDateBR(selectedTraining.date),
        'Hora': selectedTraining.time,
        'Local': selectedTraining.locationName
      };
    });
    exportToCSV(`Chamada_TROVOES_${selectedTraining.category}_${selectedTraining.date}`, rows);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    if (!selectedTraining) return;

    let rowsHtml = '';
    categoryPlayers.forEach((p, idx) => {
      const rec = attendanceRecords[p.id];
      const statusStr = rec ? rec.status : 'Não Marcado';
      const color = statusStr === 'Presente' ? 'green' : statusStr === 'Ausente' ? 'red' : 'orange';

      rowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${p.fullName}</b></td>
          <td>${p.category}</td>
          <td>${p.position}</td>
          <td style="color:${color}; font-weight:bold;">${statusStr}</td>
        </tr>
      `;
    });

    const bodyHtml = `
      <h3>Relatório de Frequência de Treino</h3>
      <p><b>Treino:</b> ${selectedTraining.title} | <b>Categoria:</b> ${selectedTraining.category}</p>
      <p><b>Data:</b> ${formatDateBR(selectedTraining.date)} às ${selectedTraining.time} | <b>Local:</b> ${selectedTraining.locationName}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Atleta</th>
            <th>Categoria</th>
            <th>Posição</th>
            <th>Status Frequência</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    printReport(`Relatorio_Treino_${selectedTraining.date}`, bodyHtml);
  };

  // Attendance Statistics
  const recordsList = Object.values(attendanceRecords) as AttendanceRecord[];
  const presentCount = recordsList.filter(r => r.status === 'Presente').length;
  const absentCount = recordsList.filter(r => r.status === 'Ausente').length;
  const totalCount = categoryPlayers.length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-syne text-white flex items-center gap-2">
            Controle de Presença nos Treinos
            <span className="bg-emerald-400/20 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
              {attendancePercentage}% Frequência
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro instantâneo de presença por categoria com exportação de relatórios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowNewTrainingModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg trovoes-glow-yellow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Treino</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="Exportar Planilha Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Excel / CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            title="Imprimir ou Salvar PDF"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Select Active Training Session Carousel */}
      <div className="trovoes-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Sessões de Treino Cadastradas:
        </span>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {trainings.map((t) => {
            const isSelected = selectedTraining?.id === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setSelectedTraining(t)}
                className={`p-3 rounded-2xl text-left min-w-[200px] shrink-0 transition border ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">{formatDateBR(t.date)}</span>
                </div>
                <p className="font-bold text-white text-xs truncate">{t.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {t.time} • {t.locationName}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Training Details & Attendance List */}
      {selectedTraining ? (
        <div className="space-y-4">
          
          {/* Stats Bar for Selected Session */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Atletas na Categoria</span>
              <span className="text-xl font-bold font-syne text-white">{totalCount}</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">Presentes</span>
              <span className="text-xl font-bold font-syne text-emerald-400">{presentCount}</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-red-400 block font-bold uppercase">Ausentes</span>
              <span className="text-xl font-bold font-syne text-red-400">{absentCount}</span>
            </div>
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-amber-400 block font-bold uppercase">% Frequência</span>
              <span className="text-xl font-bold font-syne text-amber-400">{attendancePercentage}%</span>
            </div>
          </div>

          {/* Player Attendance Check-in List */}
          <div className="trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-syne font-bold text-base text-white">
                  Lista de Chamada • {selectedTraining.title} ({selectedTraining.category})
                </h3>
                <p className="text-xs text-slate-400">Clique nos botões de cada atleta para registrar presença instantaneamente.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {categoryPlayers.map((player) => {
                const rec = attendanceRecords[player.id];
                const status = rec?.status;

                return (
                  <div
                    key={player.id}
                    className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.photoUrl}
                        alt={player.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400/50"
                      />
                      <div>
                        <h4 className="font-bold text-white text-xs">{player.fullName}</h4>
                        <p className="text-[10px] text-slate-400">{player.position} • Pé {player.dominantFoot}</p>
                      </div>
                    </div>

                    {/* Quick 1-Tap Attendance Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleMarkAttendance(player, 'Presente')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          status === 'Presente'
                            ? 'bg-emerald-500 text-black shadow-lg trovoes-glow-yellow'
                            : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Presente</span>
                      </button>

                      <button
                        onClick={() => handleMarkAttendance(player, 'Ausente')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          status === 'Ausente'
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-800'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Ausente</span>
                      </button>

                      <button
                        onClick={() => handleMarkAttendance(player, 'Justificado')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          status === 'Justificado'
                            ? 'bg-amber-500 text-black'
                            : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800'
                        }`}
                      >
                        Justif.
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          Selecione um treino acima para abrir a lista de presença.
        </div>
      )}

      {/* New Training Modal */}
      {showNewTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0A111E] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-syne text-white">Cadastrar Nova Sessão de Treino</h3>
            
            <form onSubmit={handleCreateTraining} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Título do Treino</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Treino Tático & Transição"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Sub 14">Sub 14</option>
                  <option value="Sub 15">Sub 15</option>
                  <option value="Sub 17">Sub 17</option>
                  <option value="Sub 20">Sub 20</option>
                  <option value="Todas">Todas as Categorias</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Local de Treino</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Observações / Recomendações</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções sobre chuteira, uniforme, garrafas de água..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTrainingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-extrabold shadow trovoes-glow-yellow"
                >
                  {loading ? 'Salvando...' : 'Criar Treino'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
