'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { revealProps, staggerContainer, sectionVariants } from './Reveal';

// Fixed product specs (non-translatable); paired by index with the localized
// stat labels in the dictionary.
const STAT_VALUES = ['48h', '24/7', 'AES-256', 'SOC2 II'];

export default function TestimonialSection() {
  const { t } = useI18n();
  const tm = t.testimonial;

  return (
    <motion.section {...revealProps} id="lp-testimonial">
      <div className="lp-section-label">{tm.label}</div>
      <h2 className="lp-section-title">{tm.title}</h2>

      {/* Capability / impact stats — real product specs, no customer claims */}
      <motion.div
        className="lp-proof-stats"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {tm.stats.map((stat, i) => (
          <motion.div className="lp-proof-stat" key={stat.label} variants={sectionVariants}>
            <div className="lp-proof-stat-val">{STAT_VALUES[i]}</div>
            <div className="lp-proof-stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Role-attributed quotes — no invented names or company logos */}
      <motion.div
        className="lp-tm-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {tm.quotes.map((q, i) => (
          <motion.div
            className={`lp-tm-card ${i === 1 ? 'lp-tm-featured' : ''}`}
            key={q.role}
            variants={sectionVariants}
          >
            <div className="lp-stars">
              {Array.from({ length: 5 }).map((_, starI) => (
                <Star key={starI} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="lp-tm-quote">{q.quote}</p>
            <div className="lp-tm-role">{q.role}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
