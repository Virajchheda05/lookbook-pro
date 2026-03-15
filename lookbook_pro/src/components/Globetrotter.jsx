'use client';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { 
  ArrowLeft, 
  Globe, 
  Upload, 
  Sparkles, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudRain, 
  Snowflake,
  Palette,
  Sliders,
  Download,
  Share2,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  Camera,
  Image as ImageIcon,
  Plus,
  Award
} from 'lucide-react';

const DESTINATIONS = [
  {
    id: 'paris-eiffel',
    name: 'Eiffel Tower View',
    location: 'Paris, France',
    category: 'City',
    continent: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    tags: ['Romantic', 'Iconic']
  },
  {
    id: 'nyc-brooklyn',
    name: 'Brooklyn Bridge',
    location: 'New York, USA',
    category: 'City',
    continent: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1513026705753-bc3fffca8bf4?w=1200&q=80',
    tags: ['Urban', 'Skyline']
  },
  {
    id: 'tokyo-street',
    name: 'Tokyo Streets',
    location: 'Tokyo, Japan',
    category: 'City',
    continent: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
    tags: ['Neon', 'Urban']
  },
  {
    id: 'maldives-beach',
    name: 'Tropical Paradise',
    location: 'Maldives',
    category: 'Beach',
    continent: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
    tags: ['Beach', 'Luxury']
  },
  {
    id: 'santorini-view',
    name: 'Santorini Sunset',
    location: 'Santorini, Greece',
    category: 'Beach',
    continent: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
    tags: ['Mediterranean', 'Sunset']
  },
  {
    id: 'dubai-marina',
    name: 'Dubai Marina',
    location: 'Dubai, UAE',
    category: 'City',
    continent: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1200&q=80',
    tags: ['Luxury', 'Modern']
  },
  {
    id: 'london-bigben',
    name: 'Big Ben View',
    location: 'London, UK',
    category: 'City',
    continent: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
    tags: ['Historic', 'Iconic']
  },
  {
    id: 'bali-ricefield',
    name: 'Bali Rice Terraces',
    location: 'Bali, Indonesia',
    category: 'Nature',
    continent: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    tags: ['Nature', 'Serene']
  },
  {
    id: 'swiss-mountains',
    name: 'Swiss Alps',
    location: 'Switzerland',
    category: 'Nature',
    continent: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
    tags: ['Mountains', 'Snow']
  },
  {
    id: 'sydney-opera',
    name: 'Sydney Harbour',
    location: 'Sydney, Australia',
    category: 'City',
    continent: 'Australia',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80',
    tags: ['Iconic', 'Harbour']
  },
  {
    id: 'iceland-aurora',
    name: 'Northern Lights',
    location: 'Iceland',
    category: 'Nature',
    continent: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&q=80',
    tags: ['Aurora', 'Night']
  },
  {
    id: 'morocco-marrakech',
    name: 'Marrakech',
    location: 'Morocco',
    category: 'City',
    continent: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80',
    tags: ['Exotic', 'Colorful']
  },
];

export default function Globetrotter({ user, userData, onBack }) {
  const [step, setStep] = useState('select-source');
  const [sourceImage, setSourceImage] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [customization, setCustomization] = useState({
    position: 'center',
    scale: 'normal',
    timeOfDay: 'current',
    weather: 'clear',
    style: 'realistic'
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [caption, setCaption] = useState('');
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [vtoResults, setVtoResults] = useState([]);
  const [loadingVTO, setLoadingVTO] = useState(false);

  useEffect(() => {
    loadVTOResults();
  }, [user]);

  const loadVTOResults = async () => {
    setLoadingVTO(true);
    try {
      const q = query(
        collection(db, 'vto_sessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVtoResults(results);
    } catch (error) {
      console.error('Error loading VTO results:', error);
    } finally {
      setLoadingVTO(false);
    }
  };

  const handleSourceSelect = (imageUrl, source = 'vto') => {
    setSourceImage({ url: imageUrl, source });
    setStep('select-destination');
  };

  const handleSourceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    try {
      setError('Uploading source image...');
      const storageRef = ref(storage, `users/${user.uid}/globetrotter/source-${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setError('');
      handleSourceSelect(downloadURL, 'upload');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setStep('customize');
  };

  const handleCustomDestinationUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Background image size must be less than 10MB');
      return;
    }

    try {
      setError('Uploading custom background...');
      const storageRef = ref(storage, `users/${user.uid}/globetrotter/custom-bg-${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const customDestination = {
        id: `custom-${Date.now()}`,
        name: 'Custom Location',
        location: 'Your Custom Background',
        category: 'Custom',
        continent: 'Custom',
        imageUrl: downloadURL,
        tags: ['Custom', 'Unique'],
        isCustom: true
      };
      
      setError('');
      handleDestinationSelect(customDestination);
    } catch (error) {
      console.error('Error uploading background:', error);
      setError('Failed to upload background. Please try again.');
    }
  };

  const handleGenerate = async () => {
    setProcessing(true);
    setStep('processing');
    setError('');

    try {
      setProgress('Preparing images...');
      
      const generateResponse = await fetch('/api/globetrotter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageUrl: sourceImage.url,
          backgroundImageUrl: selectedDestination.imageUrl,
          customization
        }),
      });

      const generateData = await generateResponse.json();

      if (!generateData.success) {
        throw new Error(generateData.error || 'Failed to generate background fusion');
      }

      setProgress('Analyzing lighting conditions...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress('Matching perspective...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress('Applying realistic shadows...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setProgress('Finalizing integration...');
      const generatedImageData = `data:image/jpeg;base64,${generateData.imageData}`;

      const generatedBlob = await (await fetch(generatedImageData)).blob();
      const generatedStorageRef = ref(
        storage,
        `users/${user.uid}/globetrotter/${Date.now()}.jpg`
      );
      await uploadBytes(generatedStorageRef, generatedBlob);
      const generatedImageUrl = await getDownloadURL(generatedStorageRef);

      setProgress('Calculating quality score...');
      const scoreResponse = await fetch('/api/globetrotter/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: generateData.imageData }),
      });

      const scoreData = await scoreResponse.json();

      const globetrotterDoc = await addDoc(collection(db, 'globetrotter_sessions'), {
        userId: user.uid,
        generatedImageUrl,
        sourceImageUrl: sourceImage.url,
        destinationId: selectedDestination.id,
        destinationName: selectedDestination.name,
        destinationLocation: selectedDestination.location,
        customization,
        bisScore: scoreData.bisScore || 85,
        bisBreakdown: scoreData.breakdown || { lighting: 35, perspective: 25, shadow: 25 },
        bisExplanation: scoreData.explanation || 'Integration complete',
        isCustomBackground: selectedDestination.isCustom || false,
        createdAt: new Date().toISOString(),
      });

      setResult({
        id: globetrotterDoc.id,
        imageUrl: generatedImageUrl,
        imageData: generatedImageData,
        bisScore: scoreData.bisScore || 85,
        breakdown: scoreData.breakdown || { lighting: 35, perspective: 25, shadow: 25 },
        explanation: scoreData.explanation || 'Background integration complete with excellent quality.',
      });

      setStep('result');
    } catch (err) {
      console.error('Globetrotter error:', err);
      setError(err.message || 'Failed to generate. Please try again.');
      setStep('customize');
    } finally {
      setProcessing(false);
      setProgress('');
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingCaption(true);
    try {
      const response = await fetch('/api/globetrotter/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: result.imageData.replace('data:image/jpeg;base64,', ''),
          location: selectedDestination.location
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.caption) {
        setCaption(data.caption);
      } else {
        throw new Error('Invalid response from caption API');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      
      const locationName = selectedDestination.location.split(',')[0].trim();
      const fallbackCaption = `📍 ${selectedDestination.location}\n\n✨ Living my best life in this incredible place! The vibes here are unmatched. 💫\n\n#Travel #Wanderlust #${locationName.replace(/\s+/g, '')} #TravelGram #InstaTravel #ExploreMore #AdventureTime #TravelPhotography #Globetrotter #TravelGoals #OOTD #FashionTravel`;
      
      setCaption(fallbackCaption);
    } finally {
      setLoadingCaption(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetFlow = () => {
    setStep('select-source');
    setSourceImage(null);
    setSelectedDestination(null);
    setCustomization({
      position: 'center',
      scale: 'normal',
      timeOfDay: 'current',
      weather: 'clear',
      style: 'realistic'
    });
    setResult(null);
    setCaption('');
    setError('');
  };

  // ===== SELECT SOURCE STEP =====
  if (step === 'select-source') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={onBack} 
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Globetrotter Studio
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Travel anywhere in the world, instantly ✈️</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  1
                </div>
                <p className="text-sm font-semibold text-green-600">Select Photo</p>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
                  2
                </div>
                <p className="text-sm font-semibold text-gray-400">Choose Destination</p>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
                  3
                </div>
                <p className="text-sm font-semibold text-gray-400">Customize</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Source Photo</h2>
            <p className="text-gray-600">Select where you want to place yourself</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-2xl mx-auto">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* From VTO Results */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">From Try-Ons</h3>
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Use your virtual try-on results</p>
              
              {loadingVTO ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : vtoResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {vtoResults.map((vto) => (
                    <img
                      key={vto.id}
                      src={vto.generatedImageUrl}
                      alt="VTO Result"
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:ring-4 ring-green-500 transition-all shadow-md hover:shadow-xl hover:scale-105"
                      onClick={() => handleSourceSelect(vto.generatedImageUrl, 'vto')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No try-ons yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create some first!</p>
                </div>
              )}
            </div>

            {/* From Base Photo */}
            <div 
              onClick={() => handleSourceSelect(userData?.basePhotoUrl, 'base')}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Your Profile</h3>
                <Camera className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Use your base profile photo</p>
              
              {userData?.basePhotoUrl ? (
                <div className="relative">
                  <img
                    src={userData.basePhotoUrl}
                    alt="Base Photo"
                    className="w-full aspect-[3/4] object-cover rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all"
                  />
                  <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 rounded-xl transition-all"></div>
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No base photo</p>
                  <p className="text-xs text-gray-400 mt-1">Upload in Profile</p>
                </div>
              )}
            </div>

            {/* Upload New Photo */}
            <label className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-2xl transition-all shadow-lg border-2 border-transparent hover:border-green-500 group">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload New Photo</h3>
                <p className="text-sm text-gray-600 text-center mb-4">Upload any photo of yourself</p>
                <div className="flex items-center space-x-2 text-xs bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold">
                  <Plus className="w-4 h-4" />
                  <span>Choose File</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">Max 10MB • JPG, PNG</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleSourceFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ===== SELECT DESTINATION STEP =====
  if (step === 'select-destination') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => setStep('select-source')} 
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Change Photo</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Choose Your Destination
              </h1>
              <p className="text-gray-600">Where do you want to be today?</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-green-600">Photo Selected</p>
              </div>
              <div className="flex-1 h-1 bg-green-600 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  2
                </div>
                <p className="text-sm font-semibold text-green-600">Choose Destination</p>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
                  3
                </div>
                <p className="text-sm font-semibold text-gray-400">Customize</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-4xl mx-auto">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* Custom Upload Card */}
            <label className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 border-dashed rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all shadow-lg">
              <div className="aspect-square flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-lg text-blue-900 mb-1">Upload Custom</p>
                <p className="text-xs text-blue-700 text-center mb-2">Your own background</p>
                <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                  Choose File
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomDestinationUpload}
                className="hidden"
              />
            </label>

            {/* Pre-loaded Destinations */}
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => handleDestinationSelect(dest)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:scale-105 hover:shadow-2xl transition-all shadow-lg"
              >
                <div className="aspect-square relative">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-white w-full">
                      <p className="font-bold text-base mb-1">{dest.name}</p>
                      <div className="flex items-center space-x-1 text-xs opacity-90">
                        <MapPin className="w-3 h-3" />
                        <span>{dest.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-semibold">
                      {dest.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== CUSTOMIZE STEP =====
  if (step === 'customize') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => setStep('select-destination')} 
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Change Destination</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Customize Your Experience
              </h1>
              <p className="text-gray-600">Fine-tune lighting, weather, and style</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-green-600">Photo Selected</p>
              </div>
              <div className="flex-1 h-1 bg-green-600 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-green-600">Destination Set</p>
              </div>
              <div className="flex-1 h-1 bg-green-600 mx-2"></div>
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold mb-2">
                  3
                </div>
                <p className="text-sm font-semibold text-green-600">Customize</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-4xl mx-auto">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>Destination Preview</span>
                </h3>
                <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-4">
                  <img
                    src={selectedDestination.imageUrl}
                    alt="Destination"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <p className="font-bold text-gray-900 mb-1">{selectedDestination.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>{selectedDestination.location}</span>
                  </div>
                  {selectedDestination.isCustom && (
                    <div className="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full inline-flex items-center space-x-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Custom Background</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Positioning */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-green-600" />
                  <span>Positioning & Scale</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['left', 'center', 'right'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setCustomization({ ...customization, position: pos })}
                          className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                            customization.position === pos
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Scale</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['closer', 'normal', 'farther'].map((scale) => (
                        <button
                          key={scale}
                          onClick={() => setCustomization({ ...customization, scale })}
                          className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                            customization.scale === scale
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {scale.charAt(0).toUpperCase() + scale.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lighting & Weather */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sun className="w-5 h-5 text-green-600" />
                  <span>Lighting & Atmosphere</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time of Day</label>
                    <select
                      value={customization.timeOfDay}
                      onChange={(e) => setCustomization({ ...customization, timeOfDay: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-medium"
                    >
                      <option value="current">Current (Match Location)</option>
                      <option value="morning">🌅 Morning Light</option>
                      <option value="noon">☀️ Bright Noon</option>
                      <option value="golden-hour">🌇 Golden Hour</option>
                      <option value="night">🌙 Night Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weather</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'clear', icon: Sun, label: 'Clear' },
                        { value: 'cloudy', icon: Cloud, label: 'Cloudy' },
                        { value: 'rainy', icon: CloudRain, label: 'Rainy' },
                        { value: 'snowy', icon: Snowflake, label: 'Snowy' }
                      ].map((weather) => {
                        const Icon = weather.icon;
                        return (
                          <button
                            key={weather.value}
                            onClick={() => setCustomization({ ...customization, weather: weather.value })}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all ${
                              customization.weather === weather.value
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{weather.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Style */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-green-600" />
                  <span>Visual Style</span>
                </h3>
                <select
                  value={customization.style}
                  onChange={(e) => setCustomization({ ...customization, style: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-medium"
                >
                  <option value="realistic">📷 Realistic Photo</option>
                  <option value="cinematic">🎬 Cinematic</option>
                  <option value="vintage">📼 Vintage Film</option>
                  <option value="vibrant">🌈 Vibrant Colors</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={processing}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Globe className="w-6 h-6" />
                <span>Generate Fusion</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== PROCESSING STEP =====
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Globe className="w-12 h-12 text-white" />
            </div>
            <Loader2 className="w-32 h-32 text-green-600 animate-spin absolute -top-4 -left-4 right-0 mx-auto opacity-20" />
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Creating Magic ✨
          </h2>
          <p className="text-lg text-gray-700 font-semibold mb-6">{progress}</p>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-left">
            <p className="text-sm text-green-900 font-bold mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Processing Steps:</span>
            </p>
            <ul className="text-sm text-green-800 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Removing original background</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Analyzing destination environment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Matching lighting & perspective</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Applying color grading & atmosphere</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Generating realistic shadows</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600">✓</span>
                <span>Seamless edge blending</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-green-700 font-semibold">⏱️ Estimated time: 25-35 seconds</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RESULT STEP =====
  if (step === 'result' && result) {
    const getScoreColor = (score) => {
      if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <button 
              onClick={resetFlow} 
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Create Another</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Your Globetrotter Shot ✈️
            </h1>
            <button 
              onClick={onBack} 
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
            >
              Done
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Generated Image */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="relative group">
                  <img
                    src={result.imageData}
                    alt="Globetrotter Result"
                    className="w-full rounded-2xl shadow-xl"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">{selectedDestination.location}</span>
                  </div>
                  {selectedDestination.isCustom && (
                    <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                      Custom Background
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram Caption */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center space-x-2 text-lg">
                    <Share2 className="w-5 h-5 text-green-600" />
                    <span>Instagram Caption</span>
                  </h3>
                  {!caption && (
                    <button
                      onClick={handleGenerateCaption}
                      disabled={loadingCaption}
                      className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md text-sm"
                    >
                      {loadingCaption ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Caption</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {caption ? (
                  <div className="relative">
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-5 mb-3 border border-green-100">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{caption}</p>
                    </div>
                    <button
                      onClick={handleCopyCaption}
                      className="w-full px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all flex items-center justify-center space-x-2 shadow-md"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy Caption</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Generate an AI-powered caption</p>
                    <p className="text-xs text-gray-400 mt-1">Perfect for Instagram with hashtags!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Score & Actions */}
            <div className="space-y-6">
              {/* BIS Score */}
              <div className={`bg-white rounded-2xl p-6 border-2 shadow-lg ${getScoreColor(result.bisScore)}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wide">BIS Score</span>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-6xl font-black mb-2">{result.bisScore}</div>
                <div className="text-sm font-semibold opacity-80">Background Integration</div>
              </div>

              {/* Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span>Quality Breakdown</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-semibold">Lighting Match</span>
                      <span className="font-bold text-green-600">{result.breakdown.lighting}/40</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.breakdown.lighting / 40) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-semibold">Perspective</span>
                      <span className="font-bold text-emerald-600">{result.breakdown.perspective}/30</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.breakdown.perspective / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-semibold">Shadow Realism</span>
                      <span className="font-bold text-teal-600">{result.breakdown.shadow}/30</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(result.breakdown.shadow / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span>AI Analysis</span>
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <a 
                  href={result.imageData}
                  download={`globetrotter-${selectedDestination.id}-${Date.now()}.jpg`}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  <span>Download HD Image</span>
                </a>
                <button
                  onClick={resetFlow}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all shadow-md"
                >
                  Create Another Shot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}