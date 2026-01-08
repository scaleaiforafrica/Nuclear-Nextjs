'use client';

import { ArrowRight, Menu } from 'lucide-react';

export interface HeroProps {
  onOpenLogin: () => void;
}

export function Hero({ onOpenLogin }: HeroProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg"></div>
          <span>NuclearFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Platform</a>
          <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Solutions</a>
          <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Resources</a>
          <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Company</a>
        </div>
        <button 
          onClick={onOpenLogin}
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          Get Started
        </button>
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200">
            <span className="text-purple-600">✨ Next-Gen Medical Logistics Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl tracking-tight">
            Revolutionizing<br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Nuclear Medicine
            </span><br />
            Logistics
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time tracking, automated compliance, and intelligent routing for radiopharmaceutical delivery
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onOpenLogin}
              className="bg-purple-600 text-white px-8 py-4 rounded-full hover:bg-purple-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white text-gray-800 px-8 py-4 rounded-full hover:bg-gray-50 transition-all border border-gray-200">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
    </div>
  );
}
