'use client';

import { useI18n } from '@/i18n/I18nProvider';

interface HeroSectionProps {
  onOpenLogin: () => void;
  onOpenDemo: () => void;
}

export default function HeroSection({ onOpenLogin, onOpenDemo }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section className="lp-section technical-grid" id="lp-hero">
      <div className="lp-hero-left text-left" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="lp-hero-title">{t.hero.title}</h1>
        <p className="lp-hero-body">{t.hero.body}</p>
        <div className="lp-hero-ctas">
          <button className="lp-btn-demo" onClick={onOpenDemo}>
            {t.hero.bookDemo}
          </button>
          <button className="lp-btn-outline" onClick={onOpenLogin}>
            {t.hero.watchOverview}
          </button>
        </div>
        <div className="lp-hero-trust">
          <span>{t.hero.trust.noCard}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.soc2}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.plugPlay}</span>
        </div>
      </div>

      {/* ANIMATED RING VISUAL */}
      <div className="lp-hero-visual" style={{ position: 'relative', zIndex: 1 }}>
        <div className="lp-ring-wrap">
          <div className="lp-ring lp-ring-1"></div>
          <div className="lp-ring lp-ring-2"></div>
          <div className="lp-ring lp-ring-3"></div>
          <div className="lp-orbit-dot lp-dot-1" title="Vertex Node"></div>
          <div className="lp-orbit-dot lp-dot-2" title="Meridian Node"></div>
          <div className="lp-orbit-dot lp-dot-3" title="SteelPoint Node"></div>
          <div className="lp-ring-core">
            <div className="lp-ring-label">
              VIGIL
              <span>{t.hero.ringSub}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
