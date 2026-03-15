'use client';
import { useState, useEffect } from 'react';
import { Camera, Shirt, Compass, BookImage, LogOut, User, Upload, AlertCircle, Sparkles, TrendingUp, Clock, Star, Award, Zap, Heart, ShoppingBag } from 'lucide-react';
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
  const [uploadingProfile, setUploadingProfile] = useState(false);

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

  const handleProfilePhotoUpload = async (e) => {
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

    setUploadingProfile(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/profile-photo.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
        profilePhotoUrl: downloadURL,
      });

      setUserData({ ...userData, profilePhotoUrl: downloadURL });
      alert('Profile photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="relative text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading Dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-1/3 w-80 h-80 bg-pink-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-110">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lookbook Pro
                </span>
                <p className="text-xs text-gray-600">AI Fashion Studio</p>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 hover:bg-purple-100/50 rounded-xl p-2 transition-all duration-300 group transform hover:scale-105"
              >
                {userData?.profilePhotoUrl ? (
                  <img
                    src={userData.profilePhotoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 group-hover:border-purple-500 transition-colors shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center group-hover:shadow-lg transition-all">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-gray-900">{userData?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">Account</p>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-slide-down z-50 backdrop-blur-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{userData?.displayName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100">
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Camera className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {uploadingProfile ? 'Uploading...' : 'Change Profile Photo'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        className="hidden"
                        disabled={uploadingProfile}
                      />
                    </label>
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100">
                    <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {uploadingBase ? 'Uploading...' : 'Upload Base Photo'}
                        </p>
                        <p className="text-xs text-gray-500">For virtual try-on</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBasePhotoUpload}
                        className="hidden"
                        disabled={uploadingBase}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Welcome Message */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Welcome back, <span className="text-gradient-primary">{userData?.displayName?.split(' ')[0] || 'User'}!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Ready to discover your perfect style? Start creating amazing looks with our AI-powered tools.
          </p>
        </div>

        {/* Base Photo Alert */}
        {!userData?.basePhotoUrl && (
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-6 flex items-start space-x-4 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Upload Your Base Photo
              </h3>
              <p className="text-orange-700 mb-4">
                To use virtual try-on, please upload a clear photo of yourself. This will be used to generate try-on images.
              </p>
              <label className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg cursor-pointer hover:from-orange-700 hover:to-red-700 transition-all shadow-lg">
                <Upload className="w-5 h-5" />
                <span>{uploadingBase ? 'Uploading...' : 'Upload Now'}</span>
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

        {/* Stats Section */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          <div className="card-premium-elevated group bg-gradient-to-br from-purple-50/50 to-white hover:from-purple-100/50 hover:to-white hover:shadow-xl hover:shadow-purple-500/10 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all transform group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500 group-hover:animate-bounce" />
              </div>
              <p className="text-gray-600 text-sm mb-2 font-medium">Try-Ons Generated</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.tryons}
              </p>
            </div>
          </div>

          <div className="card-premium-elevated group bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-100/50 hover:to-white hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all transform group-hover:scale-110">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <Heart className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
              </div>
              <p className="text-gray-600 text-sm mb-2 font-medium">Closet Items</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stats.closet}
              </p>
            </div>
          </div>

          <div className="card-premium-elevated group bg-gradient-to-br from-orange-50/50 to-white hover:from-orange-100/50 hover:to-white hover:shadow-xl hover:shadow-orange-500/10 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all transform group-hover:scale-110">
                  <BookImage className="w-6 h-6 text-white" />
                </div>
                <Star className="w-5 h-5 text-yellow-500 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
              </div>
              <p className="text-gray-600 text-sm mb-2 font-medium">Looks Saved</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                {stats.lookbook}
              </p>
            </div>
          </div>

          <div className="card-premium-elevated group bg-gradient-to-br from-green-50/50 to-white hover:from-green-100/50 hover:to-white hover:shadow-xl hover:shadow-green-500/10 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all transform group-hover:scale-110">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-5 h-5 text-purple-500 group-hover:animate-bounce" />
              </div>
              <p className="text-gray-600 text-sm mb-2 font-medium">Avg Quality Score</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.avgScore}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Try-Ons Section */}
        {recentTryons.length > 0 && (
          <div className="mb-12 relative z-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Recent Try-Ons</h2>
                <p className="text-gray-600">Your latest creations</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {recentTryons.map((tryon, index) => (
                <div key={tryon.id} className="card-premium-elevated overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={tryon.generatedImageUrl}
                      alt="Try-on"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-semibold bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block">Generated</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">VIS Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{tryon.visScore}</span>
                        <span className="text-gray-500">/100</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all" style={{ width: `${tryon.visScore}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12 relative z-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentView('tryon')}
              className="card-premium-elevated group text-left hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 bg-gradient-to-br from-purple-50/50 to-white hover:from-purple-100/50"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all transform group-hover:scale-110">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Quick Try-On</h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Start a new virtual try-on session</p>
              <div className="mt-4 flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-sm font-semibold">Get Started</span>
                <Zap className="w-4 h-4 ml-2" />
              </div>
            </button>

            <button
              onClick={() => setCurrentView('closet')}
              className="card-premium-elevated group text-left hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-100/50"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all transform group-hover:scale-110">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Add to Closet</h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Upload new clothing items</p>
              <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-sm font-semibold">Upload Items</span>
                <ShoppingBag className="w-4 h-4 ml-2" />
              </div>
            </button>

            <button
              onClick={() => setCurrentView('globetrotter')}
              className="card-premium-elevated group text-left hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 bg-gradient-to-br from-green-50/50 to-white hover:from-green-100/50"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all transform group-hover:scale-110">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Globetrotter</h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Try outfits in new locations</p>
              <div className="mt-4 flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <span className="text-sm font-semibold">Explore</span>
                <Compass className="w-4 h-4 ml-2" />
              </div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-12 relative z-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => setCurrentView('tryon')}
              className="card-premium-elevated group bg-gradient-to-br from-purple-50/50 to-white hover:from-purple-100/50 hover:to-white hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 text-center cursor-pointer animate-slide-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all transform group-hover:scale-110">
                <Sparkles className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Try New Items</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">AI-powered virtual try-on with realistic results</p>
              <div className="mt-6 flex items-center justify-center text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold">Explore</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div
              onClick={() => setCurrentView('closet')}
              className="card-premium-elevated group bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-100/50 hover:to-white hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 text-center cursor-pointer animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all transform group-hover:scale-110">
                <Shirt className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">My Closet</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Manage your digital wardrobe and build outfits</p>
              <div className="mt-6 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold">Manage</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div
              onClick={() => setCurrentView('globetrotter')}
              className="card-premium-elevated group bg-gradient-to-br from-green-50/50 to-white hover:from-green-100/50 hover:to-white hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 text-center cursor-pointer animate-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all transform group-hover:scale-110">
                <Compass className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Globetrotter</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">Try outfits in different destinations</p>
              <div className="mt-6 flex items-center justify-center text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold">Travel</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            <div
              onClick={() => setCurrentView('lookbook')}
              className="card-premium-elevated group bg-gradient-to-br from-orange-50/50 to-white hover:from-orange-100/50 hover:to-white hover:shadow-2xl hover:shadow-orange-500/20 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 p-8 text-center cursor-pointer animate-slide-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all transform group-hover:scale-110">
                <BookImage className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Lookbook</h3>
              <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">View and manage your saved looks</p>
              <div className="mt-6 flex items-center justify-center text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-sm font-semibold">Browse</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Style Tip */}
        <div className="card-premium-elevated bg-gradient-to-br from-purple-50/50 to-white hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 p-8 relative z-10 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition-all">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Style Tip</h2>
              <p className="text-sm text-gray-600">Personalized recommendations</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50">
            <p className="text-gray-800 leading-relaxed text-lg">
              <span className="text-2xl">💡</span> <strong className="text-purple-900">Mix textures:</strong> <span className="text-gray-700">Combine different fabrics like denim with silk or cotton with leather to create visual interest in your outfits.</span>
              {stats.closet > 0 ? ' <span className="text-purple-600 font-semibold">Start with a piece from your closet and build around it!</span>' : ' <span className="text-purple-600 font-semibold">Upload items to your closet to get started!</span>'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
