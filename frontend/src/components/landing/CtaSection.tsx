'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';
import { revealProps, staggerContainer, sectionVariants } from './Reveal';

interface CtaSectionProps {
  onOpenDemo: () => void;
}

export default function CtaSection({ onOpenDemo }: CtaSectionProps) {
  const { t } = useI18n();

  return (
    <motion.section {...revealProps} className="lp-section" id="lp-cta">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.h2 className="lp-cta-title" variants={sectionVariants}>{t.cta.title}</motion.h2>
        <motion.p className="lp-cta-body" variants={sectionVariants}>{t.cta.body}</motion.p>
        <motion.div className="lp-cta-btns" variants={sectionVariants}>
          <motion.button
            className="lp-btn-cta-white"
            onClick={onOpenDemo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.cta.schedule}
          </motion.button>
          <motion.button
            className="lp-btn-cta-outline"
            onClick={onOpenDemo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.cta.talk}
          </motion.button>
        </motion.div>
        <motion.div className="lp-cta-trust" variants={sectionVariants}>
          <span>{t.hero.trust.noCard}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.soc2}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.plugPlay}</span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
