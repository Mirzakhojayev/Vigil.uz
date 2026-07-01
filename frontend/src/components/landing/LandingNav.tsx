'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/i18n/I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

interface LandingNavProps {
  onOpenLogin: () => void;
  onOpenDemo: () => void;
}

export default function LandingNav({ onOpenLogin, onOpenDemo }: LandingNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
      <a href="#" className="lp-nav-logo">Vigil</a>
      <ul className="lp-nav-links">
        <li><a href="#lp-features">{t.nav.product}</a></li>
        <li><a href="#lp-deploy">{t.nav.solutions}</a></li>
        <li><a href="#lp-command">{t.nav.integrations}</a></li>
        <li><button onClick={onOpenLogin}>{t.nav.signIn}</button></li>
      </ul>
      <div className="lp-nav-right">
        <LanguageSwitcher />
        <button
          onClick={toggleTheme}
          className="lp-theme-btn"
          title={theme === 'dark' ? t.nav.toLight : t.nav.toDark}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
        </button>
        <button className="lp-btn-primary" onClick={onOpenDemo}>{t.nav.bookDemo}</button>
      </div>
    </nav>
  );
}
