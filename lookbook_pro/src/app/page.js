'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import LandingPage from '@/components/LandingPage';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.email || 'No user');
      setUser(currentUser);
      setLoading(false);
      
      // If user just logged in, close auth modal
      if (currentUser) {
        setShowAuth(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleShowAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await signOut(auth);
      setUser(null); // ✅ Explicitly clear user state
      setShowAuth(false);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if user is logged in
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Show landing page if not logged in
  return (
    <>
      <LandingPage onShowAuth={handleShowAuth} />
      {showAuth && (
        <Auth 
          onClose={handleCloseAuth} 
          initialMode={authMode}
        />
      )}
    </>
  );
}