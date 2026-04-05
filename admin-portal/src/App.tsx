import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Review } from './pages/Review';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { CreateEventModal } from './components/CreateEventModal';

type Tab = 'Dashboard' | 'Review' | 'Reports' | 'Users';

function App() {
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [initialSelectedId, setInitialSelectedId] = useState<string | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleNavigate = (tab: Tab, selectedId?: string) => {
    setInitialSelectedId(selectedId ?? null);
    setActiveTab(tab);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify admin role from Firestore
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.data();
        if (data?.role === 'admin') {
          setAdminUid(user.uid);
        } else {
          await signOut(auth);
          setAdminUid(null);
        }
      } else {
        setAdminUid(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setAdminUid(null);
    setActiveTab('Dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <div className="text-[#8e8e93] text-lg">Loading...</div>
      </div>
    );
  }

  if (!adminUid) {
    return <Login />;
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onCreateEvent={() => setShowCreateEvent(true)}
      >
        <div className={activeTab === 'Dashboard' ? 'flex flex-col h-full' : 'hidden'}>
          <Dashboard onNavigate={handleNavigate} />
        </div>
        <div className={activeTab === 'Review' ? 'flex flex-col h-full' : 'hidden'}>
          <Review initialSelectedId={initialSelectedId} />
        </div>
        <div className={activeTab === 'Reports' ? 'flex flex-col h-full' : 'hidden'}>
          <Reports initialSelectedId={initialSelectedId} />
        </div>
        <div className={activeTab === 'Users' ? 'flex flex-col h-full' : 'hidden'}>
          <Users />
        </div>
      </Layout>
      {showCreateEvent && (
        <CreateEventModal onClose={() => setShowCreateEvent(false)} />
      )}
    </>
  );
}

export default App;
