// src/components/LandingPage.jsx
// Professional landing page with hero section

import React from 'react';
import { Sparkles, Eye, Camera, Grid, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage({ onShowAuth }) {
  const features = [
    {
      icon: Eye,
      title: 'AI Virtual Try-On',
      description: 'See yourself in any outfit with hyper-realistic AI technology',
    },
    {
      icon: Grid,
      title: 'Digital Wardrobe',
      description: 'Organize and style your closet with intelligent outfit suggestions',
    },
    {
      icon: Camera,
      title: 'Globetrotter Studio',
      description: 'Create stunning social content with exotic backgrounds',
    },
  ];

  const benefits = [
    'Hyper-realistic virtual try-on with quality scoring',
    'Smart outfit builder from your existing wardrobe',
    'Professional background fusion for social media',
    'Instant product scraping from e-commerce sites',
    'Persistent lookbook gallery with purchase links',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-lg border-b border-white/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">Lookbook Pro</span>
          </div>
          <button
            onClick={() => onShowAuth('login')}
            className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6 border border-white/30">
            <Sparkles size={16} />
            <span className="text-sm font-medium">AI-Powered Fashion Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Try Before You Buy,
            <br />
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Style Like a Pro
            </span>
          </h1>
          
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Revolutionary AI virtual try-on platform that fuses fashion e-commerce with 
            content creation. See yourself in any outfit, build complete looks, and create 
            Instagram-ready content—all powered by advanced multimodal AI.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => onShowAuth('register')}
              className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="bg-purple-700/30 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700/50 transition-all border-2 border-white/30"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Powered by Advanced AI Technology
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-100 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Everything You Need for Fashion Success
          </h2>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20">
            <div className="space-y-5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
                  <p className="text-lg text-purple-100">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Transform Your Fashion Experience?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands of fashion enthusiasts using AI to shop smarter and style better.
          </p>
          <button
            onClick={() => onShowAuth('register')}
            className="bg-white text-purple-900 px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-3 group"
          >
            Start Your Free Trial
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center text-purple-200">
          <p>© 2026 Lookbook Pro. Powered by Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}