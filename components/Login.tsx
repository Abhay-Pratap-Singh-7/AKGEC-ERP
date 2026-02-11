
import React, { useState } from 'react';
import { Student } from '../types';

interface Props {
  onLogin: (student: Student) => void;
}

const API_BASE_URL = 'https://akgec-attendance-api.onrender.com/api';

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identity verification failed.');
      }
      
      onLogin({
        userId: data.user_id,
        accessToken: data.access_token,
        contextId: data.context_id,
        xToken: data.x_token,
        sessionId: data.session_id,
        name: data.user_id
      });
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Server offline' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 mb-6">
            <i className="fa-solid fa-feather-pointed text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Authenticate to synchronize records</p>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 transition-all duration-300">
          {error && (
            <div className="mb-6 p-3 bg-red-950/30 text-red-400 text-xs font-semibold rounded-xl text-center border border-red-900/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-white"
                placeholder="Student ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium text-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-950/40"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          AKGEC Student Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
