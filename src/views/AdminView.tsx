import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Check, 
  X, 
  Bell, 
  Plus, 
  UserCheck, 
  Sparkles, 
  Settings, 
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { Player, UserProfile, Announcement, Category } from '../types';
import { db, collection, onSnapshot, updateDoc, doc, addDoc, setDoc, deleteDoc } from '../lib/firebase';
import { exportToCSV } from '../lib/utils';

interface AdminViewProps {
  players: Player[];
  announcements: Announcement[];
  onSelectPlayer: (p: Player) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  players,
  announcements,
  onSelectPlayer
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'users' | 'announcements'>('pending');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<Category | 'Geral'>('Geral');
  const [loading, setLoading] = useState(false);

  // Sync users list in realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = snapshot.docs.map(d => d.data() as UserProfile);
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const pendingPlayers = players.filter(p => p.status === 'Pendente');

  const handleUpdatePlayerStatus = async (playerId: string, newStatus: 'Aprovado' | 'Recusado') => {
    try {
      await updateDoc(doc(db, 'players', playerId), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeUserRole = async (uid: string, newRole: any) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setLoading(true);

    try {
      const newRef = doc(collection(db, 'announcements'));
      const newAnn: Announcement = {
        id: newRef.id,
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        author: 'Comissão Técnica',
        createdAt: new Date().toISOString(),
        important: true
      };

      await setDoc(newRef, newAnn);
      setAnnTitle('');
      setAnnContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportFullRosterCSV = () => {
    const rows = players.map(p => ({
      'Nome Completo': p.fullName,
      'Data Nasc': p.birthDate,
      'RG/CPF': p.rgCpf,
      'Categoria': p.category,
      'Posição': p.position,
      'Pé Dominante': p.dominantFoot,
      'Altura (cm)': p.height,
      'Peso (kg)': p.weight,
      'Status': p.status,
      'Responsável': p.guardians[0]?.name || '',
      'Telefone Responsável': p.guardians[0]?.phone || '',
      'Endereço': p.address
    }));
    exportToCSV('Relatorio_Geral_Atletas_TROVOES', rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-syne text-white flex items-center gap-2">
            Painel do Administrador
            <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
              Admin Master
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aprovação de fichas pendentes, controle de acessos de usuários e broadcasts do clube.
          </p>
        </div>

        <button
          onClick={handleExportFullRosterCSV}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Exportar Banco Geral (Excel)</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'pending'
              ? 'bg-amber-400 text-black shadow-lg trovoes-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Fichas Pendentes ({pendingPlayers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'users'
              ? 'bg-amber-400 text-black shadow-lg trovoes-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'announcements'
              ? 'bg-amber-400 text-black shadow-lg trovoes-glow-yellow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Comunicados ({announcements.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: Pending Registrations Approval */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingPlayers.length === 0 ? (
            <div className="trovoes-card p-12 text-center rounded-3xl border border-slate-800 space-y-2">
              <Check className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-slate-200">Nenhuma ficha pendente</h3>
              <p className="text-xs text-slate-500">Todas as inscrições de atletas foram analisadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPlayers.map((player) => (
                <div
                  key={player.id}
                  className="trovoes-card p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={player.photoUrl}
                      alt={player.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{player.fullName}</h4>
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {player.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {player.position} • Pé {player.dominantFoot} • Resp: {player.guardians[0]?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onSelectPlayer(player)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      Analisar Ficha
                    </button>
                    <button
                      onClick={() => handleUpdatePlayerStatus(player.id, 'Aprovado')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-extrabold shadow transition flex items-center gap-1"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Aprovar
                    </button>
                    <button
                      onClick={() => handleUpdatePlayerStatus(player.id, 'Recusado')}
                      className="px-3 py-1.5 rounded-xl bg-red-950 text-red-300 hover:bg-red-900 text-xs font-bold transition"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: Users Management */}
      {activeSubTab === 'users' && (
        <div className="trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-syne font-bold text-base text-white border-b border-slate-800 pb-2">
            Gestão de Permissões de Usuários
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Papel Atual</th>
                  <th className="py-3 px-4 text-right">Alterar Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u.uid, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="jogador">Jogador</option>
                        <option value="responsavel">Responsável</option>
                        <option value="admin">Admin Master</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: Announcements Broadcaster */}
      {activeSubTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Create Announcement Form */}
          <div className="trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-syne font-bold text-base text-white border-b border-slate-800 pb-2">
              Publicar Novo Aviso
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Título do Aviso</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ex: Mudança de horário no treino..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Categoria Destino</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                >
                  <option value="Geral">Geral (Todas as Categorias)</option>
                  <option value="Sub 14">Sub 14</option>
                  <option value="Sub 15">Sub 15</option>
                  <option value="Sub 17">Sub 17</option>
                  <option value="Sub 20">Sub 20</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Conteúdo da Notificação</label>
                <textarea
                  rows={3}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Mensagem para aparecer na tela inicial..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow trovoes-glow-yellow"
              >
                {loading ? 'Publicando...' : 'Transmitir Notificação'}
              </button>
            </form>
          </div>

          {/* Active Announcements List */}
          <div className="md:col-span-2 trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-syne font-bold text-base text-white border-b border-slate-800 pb-2">
              Avisos Ativos no App
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {ann.category}
                    </span>
                    <h4 className="font-bold text-white text-xs">{ann.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{ann.content}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 transition shrink-0"
                    title="Excluir Aviso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
