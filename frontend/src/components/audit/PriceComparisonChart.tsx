'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

interface PriceComparisonChartProps {
  itemCode: string;
  invoicePrice: number;
  historicalAvg: number;
  deviationPct: number;
}

export default function PriceComparisonChart({
  itemCode,
  invoicePrice,
  historicalAvg,
  deviationPct
}: PriceComparisonChartProps) {
  const { t } = useI18n();
  const c = t.audit.chart;
  // Determine scale
  const maxVal = Math.max(invoicePrice, historicalAvg);
  const histHeight = `${(historicalAvg / maxVal) * 100}%`;
  const invHeight = `${(invoicePrice / maxVal) * 100}%`;

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase">{c.pricingAudit}</span>
          <h4 className="text-xs font-bold text-foreground font-mono mt-0.5">{c.item}: {itemCode}</h4>
        </div>
        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold">
          <TrendingUp className="h-3 w-3" />
          +{deviationPct}%
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="h-32 flex items-end justify-around gap-4 px-4 pt-4 border-b border-border">
        {/* Historical Bar */}
        <div className="flex flex-col items-center gap-1.5 w-1/3 h-full justify-end">
          <span className="text-muted-foreground font-mono font-semibold text-xs">${historicalAvg.toFixed(4)}</span>
          <div 
            className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700/80 rounded-t-lg transition-all duration-300"
            style={{ height: histHeight }}
          />
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">{c.histAvg}</span>
        </div>

        {/* Invoice Bar */}
        <div className="flex flex-col items-center gap-1.5 w-1/3 h-full justify-end">
          <span className="text-rose-500 dark:text-rose-400 font-mono font-bold text-xs">${invoicePrice.toFixed(4)}</span>
          <div 
            className="w-full bg-gradient-to-t from-rose-600 to-rose-400 hover:from-rose-500 hover:to-rose-300 rounded-t-lg shadow transition-all duration-300"
            style={{ height: invHeight }}
          />
          <span className="text-[10px] text-rose-500 dark:text-rose-400 font-mono uppercase tracking-widest mt-1">{c.invoiced}</span>
        </div>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground text-center leading-relaxed">
        {c.alert(historicalAvg.toFixed(4), (invoicePrice - historicalAvg).toFixed(4))}
      </div>
    </div>
  );
}
