'use client';

import { useState, useEffect } from 'react';
import './landing.css';

import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import LogosSection from '@/components/landing/LogosSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CommandCenter from '@/components/landing/CommandCenter';
import DeploymentSection from '@/components/landing/DeploymentSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import CtaSection from '@/components/landing/CtaSection';
import LandingFooter from '@/components/landing/LandingFooter';
import LoginModal from '@/components/landing/LoginModal';
import BookDemoModal from '@/components/landing/BookDemoModal';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    (() => {
      setMounted(true);
      // Clear previous auth state on landing
      localStorage.removeItem('vigil_auth');
    })();
  }, []);

  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  const openLogin = () => setIsLoginOpen(true);
  const openDemo = () => setIsDemoOpen(true);

  return (
    <div className="w-full shrink-0 flex-1 min-h-screen bg-background text-on-surface antialiased relative flex flex-col transition-colors duration-300">
      <div className="lp-container w-full shrink-0 flex-1 min-h-screen relative flex flex-col">
        <LandingNav onOpenLogin={openLogin} onOpenDemo={openDemo} />
        <HeroSection onOpenLogin={openLogin} onOpenDemo={openDemo} />
        <LogosSection />
        <FeaturesSection />
        <CommandCenter />
        <DeploymentSection />
        <TestimonialSection />
        <CtaSection onOpenDemo={openDemo} />
        <LandingFooter />
      </div>

      {/* Modals */}
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isDemoOpen && <BookDemoModal onClose={() => setIsDemoOpen(false)} />}
    </div>
  );
}
