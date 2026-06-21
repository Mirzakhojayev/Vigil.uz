import React from 'react';

interface RiskScoreBarProps {
  score: number;
}

export default function RiskScoreBar({ score }: RiskScoreBarProps) {
  let barColor   = 'bg-emerald-500';
  let labelColor = 'text-emerald-600 dark:text-emerald-400';

  if (score > 80) {
    barColor   = 'bg-red-500';
    labelColor = 'text-red-600 dark:text-red-400 font-semibold';
  } else if (score > 50) {
    barColor   = 'bg-orange-400';
    labelColor = 'text-orange-600 dark:text-orange-400';
  } else if (score > 20) {
    barColor   = 'bg-amber-400';
    labelColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Risk</span>
        <span className={`font-semibold tabular-nums ${labelColor}`}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${Math.max(3, score)}%` }}
        />
      </div>
    </div>
  );
}
