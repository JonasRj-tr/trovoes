import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  seedInitialDataIfNeeded 
} from './lib/firebase';
import { UserProfile, Player, Training, TrainingLocation, Callup, Announcement } from './types';
import { TabType, BottomNav } from './components/BottomNav';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Views & Modals
import { LoginOnboarding } from './views/LoginOnboarding';
import { DashboardHome } from './views/DashboardHome';
import { RosterView } from './views/RosterView';
import { AttendanceView } from './views/AttendanceView';
import { LocationsView } from './views/LocationsView';
import { CallupsView } from './views/CallupsView';
import { AdminView } from './views/AdminView';
import { AthleteRegistrationModal } from './views/AthleteRegistrationModal';
import { PlayerProfileModal } from './views/PlayerProfileModal';
import { PWAInstallModal } from './components/PWAInstallModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Realtime Firestore State
  const [players, setPlayers] = useState<Player[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [locations, setLocations] = useState<TrainingLocation[]>([]);
  const [callups, setCallups] = useState<Callup[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modals State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState<Player | null>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Seed initial data if Firestore collections are empty
    seedInitialDataIfNeeded();

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            setCurrentUser(userSnap.data() as UserProfile);
          } else {
            const isAdmin = user.email === 'admin@x.com';
            const newProf: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: isAdmin ? 'Administrador TROVOES' : user.displayName || user.email?.split('@')[0] || 'Usuário',
              role: isAdmin ? 'admin' : 'jogador',
              createdAt: new Date().toISOString()
            };
            setCurrentUser(newProf);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsubscribeAuth();
    };
  }, []);

  // Realtime Listeners for Firestore Collections
  useEffect(() => {
    // 1. Players
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Player);
      setPlayers(list);
    });

    // 2. Trainings
    const unsubTrainings = onSnapshot(collection(db, 'trainings'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Training);
      setTrainings(list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });

    // 3. Locations
    const unsubLocations = onSnapshot(collection(db, 'locations'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }) as TrainingLocation);
      setLocations(list);
    });

    // 4. Callups
    const unsubCallups = onSnapshot(collection(db, 'callups'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Callup);
      setCallups(list);
    });

    // 5. Announcements
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Announcement);
      setAnnouncements(list);
    });

    return () => {
      unsubPlayers();
      unsubTrainings();
      unsubLocations();
      unsubCallups();
      unsubAnnouncements();
    };
  }, []);

  const handleInstallPwa = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050C16] flex flex-col items-center justify-center text-white space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin"></div>
          <img src="https://i.imgur.com/BQI5VnK.jpeg" alt="TROVOES" className="w-10 h-10 rounded-full absolute inset-0 m-auto object-cover" />
        </div>
        <p className="text-xs font-bold tracking-widest text-[#FFCC00] uppercase font-syne">Carregando TROVOES...</p>
      </div>
    );
  }

  // If user is not logged in, show Login / Onboarding screen
  if (!currentUser) {
    return (
      <>
        <LoginOnboarding
          onLoginSuccess={(u) => setCurrentUser(u)}
          onOpenRegisterAthlete={() => setShowRegisterModal(true)}
        />

        <AthleteRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(player) => {
            if (!currentUser) {
              const newProf: UserProfile = {
                uid: player?.id || 'player_' + Date.now(),
                email: player?.fullName ? `${player.fullName.toLowerCase().replace(/\s+/g, '.')}@trovoes.com` : 'atleta@trovoes.com',
                name: player?.fullName || 'Atleta TROVOES',
                role: 'jogador',
                createdAt: new Date().toISOString()
              };
              setCurrentUser(newProf);
            }
          }}
        />

        <PWAInstallModal
          deferredPrompt={deferredPrompt}
          onInstallNative={handleInstallPwa}
        />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#050C16] text-slate-100 flex flex-col selection:bg-[#FFCC00] selection:text-[#0A2540]">
      
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => {
          // Open athlete profile if player is linked, or roster
          const myPlayer = players.find(p => p.fullName.toLowerCase() === currentUser.name.toLowerCase());
          if (myPlayer) setSelectedPlayerForProfile(myPlayer);
          else setActiveTab('roster');
        }}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
        announcementsCount={announcements.length}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex pb-20 sm:pb-8">
        
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={currentUser}
          onOpenNewAthleteModal={() => setShowRegisterModal(true)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
          {activeTab === 'home' && (
            <DashboardHome
              user={currentUser}
              players={players}
              trainings={trainings}
              callups={callups}
              announcements={announcements}
              onNavigate={setActiveTab}
              onOpenNewAthleteModal={() => setShowRegisterModal(true)}
              onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
            />
          )}

          {activeTab === 'roster' && (
            <RosterView
              players={players}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenNewAthleteModal={() => setShowRegisterModal(true)}
              onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'trainings' && (
            <AttendanceView
              trainings={trainings}
              players={players}
              locations={locations}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsView
              locations={locations}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'callups' && (
            <CallupsView
              callups={callups}
              players={players}
              user={currentUser}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              players={players}
              announcements={announcements}
              onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
            />
          )}
        </main>

      </div>

      {/* Mobile PWA Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        callupsBadgeCount={callups.length}
      />

      {/* Athlete Registration Modal */}
      <AthleteRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        isAdminAutoApprove={isAdmin}
      />

      {/* Athlete Passport Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayerForProfile}
        onClose={() => setSelectedPlayerForProfile(null)}
        isAdmin={isAdmin}
      />

      {/* Auto PWA Install Modal */}
      <PWAInstallModal
        deferredPrompt={deferredPrompt}
        onInstallNative={handleInstallPwa}
      />

    </div>
  );
}
