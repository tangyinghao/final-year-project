import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Verify admin role
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const data = snap.data();
      if (!data || data.role !== 'admin') {
        await auth.signOut();
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      // onAuthStateChanged in App.tsx handles the rest
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
        setError('Invalid email or password.');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#e5e5ea] overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold text-[#1b1c62] mb-2">MSCircle</h1>
            <p className="text-[#8e8e93]">Admin Portal Login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="admin@test.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b1c62] hover:bg-opacity-90 text-white font-medium py-3 rounded-full transition-colors mt-8 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
