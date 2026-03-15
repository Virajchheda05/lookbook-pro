'use client';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Link as LinkIcon, Grid, ArrowRight, 
  Loader2, Sparkles, Check, AlertCircle, BookImage, X 
} from 'lucide-react';
import { db, storage } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { completeVTOPipeline, fileToBase64 } from '@/lib/ai/gemini';
import URLScraper from './URLScraper';

export default function TryOn({ user, onBack }) {
  const [step, setStep] = useState('select'); // 'select', 'input', 'processing', 'result'
  const [selectedMethod, setSelectedMethod] = useState(null); // 'url', 'upload', 'closet'
  const [userData, setUserData] = useState(null);
  
  // Input states
  const [productUrl, setProductUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [selectedClosetItem, setSelectedClosetItem] = useState(null);
  const [closetItems, setClosetItems] = useState([]);
  const [garmentImage, setGarmentImage] = useState(null);
  
  // Manual metadata for uploads
  const [manualMetadata, setManualMetadata] = useState({
    category: 'shirt',
    fabricType: 'cotton',
    color: '#0066CC'
  });
  
  // Processing & Results
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [processingStage, setProcessingStage] = useState('');

  useEffect(() => {
    loadUserData();
    if (selectedMethod === 'closet') {
      loadClosetItems();
    }
  }, [selectedMethod]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadClosetItems = async () => {
    try {
      const q = query(
        collection(db, 'closet_items'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClosetItems(items);
    } catch (error) {
      console.error('Error loading closet:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClosetItemSelect = (item) => {
    setSelectedClosetItem(item);
    setError('');
  };

  const processVTO = async () => {
    // Validate base photo exists
    if (!userData?.basePhotoUrl) {
      setError('Please upload your base profile photo first from the Dashboard');
      return;
    }

    setProcessing(true);
    setStep('processing');
    setError('');

    try {
      let garmentImageUrl = '';
      let fabricMetadata = {};

      // Step 1: Prepare garment image based on method
      if (selectedMethod === 'url') {
        setProcessingStage('Scraping product data...');
        setError('URL scraping not implemented yet. Please use Upload or Closet method.');
        setStep('input');
        setProcessing(false);
        return;
      } else if (selectedMethod === 'upload') {
        setProcessingStage('Uploading garment image...');
        
        // Upload file to Firebase Storage
        const storageRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}_${uploadedFile.name}`);
        await uploadBytes(storageRef, uploadedFile);
        garmentImageUrl = await getDownloadURL(storageRef);
        
        fabricMetadata = {
          category: manualMetadata.category,
          fabricType: manualMetadata.fabricType,
          color: manualMetadata.color
        };
      } else if (selectedMethod === 'closet') {
        setProcessingStage('Loading garment from closet...');
        
        garmentImageUrl = selectedClosetItem.imageUrl;
        fabricMetadata = {
          category: selectedClosetItem.category,
          fabricType: 'cotton', // Default, closet items don't store fabric type yet
          color: selectedClosetItem.primaryColor
        };
      }

      setProcessingStage('Generating virtual try-on...');

      // Step 2: Run complete VTO pipeline
      const vtoResult = await completeVTOPipeline(
        user.uid,
        userData.basePhotoUrl,
        garmentImageUrl,
        fabricMetadata,
        storage,
        db
      );

      if (!vtoResult.success) {
        throw new Error(vtoResult.error);
      }

      // Step 3: Display result
      setResult(vtoResult);
      setStep('result');

    } catch (error) {
      console.error('VTO Error:', error);
      setError(error.message || 'Failed to generate try-on. Please try again.');
      setStep('input');
    } finally {
      setProcessing(false);
      setProcessingStage('');
    }
  };

  const saveToLookbook = async () => {
    try {
      const { collection: firestoreCollection, addDoc } = await import('firebase/firestore');
      
      await addDoc(firestoreCollection(db, 'lookbook_entries'), {
        userId: user.uid,
        type: 'vto',
        imageUrl: result.generatedImageUrl,
        visScore: result.visScore,
        items: [],
        tags: ['virtual-try-on'],
        notes: '',
        isPublic: false,
        createdAt: new Date()
      });

      alert('Saved to Lookbook! ✅');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save to Lookbook');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Virtual Try-On
            </h2>
          </div>
          {step !== 'select' && (
            <button
              onClick={() => {
                setStep('select');
                setSelectedMethod(null);
                setError('');
                setUploadedFile(null);
                setUploadPreview(null);
                setSelectedClosetItem(null);
              }}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium"
            >
              Start Over
            </button>
          )}
        </div>
        {step === 'url-scraper' && (
  <URLScraper 
    user={user}
    userData={userData}
    onBack={() => {
      setStep('select');
      setSelectedMethod(null);
    }}
    onImageSelected={async (imageUrl, metadata) => {
      try {
        setProcessing(true);
        setStep('processing');
        setProcessingStage('Preparing scraped image...');
        setError('');

        console.log('🔗 URL Scraper returned:', { imageUrl, metadata });

        // Validate base photo exists
        if (!userData?.basePhotoUrl) {
          throw new Error('Please upload your base profile photo first from the Dashboard');
        }

        // ✅ FIX: Ensure we have valid image URLs
        if (!imageUrl || typeof imageUrl !== 'string') {
          throw new Error('Invalid image URL from scraper');
        }

        console.log('✅ Base photo URL:', userData.basePhotoUrl);
        console.log('✅ Garment URL:', imageUrl);

        // Download image from scraped URL and upload to Firebase
        setProcessingStage('Uploading garment image...');
        
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch scraped image');
        }
        const imageBlob = await imageResponse.blob();
        
        const storageRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}_url_scraped.jpg`);
        await uploadBytes(storageRef, imageBlob);
        const garmentImageUrl = await getDownloadURL(storageRef);

        console.log('✅ Garment uploaded to Firebase:', garmentImageUrl);

        // Prepare fabric metadata
        const fabricMetadata = {
          category: 'shirt',
          fabricType: 'cotton',
          color: '#0066CC',
          // ✅ SAVE URL METADATA
          productUrl: metadata.productUrl || '',
          productTitle: metadata.productTitle || '',
          productBrand: metadata.productBrand || '',
          productPrice: metadata.productPrice || '',
          scrapingMethod: metadata.method || '',
        };

        setProcessingStage('Generating virtual try-on...');

        // ✅ FIX: Call VTO pipeline with correct parameters
        const vtoResult = await completeVTOPipeline(
          user.uid,
          userData.basePhotoUrl,      // ✅ Base image URL
          garmentImageUrl,            // ✅ Garment image URL (uploaded to Firebase)
          fabricMetadata,
          storage,
          db
        );

        if (!vtoResult.success) {
          throw new Error(vtoResult.error);
        }

        // Display result
        setResult(vtoResult);
        setStep('result');

      } catch (error) {
        console.error('VTO Error:', error);
        setError(error.message || 'Failed to generate try-on. Please try again.');
        setStep('select');
      } finally {
        setProcessing(false);
        setProcessingStage('');
      }
    }}
  />
)}

        {/* STEP 1: METHOD SELECTION */}
        {step === 'select' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Method
              </h3>
              <p className="text-gray-600">
                Select how you want to try on new items
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* URL Method */}
            <button
            onClick={() => {
                setSelectedMethod('url');
                setStep('url-scraper'); // ✅ This triggers the URLScraper
            }}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 text-left"
            >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
            <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LinkIcon className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Paste URL</h4>
                <p className="text-gray-600 text-sm mb-3">
                Enter product link from e-commerce sites
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Myntra</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Amazon</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Ajio</span>
                </div>
            </div>
            </button>

              {/* Upload Method */}
              <button
                onClick={() => {
                  setSelectedMethod('upload');
                  setStep('input');
                }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-white" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Upload Photo</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Upload garment image from your device
                  </p>
                  <div className="text-xs text-gray-500">
                    Supports: JPG, PNG, WEBP (max 5MB)
                  </div>
                </div>
              </button>

              {/* Closet Method */}
              <button
                onClick={() => {
                  setSelectedMethod('closet');
                  setStep('input');
                }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Grid className="text-white" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">From Closet</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Select from your saved wardrobe items
                  </p>
                  <div className="text-xs text-gray-500">
                    Quick access to your collection
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INPUT BASED ON METHOD */}
        {step === 'input' && (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {/* URL Input */}
            {selectedMethod === 'url' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Paste Product URL
                </h3>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    placeholder="https://www.myntra.com/product/..."
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  />
                  <p className="text-sm text-gray-500">
                    Supported: Myntra, Amazon, Ajio
                  </p>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={processVTO}
                    disabled={!productUrl || processing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Input */}
            {selectedMethod === 'upload' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Upload Garment Photo
                </h3>
                
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div
                    onClick={() => document.getElementById('file-input').click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-50 hover:bg-purple-50"
                  >
                    {uploadPreview ? (
                      <div className="relative">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg shadow-lg"
                        />
                        <p className="mt-4 text-sm text-gray-600 font-medium">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-gray-400 mb-4" size={64} />
                        <p className="text-lg text-gray-600 font-medium mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Manual Metadata */}
                  {uploadedFile && (
                    <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-4">Garment Details</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Garment Type
                        </label>
                        <select
                          value={manualMetadata.category}
                          onChange={(e) => setManualMetadata({...manualMetadata, category: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="shirt">Shirt</option>
                          <option value="pants">Pants</option>
                          <option value="dress">Dress</option>
                          <option value="outerwear">Jacket/Coat</option>
                          <option value="shoes">Shoes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fabric Type
                        </label>
                        <select
                          value={manualMetadata.fabricType}
                          onChange={(e) => setManualMetadata({...manualMetadata, fabricType: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        >
                          <option value="cotton">Cotton</option>
                          <option value="denim">Denim</option>
                          <option value="silk">Silk</option>
                          <option value="leather">Leather</option>
                          <option value="polyester">Polyester</option>
                          <option value="wool">Wool</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={manualMetadata.color}
                            onChange={(e) => setManualMetadata({...manualMetadata, color: e.target.value})}
                            className="w-20 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                          />
                          <span className="text-sm text-gray-600 font-mono">
                            {manualMetadata.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={processVTO}
                    disabled={!uploadedFile || processing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Generate Try-On
                    <Sparkles size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Closet Selection */}
            {selectedMethod === 'closet' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Select from Your Closet
                </h3>
                
                {closetItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Grid className="mx-auto text-gray-400 mb-4" size={64} />
                    <p className="text-gray-600 mb-4 text-lg">
                      Your closet is empty
                    </p>
                    <button
                      onClick={onBack}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Add items to closet first
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-[500px] overflow-y-auto p-2">
                      {closetItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleClosetItemSelect(item)}
                          className={`relative rounded-xl overflow-hidden border-4 transition-all ${
                            selectedClosetItem?.id === item.id
                              ? 'border-purple-600 scale-105 shadow-2xl'
                              : 'border-transparent hover:border-purple-300 hover:shadow-lg'
                          }`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.category}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <span className="text-white font-medium capitalize">
                              {item.category}
                            </span>
                          </div>
                          {selectedClosetItem?.id === item.id && (
                            <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-2 shadow-lg">
                              <Check className="text-white" size={20} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                          <p className="text-red-700">{error}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={processVTO}
                      disabled={!selectedClosetItem || processing}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Try This On
                      <Sparkles size={20} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto">
                  <Loader2 className="w-full h-full text-purple-600 animate-spin" />
                </div>
                <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Creating Your Virtual Try-On ✨
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <span>{processingStage || 'Processing...'}</span>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-left">
                <p className="text-sm text-blue-800">
                  <strong>What's happening:</strong> Our AI is analyzing your photo and the garment, 
                  matching lighting, applying realistic fabric physics, and creating a photorealistic result. 
                  This usually takes 15-25 seconds.
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Estimated time: 15-25 seconds
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT DISPLAY */}
        {step === 'result' && result && (
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pb-8">
            {/* VIS Score Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Virtual Try-On Complete! ✨
                  </h3>
                  <p className="text-gray-600">
                    Processing time: {result.processingTime?.toFixed(1)}s
                  </p>
                </div>
                {/* VIS Score Badge */}
                <div className={`px-8 py-4 rounded-2xl ${
                  result.visScore >= 90 ? 'bg-green-100' :
                  result.visScore >= 75 ? 'bg-blue-100' :
                  result.visScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      result.visScore >= 90 ? 'text-green-700' :
                      result.visScore >= 75 ? 'text-blue-700' :
                      result.visScore >= 60 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {result.visScore}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">
                      VIS Score
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Image */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Generated Result</h4>
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={result.generatedImageUrl}
                  alt="Generated Try-On"
                  className="w-full h-auto max-h-[600px] object-contain mx-auto"
                />
              </div>
            </div>

            {/* VIS Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Quality Analysis</h4>
              <div className="space-y-4">
                {/* Shadow Score */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Shadow Consistency</span>
                    <span className="text-sm font-bold text-gray-900">{result.visBreakdown.shadow}/40</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(result.visBreakdown.shadow / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Drape Score */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fabric Drape</span>
                    <span className="text-sm font-bold text-gray-900">{result.visBreakdown.drape}/30</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(result.visBreakdown.drape / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Seam Score */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Seam Blending</span>
                    <span className="text-sm font-bold text-gray-900">{result.visBreakdown.seam}/30</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(result.visBreakdown.seam / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {result.visExplanation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.visExplanation}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={saveToLookbook}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                <BookImage size={20} />
                Save to Lookbook
              </button>
              <button
                onClick={() => {
                  setStep('select');
                  setResult(null);
                  setSelectedMethod(null);
                  setUploadedFile(null);
                  setUploadPreview(null);
                  setSelectedClosetItem(null);
                }}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                <Sparkles size={20} />
                Try Another Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}