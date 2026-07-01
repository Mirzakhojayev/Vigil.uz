'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { staggerContainer, sectionVariants } from './Reveal';

interface HeroSectionProps {
  onOpenLogin: () => void;
  onOpenDemo: () => void;
}

export default function HeroSection({ onOpenLogin, onOpenDemo }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section className="lp-section technical-grid lp-hero-glow" id="lp-hero">
      <motion.div
        className="lp-hero-left text-left"
        style={{ position: 'relative', zIndex: 1 }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1 className="lp-hero-title" variants={sectionVariants}>{t.hero.title}</motion.h1>
        <motion.p className="lp-hero-body" variants={sectionVariants}>{t.hero.body}</motion.p>
        <motion.div className="lp-hero-ctas" variants={sectionVariants}>
          <button className="lp-btn-demo" onClick={onOpenDemo}>
            {t.hero.bookDemo}
          </button>
          <button className="lp-btn-outline" onClick={onOpenLogin}>
            <Play size={14} fill="currentColor" />
            {t.hero.watchOverview}
          </button>
        </motion.div>
        <motion.div className="lp-hero-trust" variants={sectionVariants}>
          <span>{t.hero.trust.noCard}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.soc2}</span>
          <span className="lp-trust-dot"></span>
          <span>{t.hero.trust.plugPlay}</span>
        </motion.div>
      </motion.div>

      {/* ANIMATED RING VISUAL */}
      <motion.div
        className="lp-hero-visual"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      >
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
      </motion.div>
    </section>
  );
}
