import React from 'react';

interface AnomalyBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export default function AnomalyBadge({ severity }: AnomalyBadgeProps) {
  const map: Record<string, { dot: string; text: string; pulse?: boolean }> = {
    critical: { dot: 'status-dot status-dot-danger',  text: 'text-red-600 dark:text-red-400',    pulse: true },
    high:     { dot: 'status-dot status-dot-danger',  text: 'text-orange-600 dark:text-orange-400' },
    medium:   { dot: 'status-dot status-dot-warning', text: 'text-amber-600 dark:text-amber-400' },
    low:      { dot: 'status-dot status-dot-info',    text: 'text-blue-600 dark:text-blue-400' },
  };

  const config = map[severity.toLowerCase()] ?? { dot: 'status-dot status-dot-muted', text: 'text-muted-foreground' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${config.text}`}>
      <span className={`${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {severity}
    </span>
  );
}
