'use client';

import { LANGUAGES } from '@/i18n';
import { useI18n } from '@/i18n/I18nProvider';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="lp-lang-switch" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`lp-lang-btn ${lang === l.code ? 'lp-lang-active' : ''}`}
          title={l.label}
          aria-pressed={lang === l.code}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
