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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Lookbook Pro
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-xl p-2 transition-colors"
              >
                {userData?.profilePhotoUrl ? (
                  <img
                    src={userData.profilePhotoUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-gray-900">{userData?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-fade-in z-50">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to discover your perfect style?
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
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Try-Ons Generated</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.tryons}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Shirt className="w-8 h-8 text-blue-600" />
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Closet Items</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.closet}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <BookImage className="w-8 h-8 text-orange-600" />
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Looks Saved</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.lookbook}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Avg Quality Score</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.avgScore}
            </p>
          </div>
        </div>

        {/* Recent Try-Ons Section */}
        {recentTryons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Try-Ons</h2>
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentTryons.map((tryon) => (
                <div key={tryon.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={tryon.generatedImageUrl}
                      alt="Try-on"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">VIS Score</span>
                      <span className="text-lg font-bold text-purple-600">{tryon.visScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('tryon')}
              className="bg-white rounded-2xl p-6 text-left hover:shadow-xl transition-all hover:scale-105 shadow-lg"
            >
              <Zap className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Try-On</h3>
              <p className="text-sm text-gray-600">Start a new virtual try-on session</p>
            </button>

            <button
              onClick={() => setCurrentView('closet')}
              className="bg-white rounded-2xl p-6 text-left hover:shadow-xl transition-all hover:scale-105 shadow-lg"
            >
              <ShoppingBag className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Add to Closet</h3>
              <p className="text-sm text-gray-600">Upload new clothing items</p>
            </button>

            <button
              onClick={() => setCurrentView('globetrotter')}
              className="bg-white rounded-2xl p-6 text-left hover:shadow-xl transition-all hover:scale-105 shadow-lg"
            >
              <Compass className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Globetrotter</h3>
              <p className="text-sm text-gray-600">Try outfits in new locations</p>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => setCurrentView('tryon')}
              className="bg-white rounded-2xl p-8 text-center relative cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2 border-transparent hover:border-purple-500"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Try New Items</h3>
              <p className="text-gray-600 text-sm">AI-powered virtual try-on with realistic results</p>
            </div>

            <div
              onClick={() => setCurrentView('closet')}
              className="bg-white rounded-2xl p-8 text-center relative cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                <Shirt className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">My Closet</h3>
              <p className="text-gray-600 text-sm">Manage your digital wardrobe and build outfits</p>
            </div>

            <div
              onClick={() => setCurrentView('globetrotter')}
              className="bg-white rounded-2xl p-8 text-center relative cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2 border-transparent hover:border-green-500"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                <Compass className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Globetrotter</h3>
              <p className="text-gray-600 text-sm">Try outfits in different destinations</p>
            </div>

            <div
            onClick={() => setCurrentView('lookbook')}
            className="bg-white rounded-2xl p-8 text-center relative cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg border-2 border-transparent hover:border-orange-500"
            >
            {/* Remove the "Coming Soon" badge */}
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                <BookImage className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lookbook</h3>
            <p className="text-gray-600 text-sm">View and manage your saved looks</p>
            </div>
          </div>
        </div>

        {/* Style Tip */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Style Tip</h2>
              <p className="text-sm text-gray-600">Personalized for you</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <p className="text-gray-800 leading-relaxed">
              💡 <strong>Mix textures:</strong> Combine different fabrics like denim with silk or cotton with leather to create visual interest in your outfits. 
              {stats.closet > 0 ? ' Start with a piece from your closet and build around it!' : ' Upload items to your closet to get started!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}