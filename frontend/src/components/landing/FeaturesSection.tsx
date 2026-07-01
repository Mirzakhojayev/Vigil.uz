'use client';

import { motion } from 'framer-motion';
import { Mail, ListChecks, ScanEye, Radar, CopyX, History, Sparkles, ShieldAlert, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { revealProps, staggerContainer, sectionVariants } from './Reveal';

const ACTION_ICONS: LucideIcon[] = [Mail, ListChecks, ScanEye];
const RISK_ICONS: LucideIcon[] = [Radar, CopyX, History];

interface FeatureItemData {
  title: string;
  body: string;
}

function FeatureItems({ items, icons, iconColor }: { items: FeatureItemData[]; icons: LucideIcon[]; iconColor: string }) {
  return (
    <div className="lp-fc-items">
      {items.map((item, i) => {
        const Icon = icons[i];
        return (
          <div className="lp-fc-item" key={item.title}>
            <div className="lp-fc-icon-wrap">
              <Icon className="lp-fc-icon" style={{ color: iconColor }} />
            </div>
            <div className="lp-fc-text">
              <div className="lp-fc-item-title">{item.title}</div>
              <div className="lp-fc-item-body">{item.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FeaturesSection() {
  const { t } = useI18n();
  const f = t.features;
  // Reuse an existing translated stat rather than inventing new copy for the bento cell.
  const bentoStat = t.testimonial.stats[1]; // "Risk monitoring"

  return (
    <motion.section {...revealProps} className="lp-section technical-grid" id="lp-features">
      <div className="lp-section-label">{f.label}</div>
      <h2 className="lp-section-title">{f.title}</h2>
      <p className="lp-section-body">{f.body}</p>

      <motion.div
        className="lp-features-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {/* ACTION LAYER */}
        <motion.div className="lp-feature-card lp-dark" variants={sectionVariants} whileHover={{ y: -4 }}>
          <div className="lp-fc-badge">
            <Sparkles size={14} />
            {f.action.badge}
          </div>
          <h3 className="lp-fc-title">{f.action.title}</h3>
          <p className="lp-fc-body">{f.action.body}</p>
          <FeatureItems items={f.action.items} icons={ACTION_ICONS} iconColor="var(--blue-lt)" />
        </motion.div>

        {/* RISK LAYER */}
        <motion.div className="lp-feature-card lp-light" variants={sectionVariants} whileHover={{ y: -4 }}>
          <div className="lp-fc-badge lp-gray">
            <ShieldAlert size={14} />
            {f.risk.badge}
          </div>
          <h3 className="lp-fc-title">{f.risk.title}</h3>
          <p className="lp-fc-body">{f.risk.body}</p>
          <FeatureItems items={f.risk.items} icons={RISK_ICONS} iconColor="#2563eb" />
        </motion.div>

        {/* BENTO STAT CELL */}
        <motion.div className="lp-feature-stat-card" variants={sectionVariants} whileHover={{ y: -4 }}>
          <div className="lp-feature-stat-val">24/7</div>
          <div className="lp-feature-stat-label">{bentoStat.label}</div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
