'use client';

import { useI18n } from '@/i18n/I18nProvider';

export default function TestimonialSection() {
  const { t } = useI18n();

  return (
    <div id="lp-testimonial">
      <div className="lp-stars">★★★★★</div>
      <p className="lp-quote-text">{t.testimonial.quote}</p>
      <div className="lp-quote-author">
        <div className="lp-author-avatar">SC</div>
        <div className="text-left">
          <div className="lp-author-name">{t.testimonial.name}</div>
          <div className="lp-author-role">{t.testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}
