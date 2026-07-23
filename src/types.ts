export type UserRole = 'admin' | 'tecnico' | 'jogador' | 'responsavel';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  linkedPlayerIds?: string[];
  createdAt?: string;
}

export type Category = 'Sub 14' | 'Sub 15' | 'Sub 17' | 'Sub 20';

export type Position = 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-Campista' | 'Atacante' | 'Ponta';

export type DominantFoot = 'Direito' | 'Esquerdo' | 'Ambidestro';

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  cpf: string;
  phone: string;
  email: string;
}

export interface MinorAuthorization {
  authorized: boolean;
  legalText: string;
  signatureDataUrl?: string;
  date: string;
  guardianCpf: string;
}

export type RegistrationStatus = 'Pendente' | 'Aprovado' | 'Recusado';

export interface Player {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  rgCpf: string;
  address: string;
  phone: string;
  position: Position;
  dominantFoot: DominantFoot;
  height: number; // in cm
  weight: number; // in kg
  injuryHistory: string;
  previousClub: string;
  category: Category;
  photoUrl: string;
  docPhotoUrl?: string;
  proofAddressUrl?: string;
  guardians: Guardian[];
  minorAuthorization: MinorAuthorization;
  status: RegistrationStatus;
  userId?: string; // Linked user account UID
  createdAt: string;
}

export interface Training {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  locationId: string;
  locationName: string;
  category: Category | 'Todas';
  notes: string;
  createdAt: string;
}

export type AttendanceStatus = 'Presente' | 'Ausente' | 'Justificado' | 'Atrasado';

export interface AttendanceRecord {
  id: string; // trainingId_playerId
  trainingId: string;
  playerId: string;
  playerName: string;
  category: Category;
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
}

export interface TrainingLocation {
  id: string;
  name: string;
  address: string;
  mapUrl?: string;
  pitchType: 'Grama Natural' | 'Grama Sintética' | 'Society' | 'Quadra';
  lighting: boolean;
  notes: string;
}

export type EventType = 'Jogo Oficial' | 'Amistoso' | 'Treino Especial' | 'Torneio';

export type ConfirmationStatus = 'Pendente' | 'Confirmado' | 'Ausente';

export interface Callup {
  id: string;
  title: string;
  type: EventType;
  eventDate: string;
  eventTime: string;
  locationName: string;
  category: Category;
  opponent?: string;
  selectedPlayerIds: string[];
  playerConfirmations: Record<string, ConfirmationStatus>;
  notes: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: Category | 'Geral';
  author: string;
  createdAt: string;
  important?: boolean;
}
