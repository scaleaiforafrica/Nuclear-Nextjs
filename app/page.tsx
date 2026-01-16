'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hero,
  Features,
  Analytics,
  ChainOfCustody,
  Footer,
} from '@/components/landing';
import { LoginModal } from '@/components/shared';
import { useAuth } from '@/contexts';
import { isDemoUser } from '@/lib/utils';

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const { user, supabaseUser, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  // Redirect demo users to settings page
  useEffect(() => {
    // Skip if already redirected or still loading
    if (hasRedirected.current || isLoading) return;

    // Check if user is authenticated and is a demo user
    if (supabaseUser?.email && isDemoUser(supabaseUser.email)) {
      hasRedirected.current = true;
      router.push('/dashboard/settings');
    }
  }, [supabaseUser, isLoading, router]);

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const handleLogin = () => {
    setIsLoginOpen(false);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen">
      <Hero onOpenLogin={handleOpenLogin} />
      <Features />
      <Analytics />
      <ChainOfCustody />
      <Footer />
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onLogin={handleLogin}
      />
    </main>
  );
}
