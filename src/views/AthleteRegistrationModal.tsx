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
  Sparkles,
  Lock
} from 'lucide-react';
import { auth, db, collection, addDoc, doc, setDoc } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Player, Guardian, Position, DominantFoot, Category } from '../types';
import { calculateCategory, calculateAge, compressImage } from '../lib/utils';
import { SignatureCanvas } from '../components/SignatureCanvas';

interface AthleteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (player?: Player) => void;
  isAdminAutoApprove?: boolean;
  initialData?: Player | null;
}

export const AthleteRegistrationModal: React.FC<AthleteRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isAdminAutoApprove = false,
  initialData
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Populate data when editing
  useEffect(() => {
    if (initialData && isOpen) {
      setFullName(initialData.fullName || '');
      setBirthDate(initialData.birthDate || '');
      setRgCpf(initialData.rgCpf || '');
      setAddress(initialData.address || '');
      setPhone(initialData.phone || '');
      setPosition(initialData.position || 'Atacante');
      setDominantFoot(initialData.dominantFoot || 'Direito');
      setHeight(initialData.height || 170);
      setWeight(initialData.weight || 65);
      setInjuryHistory(initialData.injuryHistory || '');
      setPreviousClub(initialData.previousClub || '');
      setPhotoUrl(initialData.photoUrl || '');
      setDocPhotoUrl(initialData.docPhotoUrl || '');
      setProofAddressUrl(initialData.proofAddressUrl || '');
      
      if (initialData.guardians && initialData.guardians.length > 0) {
        setGuardians(initialData.guardians);
      } else {
        setGuardians([{ id: '1', name: '', relationship: 'Mãe', cpf: '', phone: '', email: '' }]);
      }

      if (initialData.minorAuthorization) {
        setAuthorized(initialData.minorAuthorization.authorized || false);
        setSignatureData(initialData.minorAuthorization.signatureDataUrl || '');
        setGuardianCpfAuth(initialData.minorAuthorization.guardianCpf || '');
      }
    } else if (isOpen) {
      // Reset form when opening as new
      setFullName('');
      setEmail('');
      setPassword('');
      setBirthDate('');
      setRgCpf('');
      setAddress('');
      setPhone('');
      setPosition('Atacante');
      setDominantFoot('Direito');
      setHeight(170);
      setWeight(65);
      setInjuryHistory('Nenhuma lesão grave relatada.');
      setPreviousClub('');
      setPhotoUrl('');
      setDocPhotoUrl('');
      setProofAddressUrl('');
      setGuardians([{ id: '1', name: '', relationship: 'Mãe', cpf: '', phone: '', email: '' }]);
      setAuthorized(false);
      setSignatureData('');
      setGuardianCpfAuth('');
      setError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Dynamic calculated age & category
  const age = birthDate ? calculateAge(birthDate) : 0;
  const computedCategory = birthDate ? calculateCategory(birthDate) : 'Sub 15';
  const isAdult = age >= 18;

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

  // Convert File to Lightweight Compressed Base64 Image
  const handleFileConvert = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 750, 0.55);
        setter(compressedBase64);
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Erro ao processar imagem. Tente outra foto.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !birthDate || !rgCpf.trim()) {
      setError('Preencha os dados básicos do atleta (Nome, Data Nasc. e RG/CPF).');
      return;
    }

    // Validation for MINORS (< 18 years)
    if (!isAdult) {
      if (!authorized) {
        setError('É necessário aceitar a Autorização Legal do Responsável para menor de idade.');
        return;
      }

      if (guardians.some(g => !g.name.trim() || !g.phone.trim())) {
        setError('Preencha o nome e telefone de pelo menos um responsável legal.');
        return;
      }
    } else {
      // Validation for ADULTS (>= 18 years)
      if (!docPhotoUrl) {
        setError('Como atleta maior de 18 anos, por favor anexe a foto do seu documento de identidade (RG ou CPF) na Seção 5.');
        return;
      }
    }

    setLoading(true);

    try {
      let uid = initialData ? initialData.id : doc(collection(db, 'players')).id;

      if (!initialData && !isAdminAutoApprove && email && password) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          uid = cred.user.uid;
          
          await setDoc(doc(db, 'users', uid), {
            uid: uid,
            email: email.trim(),
            name: fullName.trim(),
            role: 'jogador',
            createdAt: new Date().toISOString()
          });
        } catch (authErr: any) {
          setError('Erro ao criar conta de acesso: ' + authErr.message);
          setLoading(false);
          return;
        }
      }

      const pRef = doc(db, 'players', uid);
      const activeGuardians = isAdult 
        ? guardians.filter(g => g.name.trim().length > 0)
        : guardians;

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
        guardians: activeGuardians,
        minorAuthorization: isAdult ? {
          authorized: true,
          legalText: 'Atleta Maior de Idade (18+ anos) - Autorização do responsável legal dispensada.',
          signatureDataUrl: '',
          date: new Date().toISOString().split('T')[0],
          guardianCpf: ''
        } : {
          authorized: true,
          legalText,
          signatureDataUrl: signatureData,
          date: new Date().toISOString().split('T')[0],
          guardianCpf: guardianCpfAuth || guardians[0]?.cpf || ''
        },
        status: initialData ? initialData.status : (isAdminAutoApprove ? 'Aprovado' : 'Pendente'),
        createdAt: initialData ? initialData.createdAt : new Date().toISOString()
      };

      // Payload size safety guard before Firestore save
      const docPayload = JSON.stringify(newPlayer);
      const byteSize = new Blob([docPayload]).size;

      if (byteSize > 950000) {
        setError('O tamanho acumulado das imagens é muito grande para o banco de dados. Por favor, reenvie fotos mais nítidas e menores.');
        setLoading(false);
        return;
      }

      await setDoc(pRef, newPlayer);
      alert(initialData ? 'Atleta atualizado com sucesso!' : 'Ficha de inscrição enviada com sucesso! O cadastro do atleta foi salvo no sistema TROVOES.');
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
            
            {/* SECTION 0: Acesso (Only for Self Registration) */}
            {!isAdminAutoApprove && !initialData && (
              <div className="space-y-4 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> 0. Criar Acesso ao Painel
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-amber-200/80 text-[10px] uppercase font-bold mb-1">Email de Acesso *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-200/80 text-[10px] uppercase font-bold mb-1">Senha (Mín. 6 caracteres) *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition shadow-inner"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-200/60 font-medium pt-1">
                  Estes dados serão usados para você acessar o painel exclusivo do atleta TROVOES.
                </p>
              </div>
            )}

            {/* SECTION 1: Dados Pessoais do Atleta */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Dados do Atleta
                </span>
                {birthDate && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                    isAdult 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  }`}>
                    <Sparkles className="w-3 h-3" /> 
                    {isAdult 
                      ? `Maior de Idade (${age} anos • ${computedCategory})`
                      : `Menor de Idade • Categoria ${computedCategory} (${age} anos)`
                    }
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
                  <ShieldCheck className="w-4 h-4" /> 3. Pais / Responsáveis Legais {isAdult ? '(Opcional para Maiores de 18 anos)' : '*'}
                </span>
                {!isAdult && (
                  <button
                    type="button"
                    onClick={handleAddGuardian}
                    className="flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-400/40 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Responsável
                  </button>
                )}
              </div>

              {isAdult ? (
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-400 text-xs leading-relaxed">
                  <span className="text-emerald-400 font-bold block mb-0.5">✓ Atleta Maior de Idade ({age} anos)</span>
                  O preenchimento de responsável legal é opcional para atletas maiores de 18 anos.
                </div>
              ) : (
                guardians.map((g, idx) => (
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
                          required={!isAdult}
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
                          required={!isAdult}
                          value={g.phone}
                          onChange={(e) => handleGuardianChange(g.id, 'phone', e.target.value)}
                          placeholder="(11) 90000-0000"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* SECTION 4: Termo Legal e Assinatura Digital */}
            {isAdult ? (
              <div className="space-y-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
                <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 stroke-[3]" /> 4. Autorização do Responsável: Dispensada (Atleta Maior de 18 Anos)
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Você informou ter <strong>{age} anos</strong>. Como atleta maior de idade, a autorização de responsável legal não é necessária.
                </p>
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <FileUp className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Basta anexar a foto do seu documento com foto (RG/CPF) na Seção 5 abaixo.</span>
                </div>
              </div>
            ) : (
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
            )}

            {/* SECTION 5: Upload de Fotos / Documentos */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" /> 5. Fotos e Documento Oficial
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
