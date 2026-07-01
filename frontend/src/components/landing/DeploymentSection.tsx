'use client';

import { useI18n } from '@/i18n/I18nProvider';

export default function DeploymentSection() {
  const { t } = useI18n();
  const d = t.deploy;

  return (
    <section className="lp-section" id="lp-deploy">
      <div className="lp-deploy-left text-left">
        <div className="lp-section-label">{d.label}</div>
        <h2 className="lp-section-title">{d.title}</h2>
        <p className="lp-section-body">{d.body}</p>
        <div className="lp-deploy-items">
          {d.items.map((item) => (
            <div className="lp-deploy-item" key={item.title}>
              <div className="lp-deploy-icon">{item.icon}</div>
              <div>
                <div className="lp-deploy-item-title">{item.title}</div>
                <div className="lp-deploy-item-body">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="lp-stat-pill">
          <div className="lp-stat-icon">⚡</div>
          <div className="lp-stat-number">48</div>
          <div className="lp-stat-unit">{d.statUnit}</div>
        </div>
      </div>
    </section>
  );
}
