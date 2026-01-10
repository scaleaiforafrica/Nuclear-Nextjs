'use client';

import { X, Mail, Lock, Github, Chrome } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { AnimatedLogo } from '@/components';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signUp } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await signUp(email, password)
        : await login(email, password);

      if (result.success) {
        if (isSignUp) {
          setSuccessMessage('Account created! Please check your email to confirm.');
          setEmail('');
          setPassword('');
        } else {
          setEmail('');
          setPassword('');
          onLogin();
        }
      } else {
        setError(result.error || (isSignUp ? 'Sign up failed.' : 'Login failed.') + ' Please try again.');
        // If error suggests email verification needed, show gentle message
        if (!isSignUp && result.error?.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300 overflow-hidden flex flex-col safe-area-inset-bottom">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10 touch-manipulation min-w-[44px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Header */}
          <div className="p-6 sm:p-8 pb-4 sm:pb-6">
            <div className="mb-4 sm:mb-6">
              <AnimatedLogo size="md" showIcon={true} />
            </div>

            <h2 id="login-modal-title" className="text-2xl sm:text-3xl mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isSignUp ? 'Sign up to access your dashboard' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="px-6 sm:px-8 pb-4 sm:pb-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Chrome className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" />
                <span className="text-sm">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Github className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700" />
                <span className="text-sm">GitHub</span>
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 my-4 sm:my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">or continue with email</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="space-y-3 sm:space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm mb-1.5 sm:mb-2 text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-base touch-manipulation"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm mb-1.5 sm:mb-2 text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-base touch-manipulation"
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  />
                </div>
              </div>

              {/* Forgot Password */}
              {!isSignUp && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-purple-600 hover:text-purple-700 transition-colors py-1 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600" role="alert">
                  {successMessage}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}

              {/* Terms for Sign Up */}
              {isSignUp && (
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-purple-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-purple-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Privacy Policy</a>
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation min-h-[44px] text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {isSubmitting ? 'Signing in...' : (isSignUp ? 'Create account' : 'Sign in')}
              </button>
            </div>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-600 hover:text-purple-700 transition-colors font-medium touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        {/* Decorative Gradient */}
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      </div>
    </div>
  );
}
