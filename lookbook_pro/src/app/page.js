// src/app/page.js
// Main entry point - handles auth state and routing

'use client';

import { useState, useEffect } from 'react';
import { onAuthChange } from '../firebase';
import LandingPage from '../components/LandingPage';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Lookbook Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <>
          <LandingPage onShowAuth={handleShowAuth} />
          {showAuth && (
            <Auth
              onClose={() => setShowAuth(false)}
              initialMode={authMode}
              onSuccess={handleAuthSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}