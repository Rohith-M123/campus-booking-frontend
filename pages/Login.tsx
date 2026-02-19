
import React, { useState } from 'react';
import api from '../src/api/axios';
import { UserRole, User } from '../types';
import { School, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // User select role is actually ignored by backend (role comes from DB), 
  // but we can keep it if we want to default a registration or just hide it.
  // For login, backend determines role. 
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.FACULTY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      });
      const { token, role, user } = response.data; // Expecting backend to return user details now

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store basic user info

      // Construct user object from response or fallback
      // Since backend update is pending, we might need a fallback if 'user' is missing
      const userData: User = user || {
        id: 'temp-id', // Placeholder until backend update
        name: email.split('@')[0],
        email: email,
        role: role as UserRole, // Ensure backend returns matching enum string
        department: 'Unknown'
      };

      onLogin(userData);
    } catch (err: any) {
      console.error('Login failed details:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full glass p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="flex flex-col items-center mb-10">
          <img src="cutm logo.png" alt="Centurion University" className="h-24 w-auto object-contain mb-6" />
          <h2 className="text-3xl font-bold tracking-tight text-center">Centurion University</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Venue Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="email"
                required
                placeholder="University Email"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">Login as:</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: UserRole.ADMIN, label: 'Admin' },
                { role: UserRole.FACULTY, label: 'Faculty' },
                { role: UserRole.COORDINATOR, label: 'Student Co-ordinator' }
              ].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedRole === role
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group transition-all transform active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Need help? <a href="#" className="font-bold text-slate-900 dark:text-white hover:underline">Contact IT Support</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
