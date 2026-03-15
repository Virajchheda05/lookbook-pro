// src/components/LandingPage.jsx
// Professional landing page with hero section

import React from 'react';
import { Sparkles, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function LandingPage({ onShowAuth }) {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Virtual Try-On',
      description: 'See how clothes look on you with hyper-realistic AI in seconds',
    },
    {
      icon: Users,
      title: 'Digital Closet',
      description: 'Organize your wardrobe and discover new outfit combinations',
    },
    {
      icon: TrendingUp,
      title: 'Globetrotter Studio',
      description: 'Create stunning content in exotic destinations instantly',
    },
    {
      icon: Zap,
      title: 'Smart Lookbook',
      description: 'Save your favorite looks with one click for easy sharing',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-tryon rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Lookbook Pro</span>
          </div>
          <button
            onClick={() => onShowAuth('login')}
            className="btn btn-secondary"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              AI-Powered Fashion Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Try Before You Buy, <span className="text-tryon">Style Like a Pro</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Experience revolutionary AI-powered virtual try-on technology. See how any outfit looks on you, build complete looks, and create stunning content—all powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onShowAuth('register')}
              className="btn btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Sign In
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-8">
            No credit card required. Start for free instantly.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Powerful Features, Simple Design
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="card ease-smooth hover:border-gray-300">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-tryon" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Why Choose Lookbook Pro?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Instant Results', desc: 'Get AI-powered try-on results in seconds' },
              { title: 'Smart Organization', desc: 'Manage your wardrobe with intelligent categorization' },
              { title: 'Content Ready', desc: 'Create Instagram-worthy photos instantly' },
              { title: 'Personalized', desc: 'AI learns your style and makes recommendations' },
              { title: 'Shareable', desc: 'Save and share your favorite looks easily' },
              { title: 'No Setup', desc: 'Start creating immediately, no tutorials needed' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-1 bg-tryon rounded-full flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Style?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of fashion enthusiasts who are already using Lookbook Pro
          </p>
          <button
            onClick={() => onShowAuth('register')}
            className="btn btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
          >
            Start Creating Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2026 Lookbook Pro. Powered by AI.</p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 ease-smooth">Privacy</a>
            <a href="#" className="hover:text-gray-900 ease-smooth">Terms</a>
            <a href="#" className="hover:text-gray-900 ease-smooth">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
