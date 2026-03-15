'use client';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  ArrowLeft, 
  BookImage, 
  Filter, 
  Search,
  Grid3x3,
  List,
  Award,
  Sparkles,
  Globe,
  LinkIcon,
  Heart,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  TrendingUp,
  ImageIcon,
  Tag,
  ShoppingBag,
  DollarSign,
  Loader2,
  Eye,
  X,
  MapPin,
  Check
} from 'lucide-react';

export default function Lookbook({ user, onBack }) {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    minScore: 0,
    searchTerm: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    vto: 0,
    globetrotter: 0,
    urls: 0,
    avgScore: 0,
    favorites: 0
  });

  useEffect(() => {
    loadEntries();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [entries, filters, activeTab]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // Load VTO sessions
      const vtoQuery = query(
        collection(db, 'vto_sessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const vtoSnapshot = await getDocs(vtoQuery);
      const vtoEntries = vtoSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'vto',
        collectionName: 'vto_sessions',
        ...doc.data()
      }));

      // Load Globetrotter sessions
      const globeQuery = query(
        collection(db, 'globetrotter_sessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const globeSnapshot = await getDocs(globeQuery);
      const globeEntries = globeSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'globetrotter',
        collectionName: 'globetrotter_sessions',
        ...doc.data()
      }));

      const allEntries = [...vtoEntries, ...globeEntries];
      setEntries(allEntries);

      // Calculate stats
      const vtoCount = vtoEntries.length;
      const globeCount = globeEntries.length;
      const urlCount = vtoEntries.filter(e => e.isFromUrl).length;
      const favCount = allEntries.filter(e => e.isFavorite).length;
      
      const scores = allEntries.map(e => e.visScore || e.bisScore || 0).filter(s => s > 0);
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;

      setStats({
        total: allEntries.length,
        vto: vtoCount,
        globetrotter: globeCount,
        urls: urlCount,
        avgScore,
        favorites: favCount
      });
    } catch (error) {
      console.error('Error loading lookbook:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Tab filter
    switch (activeTab) {
      case 'vto':
        filtered = filtered.filter(e => e.type === 'vto');
        break;
      case 'globetrotter':
        filtered = filtered.filter(e => e.type === 'globetrotter');
        break;
      case 'urls':
        filtered = filtered.filter(e => e.isFromUrl === true);
        break;
      case 'favorites':
        filtered = filtered.filter(e => e.isFavorite);
        break;
    }

    // Score filter
    filtered = filtered.filter(e => {
      const score = e.visScore || e.bisScore || 0;
      return score >= filters.minScore;
    });

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(e => {
        const title = e.productTitle?.toLowerCase() || '';
        const brand = e.productBrand?.toLowerCase() || '';
        const url = e.productUrl?.toLowerCase() || '';
        const location = e.destinationName?.toLowerCase() || '';
        return title.includes(term) || brand.includes(term) || url.includes(term) || location.includes(term);
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'highest-score':
        filtered.sort((a, b) => {
          const scoreA = a.visScore || a.bisScore || 0;
          const scoreB = b.visScore || b.bisScore || 0;
          return scoreB - scoreA;
        });
        break;
      case 'lowest-score':
        filtered.sort((a, b) => {
          const scoreA = a.visScore || a.bisScore || 0;
          const scoreB = b.visScore || b.bisScore || 0;
          return scoreA - scoreB;
        });
        break;
    }

    setFilteredEntries(filtered);
  };

  const toggleFavorite = async (entry) => {
    try {
      const newFavoriteStatus = !entry.isFavorite;

      await updateDoc(doc(db, entry.collectionName, entry.id), {
        isFavorite: newFavoriteStatus
      });

      setEntries(entries.map(e => 
        e.id === entry.id 
          ? { ...e, isFavorite: newFavoriteStatus }
          : e
      ));

      if (selectedEntry?.id === entry.id) {
        setSelectedEntry({ ...selectedEntry, isFavorite: newFavoriteStatus });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async (entryId, collectionName) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteDoc(doc(db, collectionName, entryId));
      setEntries(entries.filter(e => e.id !== entryId));
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date not available';
    
    try {
      if (dateValue.toDate) {
        return dateValue.toDate().toLocaleDateString();
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Date not available';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-orange-700 font-semibold">Loading your lookbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <BookImage className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    My Lookbook
                  </h1>
                  <p className="text-sm text-gray-600">{stats.total} items saved</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Total Items</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {stats.total}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Try-Ons</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {stats.vto}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Travels</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {stats.globetrotter}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3">
              <LinkIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">From URLs</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.urls}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1 font-medium">Avg Score</p>
            <p className="text-4xl font-bold">
              {stats.avgScore}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookImage className="w-5 h-5" />
              <span>All Looks</span>
              <span className="text-xs opacity-75">({stats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('vto')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'vto'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Try-Ons</span>
              <span className="text-xs opacity-75">({stats.vto})</span>
            </button>

            <button
              onClick={() => setActiveTab('globetrotter')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'globetrotter'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span>Travels</span>
              <span className="text-xs opacity-75">({stats.globetrotter})</span>
            </button>

            <button
              onClick={() => setActiveTab('urls')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'urls'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span>From URLs</span>
              <span className="text-xs opacity-75">({stats.urls})</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Favorites</span>
              <span className="text-xs opacity-75">({stats.favorites})</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    placeholder="Product, brand, location..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Score: {filters.minScore}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest-score">Highest Score</option>
                  <option value="lowest-score">Lowest Score</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ minScore: 0, searchTerm: '', sortBy: 'newest' })}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Gallery */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <BookImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'favorites' ? 'No favorites yet' : activeTab === 'urls' ? 'No URL-sourced items yet' : 'Your lookbook is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {entries.length === 0 
                ? "Start creating virtual try-ons and globetrotter shots to build your collection!"
                : activeTab === 'favorites'
                ? "Tap the heart icon on any look to add it to your favorites!"
                : activeTab === 'urls'
                ? "Use the URL scraper in Virtual Try-On to add items from product links!"
                : "No items match your current filters. Try adjusting them."}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          // ✅ GRID VIEW
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEntries.map((entry) => {
              const score = entry.visScore || entry.bisScore || 0;
              const imageUrl = entry.generatedImageUrl;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] relative bg-gray-100">
                    <img
                      src={imageUrl}
                      alt="Lookbook entry"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedEntry(entry)}
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(entry);
                      }}
                      className="absolute top-2 right-2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          entry.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* URL Badge */}
                    {entry.isFromUrl && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center space-x-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>URL</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {entry.type === 'vto' ? <Sparkles className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          <span className="font-semibold text-gray-700">
                            {entry.type === 'vto' ? 'Try-On' : 'Travel'}
                          </span>
                        </div>
                      </div>
                      {score > 0 && (
                        <div className={`text-xs px-2 py-1 rounded-full font-bold border ${getScoreColor(score)}`}>
                          {score}
                        </div>
                      )}
                    </div>

                    {/* Product Info for URL Items */}
                    {entry.isFromUrl && (
                      <div className="mb-2">
                        {entry.productTitle && (
                          <p className="text-xs text-gray-700 font-medium truncate">{entry.productTitle}</p>
                        )}
                        {entry.productBrand && (
                          <p className="text-xs text-gray-500 truncate">{entry.productBrand}</p>
                        )}
                        {entry.productPrice && (
                          <p className="text-xs text-green-600 font-semibold">{entry.productPrice}</p>
                        )}
                      </div>
                    )}

                    {/* Globetrotter Location */}
                    {entry.type === 'globetrotter' && entry.destinationLocation && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{entry.destinationLocation}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                        }}
                        className="text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // ✅ LIST VIEW
          <div className="space-y-4">
            {filteredEntries.map((entry) => {
              const score = entry.visScore || entry.bisScore || 0;
              const imageUrl = entry.generatedImageUrl;
              
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-64 h-64 md:h-auto relative bg-gray-100 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt="Lookbook entry"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedEntry(entry)}
                      />
                      
                      {/* URL Badge */}
                      {entry.isFromUrl && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center space-x-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>URL</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                              {entry.type === 'vto' ? <Sparkles className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                              <span className="font-semibold text-gray-700 text-sm">
                                {entry.type === 'vto' ? 'Virtual Try-On' : 'Globetrotter'}
                              </span>
                            </div>
                            {score > 0 && (
                              <div className={`px-3 py-1 rounded-full font-bold text-sm border ${getScoreColor(score)}`}>
                                Score: {score}
                              </div>
                            )}
                          </div>

                          {/* Product Info for URL Items */}
                          {entry.isFromUrl && (
                            <div className="mb-3">
                              {entry.productTitle && (
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{entry.productTitle}</h3>
                              )}
                              <div className="flex items-center space-x-4 text-sm">
                                {entry.productBrand && (
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <Tag className="w-4 h-4" />
                                    <span>{entry.productBrand}</span>
                                  </div>
                                )}
                                {entry.productPrice && (
                                  <div className="flex items-center space-x-1 text-green-600 font-semibold">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{entry.productPrice}</span>
                                  </div>
                                )}
                              </div>
                              {entry.productUrl && (
                                
                                 <a href={entry.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>View Original Product</span>
                                </a>
                              )}
                            </div>
                          )}

                          {/* Globetrotter Location */}
                          {entry.type === 'globetrotter' && entry.destinationLocation && (
                            <div className="flex items-center space-x-2 text-gray-600 mb-3">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{entry.destinationLocation}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(entry.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(entry)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Heart
                              className={`w-6 h-6 ${
                                entry.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      {(entry.visBreakdown || entry.bisBreakdown) && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                          {entry.visBreakdown ? (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Shadow</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full" 
                                      style={{ width: `${(entry.visBreakdown.shadow / 40) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.visBreakdown.shadow}/40</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Drape</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full" 
                                      style={{ width: `${(entry.visBreakdown.drape / 30) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.visBreakdown.drape}/30</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Seam</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                                      style={{ width: `${(entry.visBreakdown.seam / 30) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.visBreakdown.seam}/30</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Lighting</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full" 
                                      style={{ width: `${(entry.bisBreakdown.lighting / 40) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.bisBreakdown.lighting}/40</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Perspective</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full" 
                                      style={{ width: `${(entry.bisBreakdown.perspective / 30) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.bisBreakdown.perspective}/30</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Shadow</p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full" 
                                      style={{ width: `${(entry.bisBreakdown.shadow / 30) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-700">{entry.bisBreakdown.shadow}/30</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedEntry.type === 'vto' ? <Sparkles className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  <span className="font-semibold text-gray-700">
                    {selectedEntry.type === 'vto' ? 'Virtual Try-On' : 'Globetrotter'}
                  </span>
                </div>
                {(selectedEntry.visScore || selectedEntry.bisScore) && (
                  <div className={`px-4 py-2 rounded-full font-bold border ${getScoreColor(selectedEntry.visScore || selectedEntry.bisScore)}`}>
                    Score: {selectedEntry.visScore || selectedEntry.bisScore}
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(selectedEntry)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      selectedEntry.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid lg:grid-cols-2 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Image */}
              <div className="space-y-4">
                <img
                  src={selectedEntry.generatedImageUrl}
                  alt="Detail view"
                  className="w-full rounded-xl shadow-lg"
                />

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  
                   <a href={selectedEntry.generatedImageUrl}
                    download={`lookbook-${selectedEntry.id}.jpg`}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </a>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                    <ExternalLink className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedEntry.id, selectedEntry.collectionName)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Product Link (URL Items) */}
                {selectedEntry.isFromUrl && selectedEntry.productUrl && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2 text-lg">
                      <ShoppingBag className="w-6 h-6" />
                      <span>Product Details</span>
                    </h4>
                    
                    {selectedEntry.productTitle && (
                      <div className="mb-3">
                        <p className="text-xs text-blue-600 mb-1 font-medium">Product Name</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedEntry.productTitle}</p>
                      </div>
                    )}

                    {selectedEntry.productBrand && (
                      <div className="mb-3">
                        <p className="text-xs text-blue-600 mb-1 font-medium">Brand</p>
                        <p className="text-sm font-semibold text-blue-900">{selectedEntry.productBrand}</p>
                      </div>
                    )}

                    {selectedEntry.productPrice && (
                      <div className="mb-4">
                        <p className="text-xs text-blue-600 mb-1 font-medium">Price</p>
                        <p className="text-lg font-bold text-green-600 flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{selectedEntry.productPrice}</span>
                        </p>
                      </div>
                    )}

                    
                      <a href={selectedEntry.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all w-full"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>View Original Product</span>
                    </a>

                    {selectedEntry.scrapingMethod && (
                      <div className="mt-3 text-xs text-blue-600 flex items-center justify-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Extracted via: {selectedEntry.scrapingMethod}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Created</span>
                  </h4>
                  <p className="text-gray-600">{formatDate(selectedEntry.createdAt)}</p>
                </div>

                {/* Location (Globetrotter) */}
                {selectedEntry.destinationLocation && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Location</span>
                    </h4>
                    <p className="text-gray-600">{selectedEntry.destinationLocation}</p>
                  </div>
                )}

                {/* Score Breakdown */}
                {selectedEntry.visBreakdown && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">VIS Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Shadow</span>
                          <span className="font-semibold">{selectedEntry.visBreakdown.shadow}/40</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.visBreakdown.shadow / 40) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Drape</span>
                          <span className="font-semibold">{selectedEntry.visBreakdown.drape}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.visBreakdown.drape / 30) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Seam</span>
                          <span className="font-semibold">{selectedEntry.visBreakdown.seam}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.visBreakdown.seam / 30) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntry.bisBreakdown && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">BIS Breakdown</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lighting</span>
                          <span className="font-semibold">{selectedEntry.bisBreakdown.lighting}/40</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.bisBreakdown.lighting / 40) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Perspective</span>
                          <span className="font-semibold">{selectedEntry.bisBreakdown.perspective}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.bisBreakdown.perspective / 30) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Shadow</span>
                          <span className="font-semibold">{selectedEntry.bisBreakdown.shadow}/30</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${(selectedEntry.bisBreakdown.shadow / 30) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Explanation */}
                {(selectedEntry.visExplanation || selectedEntry.bisExplanation) && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">AI Analysis</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedEntry.visExplanation || selectedEntry.bisExplanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}