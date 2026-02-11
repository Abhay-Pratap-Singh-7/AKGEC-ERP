
import React, { useState, useEffect } from 'react';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import { Student } from './types.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const contextId = localStorage.getItem('context_id');
    const xToken = localStorage.getItem('x_token');
    const sessionId = localStorage.getItem('session_id');

    if (accessToken && userId && contextId && xToken && sessionId) {
      setUser({
        accessToken,
        userId,
        contextId,
        xToken,
        sessionId
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = (student: Student) => {
    localStorage.setItem('access_token', student.accessToken);
    localStorage.setItem('user_id', student.userId);
    localStorage.setItem('context_id', student.contextId);
    localStorage.setItem('x_token', student.xToken);
    localStorage.setItem('session_id', student.sessionId);
    setUser(student);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
