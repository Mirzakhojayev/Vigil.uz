'use client';

import { LANGUAGES } from '@/i18n';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Compact language switcher styled with the app's design tokens (used in the
 * authenticated sidebar). The landing page has its own `lp-`-styled switcher.
 */
export default function AppLanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg border border-sidebar-border bg-sidebar-accent/50"
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          title={l.label}
          aria-pressed={lang === l.code}
          className={`flex-1 py-1 rounded-md text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
            lang === l.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
