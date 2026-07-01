'use client';

import { useI18n } from '@/i18n/I18nProvider';

// Icons are visual, not translatable — kept alongside the localized copy by index.
const ACTION_ICONS = ['✉', '☰', '◎'];
const RISK_ICONS = ['◎', '▣', '⬡'];

interface FeatureItemData {
  title: string;
  body: string;
}

function FeatureItems({ items, icons, iconColor }: { items: FeatureItemData[]; icons: string[]; iconColor: string }) {
  return (
    <div className="lp-fc-items">
      {items.map((item, i) => (
        <div className="lp-fc-item" key={item.title}>
          <div className="lp-fc-icon-wrap">
            <span className="lp-fc-icon" style={{ color: iconColor }}>{icons[i]}</span>
          </div>
          <div className="lp-fc-text">
            <div className="lp-fc-item-title">{item.title}</div>
            <div className="lp-fc-item-body">{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturesSection() {
  const { t } = useI18n();
  const f = t.features;

  return (
    <section className="lp-section technical-grid" id="lp-features">
      <div className="lp-section-label">{f.label}</div>
      <h2 className="lp-section-title">{f.title}</h2>
      <p className="lp-section-body">{f.body}</p>

      <div className="lp-features-grid">
        {/* ACTION LAYER */}
        <div className="lp-feature-card lp-dark">
          <div className="lp-fc-badge">{f.action.badge}</div>
          <h3 className="lp-fc-title">{f.action.title}</h3>
          <p className="lp-fc-body">{f.action.body}</p>
          <FeatureItems items={f.action.items} icons={ACTION_ICONS} iconColor="var(--blue-lt)" />
        </div>

        {/* RISK LAYER */}
        <div className="lp-feature-card lp-light">
          <div className="lp-fc-badge lp-gray">{f.risk.badge}</div>
          <h3 className="lp-fc-title">{f.risk.title}</h3>
          <p className="lp-fc-body">{f.risk.body}</p>
          <FeatureItems items={f.risk.items} icons={RISK_ICONS} iconColor="#2563eb" />
        </div>
      </div>
    </section>
  );
}
