'use client';

import { useI18n } from '@/i18n/I18nProvider';

export default function LandingFooter() {
  const { t } = useI18n();
  const f = t.footer;

  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">
        <div>
          <div className="lp-footer-brand-name">Vigil</div>
          <p className="lp-footer-brand-desc">{f.brandDesc}</p>
        </div>
        <div>
          <div className="lp-footer-col-title">{f.platform}</div>
          <ul className="lp-footer-links">
            <li><a href="#lp-features">{f.actionLayer}</a></li>
            <li><a href="#lp-features">{f.riskLayer}</a></li>
            <li><a href="#lp-command">{f.integrations}</a></li>
          </ul>
        </div>
        <div>
          <div className="lp-footer-col-title">{f.company}</div>
          <ul className="lp-footer-links">
            <li><a href="#">{f.about}</a></li>
            <li><a href="mailto:contact@vigil.ai">{f.contact}</a></li>
          </ul>
        </div>
      </div>
      <div className="lp-footer-bottom">
        <span>{f.rights}</span>
        <span>{f.bottomTrust}</span>
      </div>
    </footer>
  );
}
