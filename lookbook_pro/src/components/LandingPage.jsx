'use client';

import { useState } from 'react';
import { Sparkles, Shirt, Image, Award, ArrowRight, Menu, X } from 'lucide-react';

export default function LandingPage({ onShowAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'AI Virtual Try-On',
      description: 'See yourself in any outfit instantly with cutting-edge AI technology',
      gradient: 'from-purple-400 to-purple-600',
      image: 'https://images.unsplash.com/photo-1630699144552-b2b60b277b75',
    },
    {
      icon: <Shirt className="w-12 h-12" />,
      title: 'Digital Closet',
      description: 'Organize your wardrobe digitally with smart tagging and categorization',
      gradient: 'from-pink-400 to-pink-600',
      image: 'https://images.unsplash.com/photo-1630699293155-2cc65a890604',
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Quality Scoring',
      description: 'Get detailed VIS scores measuring shadow, drape, and seam quality',
      gradient: 'from-blue-400 to-blue-600',
      image: 'https://images.unsplash.com/photo-1756908992154-c8a89f5e517f',
    },
    {
      icon: <Image className="w-12 h-12" />,
      title: 'Personal Lookbook',
      description: 'Save your favorite looks and build your personal style portfolio',
      gradient: 'from-amber-400 to-amber-600',
      image: 'https://images.unsplash.com/photo-1728739529355-31dcaefd82b7',
    },
  ];

  const carouselImages = [
    'https://images.unsplash.com/photo-1641370483185-fffbf71af98c',
    'https://images.unsplash.com/photo-1768033976461-61ea7527ac1e',
    'https://images.unsplash.com/photo-1624911104820-5316c700b907',
    'https://images.unsplash.com/photo-1590330297626-d7aff25a0431',
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Photo',
      description: 'Take or upload a clear photo of yourself. This becomes your base for all try-ons.',
    },
    {
      number: '02',
      title: 'Choose Garments',
      description: 'Upload clothing items, select from your closet, or paste product URLs.',
    },
    {
      number: '03',
      title: 'Try On Instantly',
      description: 'Our AI generates photorealistic images showing you wearing the garments.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Lookbook Pro</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                How It Works
              </a>
              <button
                onClick={() => onShowAuth('register')}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-purple-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
              
              <a  href="#features"
                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              
               <a href="#how-it-works"
                className="block px-4 py-2 rounded-lg hover:bg-purple-50 text-gray-700 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <button
                onClick={() => {
                  onShowAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-white rounded-full shadow-md">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ Powered by AI</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Transform Your Style with{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Magic</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Visualize clothing on yourself instantly. No more guessing – see exactly how any garment looks on you before buying.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onShowAuth('register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Start Trying On</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onShowAuth('login')}
                  className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-md border-2 border-purple-200"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right Carousel */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-2 gap-4 h-full">
                {carouselImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-xl"
                  >
                    <img
                      src={img}
                      alt={`Fashion ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Perfect Styling</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools to revolutionize how you shop and style yourself
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your perfect outfit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg text-center relative hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onShowAuth('register')}
              className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-2xl"
            >
              Try It Now - It's Free!
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Fashion Experience?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands using AI to shop smarter and style better
          </p>
          <button
            onClick={() => onShowAuth('register')}
            className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-50 transition-all shadow-2xl inline-flex items-center space-x-3"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Lookbook Pro</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered virtual try-on platform that transforms how you shop and style yourself.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><button onClick={() => onShowAuth('register')} className="hover:text-white transition-colors">Get Started</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><button onClick={() => onShowAuth('login')} className="hover:text-white transition-colors">Sign In</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Lookbook Pro. Powered by Google Gemini AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}