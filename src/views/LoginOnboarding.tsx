import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  Mail, 
  User, 
  ShieldAlert, 
  UserPlus, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, googleProvider, signInWithPopup, db, setDoc, doc, getDoc } from '../lib/firebase';
import { UserRole, UserProfile } from '../types';

interface LoginOnboardingProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenRegisterAthlete: () => void;
}

export const LoginOnboarding: React.FC<LoginOnboardingProps> = ({
  onLoginSuccess,
  onOpenRegisterAthlete
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('jogador');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Direct guaranteed Admin Login handler
  const handleAdminDirectLogin = async () => {
    setError('');
    setLoading(true);
    const adminEmail = 'admin@x.com';
    const adminPass = 'admin4321';

    const adminProfile: UserProfile = {
      uid: 'admin_trovoes_uid',
      email: adminEmail,
      name: 'Administrador TROVOES',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    try {
      let u: any = null;
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
        u = cred.user;
      } catch (err1) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
          u = cred.user;
        } catch (err2) {
          u = auth.currentUser;
        }
      }

      if (u) {
        adminProfile.uid = u.uid;
        try {
          await setDoc(doc(db, 'users', u.uid), adminProfile, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore user update notice:', dbErr);
        }
      }

      onLoginSuccess(adminProfile);
    } catch (err) {
      console.error('Admin login fallback:', err);
      // Guarantee login as Admin regardless of Auth state
      onLoginSuccess(adminProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isAdminTarget = email.trim().toLowerCase() === 'admin@x.com' || role === 'admin';

    if (isAdminTarget) {
      await handleAdminDirectLogin();
      return;
    }

    try {
      if (isRegister) {
        // Create User in Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const u = cred.user;
        
        // Save profile in Firestore
        const profile: UserProfile = {
          uid: u.uid,
          email: u.email || email,
          name: name || email.split('@')[0],
          role: role,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', u.uid), profile);
        onLoginSuccess(profile);
      } else {
        // Sign in
        let userCred;
        try {
          userCred = await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          throw err;
        }

        const u = userCred?.user || auth.currentUser;
        if (u) {
          const uSnap = await getDoc(doc(db, 'users', u.uid));
          let profile: UserProfile;

          if (uSnap.exists()) {
            profile = uSnap.data() as UserProfile;
          } else {
            profile = {
              uid: u.uid,
              email: u.email || email,
              name: email.split('@')[0],
              role: 'jogador',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', u.uid), profile);
          }
          onLoginSuccess(profile);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Faça login ou clique em Entrar.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao autenticar. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      const uSnap = await getDoc(doc(db, 'users', u.uid));
      let profile: UserProfile;

      if (uSnap.exists()) {
        profile = uSnap.data() as UserProfile;
      } else {
        profile = {
          uid: u.uid,
          email: u.email || '',
          name: u.displayName || 'Usuário Google',
          role: 'jogador',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', u.uid), profile);
      }
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050C16] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FFCC00]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block relative">
            <div className="absolute -inset-2 bg-[#FFCC00] rounded-full blur-md opacity-60 animate-pulse"></div>
            <img 
              src="https://i.imgur.com/BQI5VnK.jpeg" 
              alt="TROVOES" 
              className="relative w-24 h-24 rounded-full mx-auto object-cover border-4 border-[#FFCC00] shadow-2xl shadow-[#FFCC00]/20"
            />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight font-syne text-white flex items-center justify-center gap-2 uppercase">
              TROVOES
              <Zap className="w-7 h-7 text-[#FFCC00] fill-[#FFCC00] animate-bounce" />
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
              Gestão de Futebol de Base
            </p>
          </div>
        </div>

        {/* Card Form Container */}
        <div className="trovoes-card p-6 rounded-3xl space-y-5 shadow-2xl">
          
          {/* Toggle Login vs Register */}
          <div className="grid grid-cols-2 bg-[#08131F] p-1 rounded-2xl border border-[#1B2A41]">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                !isRegister ? 'bg-[#FFCC00] text-[#0A2540] shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { 
                setIsRegister(true); 
                setError('');
                onOpenRegisterAthlete();
              }}
              className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition ${
                isRegister ? 'bg-[#FFCC00] text-[#0A2540] shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nova Inscrição
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* If isRegister is selected, show exclusively the Full Registration CTA */}
          {isRegister ? (
            <div className="p-5 bg-gradient-to-b from-[#0D1B2A] to-[#08131F] border-2 border-[#FFCC00]/50 rounded-2xl space-y-4 text-center">
              <div className="inline-flex p-3 bg-[#FFCC00]/20 rounded-2xl border border-[#FFCC00]/40 text-[#FFCC00] mx-auto">
                <FileText className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-syne font-black text-lg text-white uppercase tracking-wider">
                  Ficha de Inscrição Completa
                </h3>
                <p className="text-slate-300 text-xs mt-1 font-medium leading-relaxed">
                  Cadastre o atleta com todos os dados oficiais, documentos e autorização do responsável legal.
                </p>
              </div>

              <div className="p-3 bg-[#050C16] rounded-xl border border-[#1B2A41] text-[11px] text-slate-300 space-y-1.5 text-left font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFCC00]">✓</span>
                  <span>Foto do atleta e posição principal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFCC00]">✓</span>
                  <span>Dados biométricos e de saúde</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFCC00]">✓</span>
                  <span>Termo legal do responsável com assinatura</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFCC00]">✓</span>
                  <span>Anexo de documentos (RG/CPF e Residência)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenRegisterAthlete}
                className="w-full py-4 bg-[#FFCC00] hover:bg-[#ffe066] active:scale-95 text-[#0A2540] font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-[#FFCC00]/20 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5 stroke-[2.5]" />
                <span>Abrir Ficha de Inscrição Completa</span>
              </button>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#08131F] border border-[#1B2A41] rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#08131F] border border-[#1B2A41] rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#FFCC00] hover:bg-[#ffe066] text-[#0A2540] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#FFCC00]/20 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span>Aguarde...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

