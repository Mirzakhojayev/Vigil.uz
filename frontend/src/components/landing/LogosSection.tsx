'use client';

import { useI18n } from '@/i18n/I18nProvider';

const INTEGRATIONS = [
  'SAP ERP',
  'Oracle NetSuite',
  'Microsoft Dynamics',
  'Sage Intacct',
  'Workday Financials',
];

export default function LogosSection() {
  const { t } = useI18n();

  return (
    <div id="lp-logos">
      <p className="lp-logos-label">{t.logos.label}</p>
      <div className="lp-logos-row">
        {INTEGRATIONS.map((name) => (
          <span key={name} className="lp-logo-item">{name}</span>
        ))}
      </div>
    </div>
  );
}
