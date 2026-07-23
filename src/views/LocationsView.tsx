import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  ExternalLink, 
  Sun, 
  Moon, 
  Trash2, 
  Edit3, 
  Zap, 
  X,
  Check
} from 'lucide-react';
import { TrainingLocation } from '../types';
import { db, collection, setDoc, doc, deleteDoc } from '../lib/firebase';

interface LocationsViewProps {
  locations: TrainingLocation[];
  isAdmin: boolean;
}

export const LocationsView: React.FC<LocationsViewProps> = ({ locations, isAdmin }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLoc, setEditingLoc] = useState<TrainingLocation | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [pitchType, setPitchType] = useState<'Grama Natural' | 'Grama Sintética' | 'Society' | 'Quadra'>('Grama Natural');
  const [lighting, setLighting] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setName('');
    setAddress('');
    setMapUrl('');
    setPitchType('Grama Natural');
    setLighting(true);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (loc: TrainingLocation) => {
    setEditingLoc(loc);
    setName(loc.name);
    setAddress(loc.address);
    setMapUrl(loc.mapUrl || '');
    setPitchType(loc.pitchType);
    setLighting(loc.lighting);
    setNotes(loc.notes || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este local de treino?')) {
      try {
        await deleteDoc(doc(db, 'locations', id));
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    setLoading(true);

    try {
      const id = editingLoc ? editingLoc.id : doc(collection(db, 'locations')).id;
      const newLoc: TrainingLocation = {
        id,
        name: name.trim(),
        address: address.trim(),
        mapUrl: mapUrl.trim() || `https://maps.google.com/?q=${encodeURIComponent(address)}`,
        pitchType,
        lighting,
        notes: notes.trim()
      };

      await setDoc(doc(db, 'locations', id), newLoc);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving location:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-syne text-white flex items-center gap-2">
            Locais de Treino
            <span className="bg-amber-400/20 text-amber-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
              {locations.length} CTs Registrados
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centros de treinamento, campos e quadras cadastrados para as sessões do TROVOES.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg trovoes-glow-yellow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar Local</span>
          </button>
        )}
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="trovoes-card p-5 rounded-3xl border border-slate-800 space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {loc.pitchType}
                </span>
                <h3 className="font-bold text-white text-base font-syne">{loc.name}</h3>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(loc)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{loc.address}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                {loc.lighting ? (
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] font-bold">
                    <Moon className="w-3 h-3" /> Com Iluminação Noturna
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] font-bold">
                    <Sun className="w-3 h-3" /> Treinos Diurnos
                  </span>
                )}
              </div>

              {loc.mapUrl && (
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-400/30 transition flex items-center gap-1"
                >
                  <span>Ver no Mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {loc.notes && (
              <p className="text-slate-400 text-xs border-t border-slate-800/80 pt-2.5">
                💡 {loc.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0A111E] border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-lg font-bold font-syne text-white">
              {editingLoc ? 'Editar Local de Treino' : 'Cadastrar Novo Local'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nome do Campo / Centro Esportivo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: CT TROVOES Arena"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Tipo de Gramado</label>
                  <select
                    value={pitchType}
                    onChange={(e) => setPitchType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white"
                  >
                    <option value="Grama Natural">Grama Natural</option>
                    <option value="Grama Sintética">Grama Sintética</option>
                    <option value="Society">Society</option>
                    <option value="Quadra">Quadra Coberta</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lighting}
                      onChange={(e) => setLighting(e.target.checked)}
                      className="accent-amber-400"
                    />
                    <span className="text-slate-300 font-semibold">Iluminação Noturna</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Link do Mapa (Google Maps / Waze)</label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Observações (Vestiários, estacionamento...)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes sobre acesso, portaria..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-extrabold shadow trovoes-glow-yellow"
                >
                  {loading ? 'Salvando...' : 'Salvar Local'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
