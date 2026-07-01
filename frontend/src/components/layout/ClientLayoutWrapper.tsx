'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/i18n/I18nProvider';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/';

  useEffect(() => {
    (() => {
      if (isLoginPage) {
        document.body.classList.remove('overflow-hidden');
        document.body.classList.add('overflow-y-auto');
        setChecking(false);
        return;
      }
      document.body.classList.add('overflow-hidden');
      document.body.classList.remove('overflow-y-auto');

      const auth = localStorage.getItem('vigil_auth');
      if (auth === 'true') {
        setChecking(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/');
      }
    })();
  }, [pathname, isLoginPage, router]);

  if (checking && !isLoginPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <ThemeProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="h-full w-full flex overflow-hidden">
          {/* Sidebar Nav */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 pl-60 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
