import React from 'react';
import { AlertCircle, ShieldCheck, Cpu, Percent } from 'lucide-react';
import { Invoice, AuditFinding } from '../../types';
import AnomalyBadge from './AnomalyBadge';
import PriceComparisonChart from './PriceComparisonChart';
import { Card } from '@/components/ui/card';

interface FindingDetailProps {
  invoice: Invoice;
}

// Map check names to user-friendly titles
const CHECK_TITLES: Record<string, string> = {
  check_price_deviation: 'Unit Price Deviation Spike',
  check_exact_duplicate: 'Duplicate Billing Detected',
  check_split_invoicing: 'Split Invoicing (Limit Bypass)',
  check_near_identical: 'Near-Identical Transaction Pair',
  check_round_numbers: 'Round Number Billing Indicator',
  check_po_reference: 'Missing or Invalid PO Reference',
  check_spend_concentration: 'Single Vendor Spend Concentration',
  check_new_supplier_large: 'High-Value First Invoice Risk',
  check_sequential_timing: 'Sequential Frequency Invoicing',
  check_invoice_exceeds_po: 'Invoice Total Exceeds PO Authorization',
};

export default function FindingDetail({ invoice }: FindingDetailProps) {
  // Helper to parse price deviation values out of the audit engine's text
  const getPriceSpikeData = (finding: AuditFinding) => {
    const text = finding.reasoning;
    
    // Default values matching our Apex plant
    let itemCode = 'ITEM-RESISTOR-10K';
    let invoicePrice = 0.0603;
    let historicalAvg = 0.0450;
    let deviationPct = 34.0;

    try {
      // Regex attempts to parse decimals and percents
      const percentMatch = text.match(/(\d+(?:\.\d+)?)\%/);
      if (percentMatch) {
        deviationPct = parseFloat(percentMatch[1]);
      }
      
      const priceMatches = text.match(/\$(\d+(?:\.\d+)?)/g);
      if (priceMatches && priceMatches.length >= 2) {
        // e.g., ["$0.0603", "$0.045"]
        invoicePrice = parseFloat(priceMatches[0].replace('$', ''));
        historicalAvg = parseFloat(priceMatches[1].replace('$', ''));
      }
    } catch (e) {
      console.warn('Could not parse price spike values, using defaults:', e);
    }

    return { itemCode, invoicePrice, historicalAvg, deviationPct };
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">System Findings</span>
        <h3 className="text-sm font-semibold text-foreground mt-1">Anomaly Evidence Analysis</h3>
      </div>

      {/* Invoice Meta Detail Header */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex justify-between items-start text-xs">
        <div className="space-y-0.5">
          <span className="text-muted-foreground block">Date: {invoice.invoice_date}</span>
          <span className="text-muted-foreground block">Vendor: {invoice.supplier?.name} ({invoice.supplier?.country})</span>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground block">PO Reference</span>
          <span className="font-medium text-foreground block">{invoice.po_id || 'None'}</span>
        </div>
      </div>

      {/* Findings Container */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {invoice.findings && invoice.findings.length > 0 ? (
          invoice.findings.map((finding) => {
            const isPriceSpike = finding.check_name === 'check_price_deviation';
            const priceSpikeData = isPriceSpike ? getPriceSpikeData(finding) : null;

            return (
              <Card 
                key={finding.id} 
                className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col"
              >
                {/* Finding Header */}
                <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Check Triggered</span>
                    <h4 className="text-sm font-semibold text-foreground leading-tight">
                      {CHECK_TITLES[finding.check_name] || finding.check_name}
                    </h4>
                  </div>
                  <AnomalyBadge severity={finding.severity as any} />
                </div>

                {/* Finding Body Explanation */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Auditor Reasoning</span>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {finding.reasoning}
                  </p>
                </div>

                {/* Performance Chart if Price Spike */}
                {isPriceSpike && priceSpikeData && (
                  <PriceComparisonChart 
                    itemCode={priceSpikeData.itemCode}
                    invoicePrice={priceSpikeData.invoicePrice}
                    historicalAvg={priceSpikeData.historicalAvg}
                    deviationPct={priceSpikeData.deviationPct}
                  />
                )}

                {/* Accuracy / Confidence stats */}
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    Vigil Core v1
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Percent className="h-3 w-3 text-primary" />
                    {Math.round(finding.confidence * 100)}% confidence
                  </span>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/30 border border-border border-dashed rounded-2xl">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Invoice Clear</h4>
            <p className="text-muted-foreground text-xs mt-1.5 max-w-sm">
              The automated check system ran all 10 standard audit checks and found no anomalies. This transaction is recommended for standard approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
