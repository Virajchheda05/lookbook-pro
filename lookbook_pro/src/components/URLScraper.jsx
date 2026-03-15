'use client';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Download,
  Upload,
  ExternalLink,
  Check
} from 'lucide-react';

export default function URLScraper({ user, onBack, onImageSelected }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a product URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setSelectedImage(null);

    try {
      console.log('🔗 Scraping URL:', url);

      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Scraping successful:', data);
        setResult(data);
        if (data.images.length > 0) {
          setSelectedImage(data.images[0]); // Auto-select first image
        }
      } else {
        setError(data.error || 'Failed to extract images from this URL');
      }
    } catch (err) {
      console.error('❌ Scraping error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCloset = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    setProcessing(true);

    try {
      // Download image and upload to Firebase
      const imageResponse = await fetch(selectedImage);
      const imageBlob = await imageResponse.blob();
      
      const storageRef = ref(storage, `users/${user.uid}/closet/${Date.now()}.jpg`);
      await uploadBytes(storageRef, imageBlob);
      const imageUrl = await getDownloadURL(storageRef);

      // Save to Firestore
      await addDoc(collection(db, 'closet_items'), {
        userId: user.uid,
        imageUrl,
        category: 'shirt', // Default category
        source: 'url_scraping',
        sourceUrl: url,
        productTitle: result.title || '',
        productBrand: result.brand || '',
        productPrice: result.price || '',
        createdAt: new Date().toISOString(),
        tags: [],
      });

      alert('✅ Saved to closet successfully!');
    } catch (error) {
      console.error('Error saving to closet:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

const handleTryOn = () => {
  if (!selectedImage) {
    alert('Please select an image first');
    return;
  }

  console.log('🎯 Calling onImageSelected with:', {
    imageUrl: selectedImage,
    metadata: {
      productUrl: url,
      productTitle: result.title || '',
      productBrand: result.brand || '',
      productPrice: result.price || '',
      method: result.method || ''
    }
  });

  // Pass the selected image back to TryOn component
  if (onImageSelected) {
    onImageSelected(selectedImage, {
      productUrl: url,
      productTitle: result.title || '',
      productBrand: result.brand || '',
      productPrice: result.price || '',
      method: result.method || ''
    });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 hover:bg-blue-50 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Try-On</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
                <LinkIcon className="w-8 h-8 text-blue-600" />
                Extract from URL
              </h1>
              <p className="text-gray-600 mt-1">Paste a product link to extract garment images</p>
            </div>
            <div className="w-40"></div>
          </div>
        </div>

        {/* Supported Sites Info */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Supported E-Commerce Sites
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {['Myntra', 'Amazon', 'Flipkart', 'AJIO', 'H&M', 'Zara', 'Nykaa Fashion', 'And more...'].map(site => (
              <div key={site} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{site}</span>
              </div>
            ))}
          </div>
          <p className="text-sm mt-3 text-blue-100">
            ⚡ Our AI automatically extracts product images from most e-commerce sites
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Product URL
          </label>
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleScrape()}
              placeholder="https://www.myntra.com/tshirts/roadster/..."
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleScrape}
              disabled={loading || !url.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[150px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Extract</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-semibold">{error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Try a different product URL or use the upload method instead.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="font-semibold text-blue-900">Processing your request...</span>
              </div>
              <div className="space-y-2 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Trying fast extraction methods...
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200"></span>
                  Analyzing page structure...
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400"></span>
                  Extracting product images...
                </p>
              </div>
              <p className="text-xs text-blue-600 mt-4 flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin"></span>
                This may take 5-20 seconds depending on the site
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && result.success && (
          <div className="space-y-6 animate-fade-in">
            {/* Success Message */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Successfully extracted {result.images.length} image{result.images.length !== 1 ? 's' : ''}!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Method used: <span className="font-semibold">{result.method}</span>
                    {result.processingTime && ` • Time: ${result.processingTime}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            {(result.title || result.brand || result.price) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
                <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  Product Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {result.title && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Title</p>
                      <p className="font-semibold text-gray-900 text-sm">{result.title}</p>
                    </div>
                  )}
                  {result.brand && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Brand</p>
                      <p className="font-semibold text-gray-900 text-sm">{result.brand}</p>
                    </div>
                  )}
                  {result.price && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Price</p>
                      <p className="font-semibold text-gray-900 text-sm">{result.price}</p>
                    </div>
                  )}
                </div>
                
                <a  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View original product page</span>
                </a>
              </div>
            )}

            {/* Extracted Images */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-gray-900">
                  Select Image to Try On
                </h3>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                  {result.images.length} image{result.images.length !== 1 ? 's' : ''} found
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {result.images.map((image, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-4 group ${
                      selectedImage === image
                        ? 'border-blue-500 shadow-2xl scale-105 ring-4 ring-blue-200'
                        : 'border-transparent hover:border-blue-300 hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === image && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full p-3 shadow-lg">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>

              {selectedImage && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Image selected! Choose an action below.</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={handleTryOn}
                      disabled={processing}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                    >
                      <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                      <span>Try On This Image</span>
                    </button>
                    <button
                      onClick={handleSaveToCloset}
                      disabled={processing}
                      className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span>Save to Closet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State - Show example */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="max-w-md mx-auto">
              <LinkIcon className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Paste a product URL to get started
              </h3>
              <p className="text-gray-600 mb-6">
                Try pasting a link from Myntra, Amazon, Flipkart, or any supported e-commerce site
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-2">Example URLs:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• https://www.myntra.com/tshirts/...</li>
                  <li>• https://www.amazon.in/dp/...</li>
                  <li>• https://www.ajio.com/...</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}