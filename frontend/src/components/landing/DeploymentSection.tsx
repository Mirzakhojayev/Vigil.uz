'use client';

import { motion } from 'framer-motion';
import { Link2, Mail, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

// Icons are visual, not translatable — kept alongside the localized copy by index.
const DEPLOY_ICONS: LucideIcon[] = [Link2, Mail, ShieldCheck];

export default function DeploymentSection() {
  const { t } = useI18n();
  const d = t.deploy;

  return (
    <section className="lp-section" id="lp-deploy">
      <motion.div
        className="lp-deploy-left text-left"
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="lp-section-label">{d.label}</div>
        <h2 className="lp-section-title">{d.title}</h2>
        <p className="lp-section-body">{d.body}</p>
        <div className="lp-deploy-items">
          {d.items.map((item, i) => {
            const Icon = DEPLOY_ICONS[i];
            return (
              <div className="lp-deploy-item" key={item.title}>
                <div className="lp-deploy-icon"><Icon size={20} /></div>
                <div>
                  <div className="lp-deploy-item-title">{item.title}</div>
                  <div className="lp-deploy-item-body">{item.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="lp-stat-pill-wrap">
          <div className="lp-stat-pill-ring" />
          <div className="lp-stat-pill">
            <Zap className="lp-stat-icon" size={32} />
            <div className="lp-stat-number">48</div>
            <div className="lp-stat-unit">{d.statUnit}</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
