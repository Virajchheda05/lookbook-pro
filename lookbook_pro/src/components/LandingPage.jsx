// src/components/LandingPage.jsx
// Professional landing page with hero section

import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Camera, Grid, ArrowRight, CheckCircle, Zap } from 'lucide-react';

export default function LandingPage({ onShowAuth }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Eye,
      title: 'AI Virtual Try-On',
      description: 'See yourself in any outfit with hyper-realistic AI technology',
      color: 'from-purple-500 to-pink-500',
      accent: 'purple',
    },
    {
      icon: Grid,
      title: 'Digital Wardrobe',
      description: 'Organize and style your closet with intelligent outfit suggestions',
      color: 'from-blue-500 to-cyan-500',
      accent: 'blue',
    },
    {
      icon: Camera,
      title: 'Globetrotter Studio',
      description: 'Create stunning social content with exotic backgrounds',
      color: 'from-green-500 to-emerald-500',
      accent: 'green',
    },
  ];

  const benefits = [
    { icon: '✨', text: 'Hyper-realistic virtual try-on with quality scoring' },
    { icon: '👗', text: 'Smart outfit builder from your existing wardrobe' },
    { icon: '📸', text: 'Professional background fusion for social media' },
    { icon: '🔗', text: 'Instant product scraping from e-commerce sites' },
    { icon: '📚', text: 'Persistent lookbook gallery with purchase links' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full bg-white/5 backdrop-blur-premium border-b border-white/10 z-50 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-110">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Lookbook Pro</span>
              <p className="text-xs text-purple-200">AI Fashion Platform</p>
            </div>
          </div>
          <button
            onClick={() => onShowAuth('login')}
            className="btn-secondary hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-40 pb-24 px-6 relative z-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white mb-8 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-slide-down">
            <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-medium">✨ AI-Powered Fashion Platform</span>
          </div>
          
          <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            Try Before You Buy,
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-rotate-gradient">
              Style Like a Pro
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            Revolutionary AI virtual try-on platform that fuses fashion e-commerce with content creation. See yourself in any outfit, build complete looks, and create Instagram-ready content—all powered by advanced multimodal AI.
          </p>

          <div className={`flex gap-6 justify-center flex-wrap transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <button
              onClick={() => onShowAuth('register')}
              className="btn-primary text-lg px-10 py-5 shadow-2xl shadow-purple-600/50 hover:shadow-purple-600/70 flex items-center gap-3 group transform hover:scale-110 transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={22} />
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50 transform hover:scale-110 flex items-center gap-2 group"
            >
              <Zap size={20} />
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 px-6 relative z-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Powered by <span className="text-gradient-primary">Advanced AI</span> Technology
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">Cutting-edge features designed to revolutionize your fashion experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group card-premium-elevated hover:shadow-2xl hover:shadow-purple-500/30 overflow-hidden relative transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 ${isLoaded ? 'opacity-100 animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110`}>
                    <feature.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-purple-100 transition-colors">{feature.description}</p>
                  <div className="mt-6 flex items-center text-sm font-semibold text-purple-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Learn More <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-24 px-6 relative z-10 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white text-center mb-8">
            Everything You Need for <span className="text-gradient-primary">Fashion Success</span>
          </h2>
          <p className="text-xl text-purple-200 text-center mb-16 max-w-3xl mx-auto">Comprehensive tools and features to elevate your style game</p>
          
          <div className="card-premium-elevated bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <div className="p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 group animate-slide-up p-4 rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:translate-x-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-3xl flex-shrink-0 mt-1 group-hover:scale-125 transition-transform duration-300">{benefit.icon}</span>
                    <p className="text-lg text-purple-100 group-hover:text-white transition-colors">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-32 px-6 relative z-10 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-premium-elevated card-premium-elevated bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-white/20 backdrop-blur-xl p-12 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your <span className="text-gradient-primary">Fashion Experience?</span>
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 mb-12 leading-relaxed">
              Join thousands of fashion enthusiasts using AI to shop smarter and style better.
            </p>
            <button
              onClick={() => onShowAuth('register')}
              className="btn-primary text-xl px-12 py-6 shadow-2xl shadow-purple-600/50 hover:shadow-purple-600/70 inline-flex items-center gap-3 group transform hover:scale-110 transition-all duration-300"
            >
              Start Your Free Trial
              <Sparkles className="group-hover:animate-spin" size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t border-white/10 relative z-10 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-purple-300">© 2026 Lookbook Pro</p>
              <p className="text-sm text-purple-400">Powered by Google Gemini AI</p>
            </div>
            <div className="flex gap-6 text-purple-300 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
