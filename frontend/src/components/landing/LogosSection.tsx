'use client';

import { useI18n } from '@/i18n/I18nProvider';

const INTEGRATIONS = [
  'SAP ERP',
  'Oracle NetSuite',
  'Microsoft Dynamics',
  'Sage Intacct',
  'Workday Financials',
];

// Rendered twice back-to-back so the marquee loop (translateX -50%) is seamless.
const LOOPED = [...INTEGRATIONS, ...INTEGRATIONS];

export default function LogosSection() {
  const { t } = useI18n();

  return (
    <div id="lp-logos">
      <p className="lp-logos-label">{t.logos.label}</p>
      <div className="lp-logos-row">
        <div className="lp-logos-track">
          {LOOPED.map((name, i) => (
            <span key={`${name}-${i}`} className="lp-logo-item">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
