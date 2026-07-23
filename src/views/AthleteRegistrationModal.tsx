import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  FileText, 
  MapPin, 
  Phone, 
  Award, 
  ShieldCheck, 
  Upload, 
  Plus, 
  Trash2, 
  Zap, 
  Check, 
  FileUp, 
  Activity,
  Ruler,
  Scale,
  Sparkles
} from 'lucide-react';
import { db, collection, addDoc, doc, setDoc } from '../lib/firebase';
import { Player, Guardian, Position, DominantFoot, Category } from '../types';
import { calculateCategory, calculateAge } from '../lib/utils';
import { SignatureCanvas } from '../components/SignatureCanvas';

interface AthleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (player?: Player) => void;
  isAdminAutoApprove?: boolean;
}

export const AthleteRegistrationModal: React.FC<AthleteRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isAdminAutoApprove = false
}) => {
  if (!isOpen) return null;

  // Form State
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [rgCpf, setRgCpf] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<Position>('Atacante');
  const [dominantFoot, setDominantFoot] = useState<DominantFoot>('Direito');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [injuryHistory, setInjuryHistory] = useState('Nenhuma lesão grave relatada.');
  const [previousClub, setPreviousClub] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [docPhotoUrl, setDocPhotoUrl] = useState('');
  const [proofAddressUrl, setProofAddressUrl] = useState('');

  // Guardians State
  const [guardians, setGuardians] = useState<Guardian[]>([
    { id: '1', name: '', relationship: 'Mãe', cpf: '', phone: '', email: '' }
  ]);

  // Minor Authorization State
  const [authorized, setAuthorized] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [guardianCpfAuth, setGuardianCpfAuth] = useState('');
  const legalText = "Eu, responsável legal, autorizo o menor a participar das atividades do time TROVOES, treinos, viagens e competições, assumindo responsabilidade por eventuais incidentes.";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dynamic calculated age & category
  const age = birthDate ? calculateAge(birthDate) : 0;
  const computedCategory = birthDate ? calculateCategory(birthDate) : 'Sub 15';

  const handleAddGuardian = () => {
    setGuardians([
      ...guardians,
      { id: Date.now().toString(), name: '', relationship: 'Pai', cpf: '', phone: '', email: '' }
    ]);
  };

  const handleRemoveGuardian = (id: string) => {
    if (guardians.length === 1) return;
    setGuardians(guardians.filter(g => g.id !== id));
  };

  const handleGuardianChange = (id: string, field: keyof Guardian, value: string) => {
    setGuardians(
      guardians.map(g => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  // Convert File to Base64 preview image
  const handleFileConvert = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem de até 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !birthDate || !rgCpf.trim()) {
      setError('Preencha os dados básicos do atleta (Nome, Data Nasc. e RG/CPF).');
      return;
    }

    if (!authorized) {
      setError('É necessário aceitar a Autorização Legal do Responsável.');
      return;
    }

    if (guardians.some(g => !g.name.trim() || !g.phone.trim())) {
      setError('Preencha o nome e telefone de pelo menos um responsável legal.');
      return;
    }

    setLoading(true);

    try {
      const pRef = doc(collection(db, 'players'));
      const newPlayer: Player = {
        id: pRef.id,
        fullName: fullName.trim(),
        birthDate,
        rgCpf: rgCpf.trim(),
        address: address.trim(),
        phone: phone.trim(),
        position,
        dominantFoot,
        height: Number(height) || 170,
        weight: Number(weight) || 65,
        injuryHistory: injuryHistory.trim(),
        previousClub: previousClub.trim() || 'Nenhum',
        category: computedCategory,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
        docPhotoUrl,
        proofAddressUrl,
        guardians,
        minorAuthorization: {
          authorized: true,
          legalText,
          signatureDataUrl: signatureData,
          date: new Date().toISOString().split('T')[0],
          guardianCpf: guardianCpfAuth || guardians[0]?.cpf || ''
        },
        status: isAdminAutoApprove ? 'Aprovado' : 'Pendente',
        createdAt: new Date().toISOString()
      };

      await setDoc(pRef, newPlayer);
      alert('Ficha de inscrição enviada com sucesso! O cadastro do atleta foi salvo no sistema TROVOES.');
      if (onSuccess) onSuccess(newPlayer);
      onClose();
    } catch (err: any) {
      console.error('Error registering player:', err);
      setError('Erro ao salvar no banco de dados: ' + (err.message || 'Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0A111E] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="sticky top-0 z-20 bg-[#0E1726] border-b border-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-syne text-white flex items-center gap-2">
                Ficha de Inscrição do Atleta
              </h2>
              <p className="text-xs text-slate-400">Time de Futebol de Base TROVOES</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-200 flex-1">
          
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 font-medium">
              ⚠️ {error}
            </div>
          )}

          <form id="athleteForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Dados Pessoais do Atleta */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Dados do Atleta
                </span>
                {birthDate && (
                  <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Categoria Calculada: {computedCategory} ({age} anos)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Nome Completo do Atleta *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Gabriel Lucas Santos"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">RG / CPF do Atleta *</label>
                  <input
                    type="text"
                    required
                    value={rgCpf}
                    onChange={(e) => setRgCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Endereço Completo</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade - UF"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Telefone / WhatsApp do Atleta</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Clube Anterior (se houver)</label>
                  <input
                    type="text"
                    value={previousClub}
                    onChange={(e) => setPreviousClub(e.target.value)}
                    placeholder="Ex: Escolinha Futuro FC"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Dados Técnicos e Físicos */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Activity className="w-4 h-4" /> 2. Perfil Técnico & Físico
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Posição Preferencial</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Atacante">Atacante</option>
                    <option value="Ponta">Ponta</option>
                    <option value="Meio-Campista">Meio-Campista</option>
                    <option value="Zagueiro">Zagueiro</option>
                    <option value="Lateral">Lateral</option>
                    <option value="Goleiro">Goleiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Pé Dominante</label>
                  <select
                    value={dominantFoot}
                    onChange={(e) => setDominantFoot(e.target.value as DominantFoot)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Direito">Direito</option>
                    <option value="Esquerdo">Esquerdo</option>
                    <option value="Ambidestro">Ambidestro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-amber-400" /> Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1">
                    <Scale className="w-3 h-3 text-amber-400" /> Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Histórico de Lesões / Observações Médicas</label>
                <textarea
                  rows={2}
                  value={injuryHistory}
                  onChange={(e) => setInjuryHistory(e.target.value)}
                  placeholder="Relate lesões anteriores, cirurgias ou alergias relevantes..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* SECTION 3: Pais / Responsáveis Legal */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 3. Pais / Responsáveis Legais
                </span>
                <button
                  type="button"
                  onClick={handleAddGuardian}
                  className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-400/40 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Responsável
                </button>
              </div>

              {guardians.map((g, idx) => (
                <div key={g.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between font-bold text-slate-300 text-[11px]">
                    <span>Responsável #{idx + 1}</span>
                    {guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGuardian(g.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        value={g.name}
                        onChange={(e) => handleGuardianChange(g.id, 'name', e.target.value)}
                        placeholder="Nome do pai/mãe/responsável"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Parentesco</label>
                      <select
                        value={g.relationship}
                        onChange={(e) => handleGuardianChange(g.id, 'relationship', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Mãe">Mãe</option>
                        <option value="Pai">Pai</option>
                        <option value="Avô/Avó">Avô / Avó</option>
                        <option value="Tutor Legal">Tutor Legal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">CPF do Responsável</label>
                      <input
                        type="text"
                        value={g.cpf}
                        onChange={(e) => handleGuardianChange(g.id, 'cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Telefone / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={g.phone}
                        onChange={(e) => handleGuardianChange(g.id, 'phone', e.target.value)}
                        placeholder="(11) 90000-0000"
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 4: Termo Legal e Assinatura Digital */}
            <div className="space-y-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> 4. Autorização para Menores (Termo Legal Obrigatório)
              </span>

              <div className="p-3 bg-black/40 rounded-xl border border-amber-500/20 leading-relaxed text-slate-300 font-medium">
                "{legalText}"
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="legalAgree"
                  checked={authorized}
                  onChange={(e) => setAuthorized(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <label htmlFor="legalAgree" className="text-slate-200 font-semibold cursor-pointer">
                  Eu, responsável legal pelo atleta, li, compreendi e concordo integralmente com os termos da autorização acima.
                </label>
              </div>

              {authorized && (
                <div className="pt-2">
                  <SignatureCanvas
                    value={signatureData}
                    onSave={(data) => setSignatureData(data)}
                  />
                </div>
              )}
            </div>

            {/* SECTION 5: Upload de Fotos / Documentos */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" /> 5. Fotos e Comprovantes
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Foto do Atleta */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                  <span className="font-semibold text-slate-300 block">Foto de Rosto (Perfil)</span>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amber-400" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto flex items-center justify-center text-slate-600 border border-slate-800">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <label className="block bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition">
                    Carregar Foto
                    <input type="file" accept="image/*" onChange={(e) => handleFileConvert(e, setPhotoUrl)} className="hidden" />
                  </label>
                </div>

                {/* Foto do Documento */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                  <span className="font-semibold text-slate-300 block">Documento (RG/CPF)</span>
                  {docPhotoUrl ? (
                    <div className="text-amber-400 font-bold text-[10px] flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Anexado
                    </div>
                  ) : (
                    <div className="w-16 h-12 bg-slate-900 mx-auto rounded flex items-center justify-center text-slate-600 border border-slate-800">
                      <FileUp className="w-6 h-6" />
                    </div>
                  )}
                  <label className="block bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition">
                    Anexar RG/CPF
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileConvert(e, setDocPhotoUrl)} className="hidden" />
                  </label>
                </div>

                {/* Comprovante de Residência */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
                  <span className="font-semibold text-slate-300 block">Comprovante Residência</span>
                  {proofAddressUrl ? (
                    <div className="text-amber-400 font-bold text-[10px] flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Anexado
                    </div>
                  ) : (
                    <div className="w-16 h-12 bg-slate-900 mx-auto rounded flex items-center justify-center text-slate-600 border border-slate-800">
                      <FileUp className="w-6 h-6" />
                    </div>
                  )}
                  <label className="block bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2 py-1.5 rounded-lg cursor-pointer text-[11px] transition">
                    Anexar Comprovante
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileConvert(e, setProofAddressUrl)} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 bg-[#0E1726] border-t border-slate-800 p-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="athleteForm"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg trovoes-glow-yellow transition flex items-center gap-2"
          >
            {loading ? (
              <span>Salvando Ficha...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Finalizar Inscrição do Atleta</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
