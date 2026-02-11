
import React, { useState } from 'react';
import { Student } from '../types';

interface Props {
  onLogin: (student: Student) => void;
}

const API_BASE_URL = 'http://127.0.0.1:5000/api';

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcfcfd]">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-6">
            <i className="fa-solid fa-feather-pointed text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Authenticate to synchronize records</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none text-sm font-medium"
                placeholder="Student ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all outline-none text-sm font-medium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-gray-200"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
          AKGEC Student Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
