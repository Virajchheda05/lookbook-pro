'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Shirt, Compass, BookImage, LogOut, Upload, AlertCircle, Clock, MoreVertical } from 'lucide-react';
import { db, storage } from '@/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import TryOn from './TryOn';
import Closet from './Closet';
import Globetrotter from './Globetrotter';
import Lookbook from './Lookbook';
import URLScraper from './URLScraper';

export default function Dashboard({ user, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ tryons: 0, closet: 0, lookbook: 0, avgScore: 0 });
  const [recentTryons, setRecentTryons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [uploadingBase, setUploadingBase] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStats();
    loadRecentTryons();
  }, [user]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const tryonsQuery = query(collection(db, 'vto_sessions'), where('userId', '==', user.uid));
      const tryonsSnapshot = await getDocs(tryonsQuery);
      const tryonsData = tryonsSnapshot.docs.map(doc => doc.data());
      
      const closetQuery = query(collection(db, 'closet_items'), where('userId', '==', user.uid));
      const closetSnapshot = await getDocs(closetQuery);
      
      const lookbookQuery = query(collection(db, 'lookbook_entries'), where('userId', '==', user.uid));
      const lookbookSnapshot = await getDocs(lookbookQuery);
      
      const avgScore = tryonsData.length > 0
        ? Math.round(tryonsData.reduce((sum, item) => sum + (item.visScore || 0), 0) / tryonsData.length)
        : 0;
      
      setStats({
        tryons: tryonsData.length,
        closet: closetSnapshot.size,
        lookbook: lookbookSnapshot.size,
        avgScore
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentTryons = async () => {
    try {
      const q = query(
        collection(db, 'vto_sessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const tryons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("MY KEY CHECK:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
      setRecentTryons(tryons);
    } catch (error) {
      console.error('Error loading recent try-ons:', error);
    }
  };

  const handleBasePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingBase(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/base-photo.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
        basePhotoUrl: downloadURL,
      });

      setUserData({ ...userData, basePhotoUrl: downloadURL });
      alert('Base photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading base photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingBase(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-tryon rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Render active module
  if (currentView === 'tryon') {
    return <TryOn user={user} onBack={() => { setCurrentView('dashboard'); loadStats(); loadRecentTryons(); }} />;
  }

  if (currentView === 'closet') {
    return <Closet user={user} onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
  }

  if (currentView === 'globetrotter') {
    return <Globetrotter user={user} userData={userData} onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
  }

  if (currentView === 'lookbook') {
  return <Lookbook user={user} onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
}

if (currentView === 'url-scraper') {
  return <URLScraper user={user} onBack={() => setCurrentView('dashboard')} />;
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tryon rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Lookbook Pro</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ease-smooth"
            >
              {userData?.profilePhotoUrl ? (
                <img
                  src={userData.profilePhotoUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"></div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-900">
                {userData?.displayName || 'User'}
              </span>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <label className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ease-smooth">
                  <Upload className="w-4 h-4" />
                  Upload Base Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBasePhotoUpload}
                    className="hidden"
                    disabled={uploadingBase}
                  />
                </label>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 ease-smooth"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-gray-600">Here's an overview of your activity</p>
        </div>

        {/* Base Photo Alert */}
        {!userData?.basePhotoUrl && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Upload Your Base Photo</h3>
              <p className="text-yellow-800 text-sm mb-4">
                To use virtual try-on, please upload a clear photo of yourself.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-700 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-yellow-800 ease-smooth">
                <Upload className="w-4 h-4" />
                {uploadingBase ? 'Uploading...' : 'Upload Base Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBasePhotoUpload}
                  className="hidden"
                  disabled={uploadingBase}
                />
              </label>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Try-Ons', value: stats.tryons, icon: Sparkles, color: 'tryon' },
            { label: 'Closet Items', value: stats.closet, icon: Shirt, color: 'closet' },
            { label: 'Saved Looks', value: stats.lookbook, icon: BookImage, color: 'lookbook' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: Compass, color: 'globe' },
          ].map((stat, i) => (
            <div key={i} className="card ease-smooth">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-opacity-10 bg-${stat.color}`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Creations */}
        {recentTryons.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-gray-700" />
              <h3 className="text-xl font-bold text-gray-900">Recent Try-Ons</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentTryons.map((tryon) => (
                <div key={tryon.id} className="card overflow-hidden ease-smooth">
                  <div className="aspect-square bg-gray-100 mb-4 rounded-lg overflow-hidden">
                    {tryon.generatedImageUrl && (
                      <img
                        src={tryon.generatedImageUrl}
                        alt="Try-on result"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <span className="font-bold text-tryon">{tryon.visScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Sparkles, label: 'Try-On', view: 'tryon' },
              { icon: Shirt, label: 'Closet', view: 'closet' },
              { icon: Compass, label: 'Globetrotter', view: 'globetrotter' },
              { icon: BookImage, label: 'Lookbook', view: 'lookbook' },
              { icon: Upload, label: 'URL Scraper', view: 'url-scraper' },
            ].map((module) => (
              <button
                key={module.view}
                onClick={() => setCurrentView(module.view)}
                className="card cursor-pointer ease-smooth hover:bg-gray-100 flex flex-col items-center justify-center gap-3 py-8"
              >
                <module.icon className="w-6 h-6 text-tryon" />
                <span className="font-medium text-gray-900 text-center">{module.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
