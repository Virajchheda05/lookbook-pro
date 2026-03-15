// src/components/Closet.jsx
// Digital Wardrobe System - Manage clothing inventory with outfit builder

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Trash2, 
  Edit, 
  Sparkles, 
  X,
  Upload,
  Tag,
  Palette,
  Calendar,
  Shirt
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export default function Closet({ user, onBack }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Categories and styles
  const categories = ['all', 'shirt', 'pants', 'dress', 'shoes', 'accessories', 'outerwear'];
  const styles = ['casual', 'formal', 'sporty', 'trendy', 'vintage'];
  const seasons = ['summer', 'winter', 'spring', 'fall', 'all-season'];

  useEffect(() => {
    loadClosetItems();
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchTerm]);

  const loadClosetItems = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'closet_items'),
        where('userId', '==', user.uid),
        orderBy('addedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading closet:', error);
    }
    setLoading(false);
  };

  const filterItems = () => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item from your closet?')) return;
    
    try {
      await deleteDoc(doc(db, 'closet_items', itemId));
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      shirt: '👕',
      pants: '👖',
      dress: '👗',
      shoes: '👟',
      accessories: '🎒',
      outerwear: '🧥'
    };
    return icons[category] || '👔';
  };

  const getCategoryColor = (category) => {
    const colors = {
      shirt: 'from-blue-500 to-cyan-500',
      pants: 'from-purple-500 to-pink-500',
      dress: 'from-pink-500 to-rose-500',
      shoes: 'from-orange-500 to-red-500',
      accessories: 'from-green-500 to-emerald-500',
      outerwear: 'from-indigo-500 to-purple-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your closet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Closet
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-3xl font-bold text-purple-600">{items.length}</p>
            <p className="text-gray-600 text-sm">Total Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-3xl font-bold text-pink-600">
              {items.filter(i => i.category === 'shirt').length}
            </p>
            <p className="text-gray-600 text-sm">Tops</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-3xl font-bold text-blue-600">
              {items.filter(i => i.category === 'pants').length}
            </p>
            <p className="text-gray-600 text-sm">Bottoms</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <p className="text-3xl font-bold text-orange-600">
              {items.filter(i => i.category === 'shoes').length}
            </p>
            <p className="text-gray-600 text-sm">Shoes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? '✨ All' : `${getCategoryIcon(cat)} ${cat}`}
                </button>
              ))}
            </div>

            {/* Outfit Builder */}
            <button
              onClick={() => setShowOutfitBuilder(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
            >
              <Sparkles size={20} />
              Build Outfit
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shirt size={48} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {items.length === 0 ? 'Your Closet is Empty' : 'No Items Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {items.length === 0 
                ? 'Start building your digital wardrobe by adding items!'
                : 'Try adjusting your filters or search term.'}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Item
              </button>
            )}
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 duration-300 group"
              >
                {/* Image */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {item.category}
                    </span>
                  </div>

                  {/* Color */}
                  {item.primaryColor && (
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: item.primaryColor }}
                      />
                      <span className="text-sm text-gray-600">
                        {item.primaryColor}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Style Badge */}
                  {item.style && (
                    <div className="mt-2">
                      <span className={`text-xs bg-gradient-to-r ${getCategoryColor(item.category)} text-white px-3 py-1 rounded-full`}>
                        {item.style}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          user={user}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadClosetItems();
          }}
          categories={categories.filter(c => c !== 'all')}
          styles={styles}
          seasons={seasons}
        />
      )}

      {/* Outfit Builder Modal */}
      {showOutfitBuilder && (
        <OutfitBuilderModal
          items={items}
          onClose={() => setShowOutfitBuilder(false)}
        />
      )}
    </div>
  );
}

// ==================== ADD ITEM MODAL ====================
function AddItemModal({ user, onClose, onSuccess, categories, styles, seasons }) {
  const [formData, setFormData] = useState({
    category: 'shirt',
    primaryColor: '#000000',
    style: 'casual',
    tags: [],
    season: 'all-season'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) return;
    
    setFormData({
      ...formData,
      tags: [...formData.tags, tagInput.trim()]
    });
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setUploading(true);

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `users/${user.uid}/closet/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // Add to Firestore
      await addDoc(collection(db, 'closet_items'), {
        userId: user.uid,
        imageUrl,
        category: formData.category,
        primaryColor: formData.primaryColor,
        style: formData.style,
        tags: formData.tags,
        season: formData.season,
        addedAt: new Date()
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Add Item to Closet</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image *
            </label>
            <div 
              onClick={() => document.getElementById('image-input').click()}
              className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="text-white" size={48} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={48} />
                  <p className="mt-2 text-sm">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData({ ...formData, style })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.style === style
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            >
              {seasons.map(season => (
                <option key={season} value={season}>
                  {season.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (e.g., cotton, vintage)"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus size={20} />
                Add to Closet
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== OUTFIT BUILDER MODAL ====================
function OutfitBuilderModal({ items, onClose }) {
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedShoes, setSelectedShoes] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    generateSuggestions();
  }, [items]);

  const generateSuggestions = () => {
    // Simple outfit generation logic
    const tops = items.filter(i => ['shirt', 'dress', 'outerwear'].includes(i.category));
    const bottoms = items.filter(i => i.category === 'pants');
    const shoes = items.filter(i => i.category === 'shoes');

    const outfits = [];
    for (let i = 0; i < Math.min(3, tops.length); i++) {
      const top = tops[i];
      const matchingBottom = bottoms.find(b => b.style === top.style) || bottoms[0];
      const matchingShoes = shoes.find(s => s.style === top.style) || shoes[0];

      if (top && matchingBottom && matchingShoes) {
        outfits.push({
          top,
          bottom: matchingBottom,
          shoes: matchingShoes,
          style: top.style
        });
      }
    }

    setSuggestions(outfits);
  };

  const selectOutfit = (outfit) => {
    setSelectedTop(outfit.top);
    setSelectedBottom(outfit.bottom);
    setSelectedShoes(outfit.shoes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-white" size={28} />
            <h2 className="text-2xl font-bold text-white">AI Outfit Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Suggestions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Outfits</h3>
            {suggestions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600">
                  Add more items to your closet to generate outfit suggestions!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {suggestions.map((outfit, index) => (
                  <div
                    key={index}
                    onClick={() => selectOutfit(outfit)}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500"
                  >
                    <div className="space-y-3">
                      <div className="h-32 bg-white rounded-lg overflow-hidden">
                        <img src={outfit.top.imageUrl} alt="Top" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-32 bg-white rounded-lg overflow-hidden">
                        <img src={outfit.bottom.imageUrl} alt="Bottom" className="w-full h-full object-cover" />
                      </div>
                      <div className="h-24 bg-white rounded-lg overflow-hidden">
                        <img src={outfit.shoes.imageUrl} alt="Shoes" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {outfit.style}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Outfit */}
          {(selectedTop || selectedBottom || selectedShoes) && (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Custom Outfit</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {selectedTop && (
                  <div className="bg-white rounded-xl p-4">
                    <img src={selectedTop.imageUrl} alt="Top" className="w-full h-48 object-cover rounded-lg mb-2" />
                    <p className="font-semibold">Top: {selectedTop.category}</p>
                  </div>
                )}
                {selectedBottom && (
                  <div className="bg-white rounded-xl p-4">
                    <img src={selectedBottom.imageUrl} alt="Bottom" className="w-full h-48 object-cover rounded-lg mb-2" />
                    <p className="font-semibold">Bottom: {selectedBottom.category}</p>
                  </div>
                )}
                {selectedShoes && (
                  <div className="bg-white rounded-xl p-4">
                    <img src={selectedShoes.imageUrl} alt="Shoes" className="w-full h-48 object-cover rounded-lg mb-2" />
                    <p className="font-semibold">Shoes: {selectedShoes.category}</p>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                Generate Virtual Try-On
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}