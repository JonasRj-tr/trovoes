import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';

import firebaseConfigData from '../../firebase-applet-config.json';
import { Player, Training, TrainingLocation, Callup, Announcement, UserProfile } from '../types';

const firebaseConfig = {
  projectId: firebaseConfigData.projectId,
  appId: firebaseConfigData.appId,
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if defined
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
};

// Helper for seeding initial demo data if Firestore collections are empty
export async function seedInitialDataIfNeeded() {
  try {
    const playersSnap = await getDocs(collection(db, 'players'));
    if (!playersSnap.empty) return; // Data already exists

    console.log('Seeding initial TROVOES data into Firestore...');

    // 1. Initial Training Locations
    const loc1Ref = doc(collection(db, 'locations'));
    const loc1: TrainingLocation = {
      id: loc1Ref.id,
      name: 'Centro de Treinamento TROVOES Arena',
      address: 'Av. dos Esportes, 1000 - Campo Limpo, SP',
      pitchType: 'Grama Natural',
      lighting: true,
      notes: 'Campo oficial 110x75m com vestiários e sala de musculação.',
      mapUrl: 'https://maps.google.com/?q=Av.+dos+Esportes+1000'
    };
    await setDoc(loc1Ref, loc1);

    const loc2Ref = doc(collection(db, 'locations'));
    const loc2: TrainingLocation = {
      id: loc2Ref.id,
      name: 'Complexo Esportivo do Parque',
      address: 'Rua das Palmeiras, 450 - SP',
      pitchType: 'Grama Sintética',
      lighting: true,
      notes: 'Excelente para treinos técnicos e com iluminação noturna LED.',
      mapUrl: 'https://maps.google.com/?q=Rua+das+Palmeiras+450'
    };
    await setDoc(loc2Ref, loc2);

    // 2. Initial Sample Players (Atletas Aprovados)
    const initialPlayers: Omit<Player, 'id'>[] = [
      {
        fullName: 'Lucas Gabriel Silveira',
        birthDate: '2011-04-12', // Sub 15 (15 years in 2026)
        rgCpf: '54.321.987-1',
        address: 'Rua Orestes, 210, SP',
        phone: '(11) 98877-6655',
        position: 'Atacante',
        dominantFoot: 'Direito',
        height: 172,
        weight: 64,
        injuryHistory: 'Nenhuma lesão grave nos últimos 2 anos.',
        previousClub: 'Escolinha Futuro FC',
        category: 'Sub 15',
        photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80',
        guardians: [
          {
            id: 'g1',
            name: 'Carlos Silveira',
            relationship: 'Pai',
            cpf: '123.456.789-00',
            phone: '(11) 98877-6655',
            email: 'carlos.silveira@email.com'
          }
        ],
        minorAuthorization: {
          authorized: true,
          legalText: 'Eu, responsável legal, autorizo o menor a participar das atividades do time TROVOES, treinos, viagens e competições, assumindo responsabilidade por eventuais incidentes.',
          date: '2026-01-10',
          guardianCpf: '123.456.789-00'
        },
        status: 'Aprovado',
        createdAt: new Date().toISOString()
      },
      {
        fullName: 'Mateus Henrique Santos',
        birthDate: '2009-08-25', // Sub 17 (17 years)
        rgCpf: '43.210.876-5',
        address: 'Av. Paulista, 1500, SP',
        phone: '(11) 97766-5544',
        position: 'Meio-Campista',
        dominantFoot: 'Esquerdo',
        height: 178,
        weight: 70,
        injuryHistory: 'Entorse leve no tornozelo em 2025.',
        previousClub: 'Trovoes Base Sub 15',
        category: 'Sub 17',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        guardians: [
          {
            id: 'g2',
            name: 'Renata Santos',
            relationship: 'Mãe',
            cpf: '234.567.890-11',
            phone: '(11) 97766-5544',
            email: 'renata.santos@email.com'
          }
        ],
        minorAuthorization: {
          authorized: true,
          legalText: 'Eu, responsável legal, autorizo o menor a participar das atividades do time TROVOES, treinos, viagens e competições, assumindo responsabilidade por eventuais incidentes.',
          date: '2026-02-01',
          guardianCpf: '234.567.890-11'
        },
        status: 'Aprovado',
        createdAt: new Date().toISOString()
      },
      {
        fullName: 'Enzo Gabriel Oliveira',
        birthDate: '2013-02-18', // Sub 14 (13 years)
        rgCpf: '58.123.456-7',
        address: 'Rua das Flores, 88, SP',
        phone: '(11) 96655-4433',
        position: 'Goleiro',
        dominantFoot: 'Direito',
        height: 168,
        weight: 58,
        injuryHistory: 'Nenhuma',
        previousClub: 'Primeiros Passos FC',
        category: 'Sub 14',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        guardians: [
          {
            id: 'g3',
            name: 'Marcelo Oliveira',
            relationship: 'Pai',
            cpf: '345.678.901-22',
            phone: '(11) 96655-4433',
            email: 'marcelo.oliveira@email.com'
          }
        ],
        minorAuthorization: {
          authorized: true,
          legalText: 'Eu, responsável legal, autorizo o menor a participar das atividades do time TROVOES, treinos, viagens e competições, assumindo responsabilidade por eventuais incidentes.',
          date: '2026-03-05',
          guardianCpf: '345.678.901-22'
        },
        status: 'Aprovado',
        createdAt: new Date().toISOString()
      },
      {
        fullName: 'Guilherme Rocha Lima',
        birthDate: '2007-11-03', // Sub 20 (19 years)
        rgCpf: '39.876.543-2',
        address: 'Rua Augusta, 1200, SP',
        phone: '(11) 95544-3322',
        position: 'Zagueiro',
        dominantFoot: 'Direito',
        height: 186,
        weight: 81,
        injuryHistory: 'Nenhuma lesão recente.',
        previousClub: 'E.C. Santo André Base',
        category: 'Sub 20',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        guardians: [
          {
            id: 'g4',
            name: 'Luciana Rocha',
            relationship: 'Mãe',
            cpf: '456.789.012-33',
            phone: '(11) 95544-3322',
            email: 'luciana.rocha@email.com'
          }
        ],
        minorAuthorization: {
          authorized: true,
          legalText: 'Eu, responsável legal, autorizo o menor a participar das atividades do time TROVOES, treinos, viagens e competições, assumindo responsabilidade por eventuais incidentes.',
          date: '2026-01-15',
          guardianCpf: '456.789.012-33'
        },
        status: 'Aprovado',
        createdAt: new Date().toISOString()
      }
    ];

    const playerIds: string[] = [];
    for (const p of initialPlayers) {
      const pRef = doc(collection(db, 'players'));
      const fullP: Player = { ...p, id: pRef.id };
      await setDoc(pRef, fullP);
      playerIds.push(pRef.id);
    }

    // 3. Initial Training Sessions
    const tr1Ref = doc(collection(db, 'trainings'));
    const tr1: Training = {
      id: tr1Ref.id,
      title: 'Treino Tático & Finalização',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: '15:30',
      locationId: loc1.id,
      locationName: loc1.name,
      category: 'Sub 17',
      notes: 'Foco em transição rápida de jogo e bolas paradas.',
      createdAt: new Date().toISOString()
    };
    await setDoc(tr1Ref, tr1);

    const tr2Ref = doc(collection(db, 'trainings'));
    const tr2: Training = {
      id: tr2Ref.id,
      title: 'Preparação Física e Fundamentos',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '09:00',
      locationId: loc2.id,
      locationName: loc2.name,
      category: 'Sub 15',
      notes: 'Trazer chuteira de trava baixa para grama sintética.',
      createdAt: new Date().toISOString()
    };
    await setDoc(tr2Ref, tr2);

    // 4. Initial Convocatória (Call-up)
    const call1Ref = doc(collection(db, 'callups'));
    const call1: Callup = {
      id: call1Ref.id,
      title: 'Amistoso vs Palmeiras Base',
      type: 'Amistoso',
      eventDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      eventTime: '10:00',
      locationName: 'CT TROVOES Arena',
      category: 'Sub 17',
      opponent: 'S.E. Palmeiras Sub 17',
      selectedPlayerIds: playerIds,
      playerConfirmations: {
        [playerIds[0]]: 'Confirmado',
        [playerIds[1]]: 'Confirmado',
        [playerIds[2]]: 'Pendente'
      },
      notes: 'Apresentação no vestiário principal 1 hora antes do início.',
      createdAt: new Date().toISOString()
    };
    await setDoc(call1Ref, call1);

    // 5. Initial Club Announcement
    const ann1Ref = doc(collection(db, 'announcements'));
    const ann1: Announcement = {
      id: ann1Ref.id,
      title: '⚡ Bem-vindo à Temporada 2026 TROVOES!',
      content: 'Iniciamos os trabalhos da base com estrutura renovada, acompanhamento nutricional e rotina integrada de treinos.',
      category: 'Geral',
      author: 'Comissão Técnica',
      createdAt: new Date().toISOString(),
      important: true
    };
    await setDoc(ann1Ref, ann1);

    console.log('Initial TROVOES data successfully seeded!');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
}
