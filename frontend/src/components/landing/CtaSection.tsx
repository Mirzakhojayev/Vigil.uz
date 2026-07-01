'use client';

import { useI18n } from '@/i18n/I18nProvider';

interface CtaSectionProps {
  onOpenDemo: () => void;
}

export default function CtaSection({ onOpenDemo }: CtaSectionProps) {
  const { t } = useI18n();

  return (
    <section className="lp-section" id="lp-cta">
      <h2 className="lp-cta-title">{t.cta.title}</h2>
      <p className="lp-cta-body">{t.cta.body}</p>
      <div className="lp-cta-btns">
        <button className="lp-btn-cta-white" onClick={onOpenDemo}>{t.cta.schedule}</button>
        <button className="lp-btn-cta-outline" onClick={onOpenDemo}>{t.cta.talk}</button>
      </div>
      <div className="lp-cta-trust">
        <span>{t.hero.trust.noCard}</span>
        <span className="lp-trust-dot"></span>
        <span>{t.hero.trust.soc2}</span>
        <span className="lp-trust-dot"></span>
        <span>{t.hero.trust.plugPlay}</span>
      </div>
    </section>
  );
}
