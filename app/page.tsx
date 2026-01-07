'use client';

import { useState } from 'react';
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

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();

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
