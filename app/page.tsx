'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hero,
  Features,
  Analytics,
  ChainOfCustody,
  QualityCompliance,
  FinalCTA,
  Footer,
} from '@/components/landing';
import { LoginModal } from '@/components/shared';
import { useAuth } from '@/contexts';
import { isDemoUser } from '@/lib/utils';

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, supabaseUser, isLoading } = useAuth();

  // Redirect authenticated demo users to settings page
  useEffect(() => {
    if (!isLoading && isAuthenticated && supabaseUser?.email) {
      if (isDemoUser(supabaseUser.email)) {
        router.push('/dashboard/settings');
      }
    }
  }, [isLoading, isAuthenticated, supabaseUser, router]);

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
      <QualityCompliance />
      <FinalCTA onOpenLogin={handleOpenLogin} />
      <Footer />
      
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
        onLogin={handleLogin}
      />
    </main>
  );
}
