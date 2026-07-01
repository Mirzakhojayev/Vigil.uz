import type { Dict } from '@/i18n';

export interface MockInvoice {
  id: string;
  supplier: string;
  amount: string;
  status: 'risk' | 'warn' | 'ok';
  statusLabel: string;
  anomalyTitle: string;
  anomalyBody: string;
  actionLog: string[];
  metadata: {
    contractCeiling: string;
    billedUnit: string;
    category: string;
    erpSyncStatus: string;
  };
}

/**
 * Non-translatable structural fields for the Command Center demo invoices.
 * The translatable text (status label, anomaly copy, action log, category,
 * ERP status) lives in the locale dictionaries and is merged in by
 * {@link localizeInvoices}.
 */
const INVOICE_BASE = [
  { id: 'INV-2841', supplier: 'Vertex Global', amount: '$4,200.00', status: 'risk', contractCeiling: 'N/A (Duplicate Check)', billedUnit: 'N/A' },
  { id: 'INV-2840', supplier: 'Meridian Log.', amount: '$12,850.00', status: 'warn', contractCeiling: '$48.20 / unit', billedUnit: '$54.23 / unit' },
  { id: 'INV-2839', supplier: 'SteelPoint Inc', amount: '$7,100.00', status: 'ok', contractCeiling: '$150.00 / hr', billedUnit: '$150.00 / hr' },
  { id: 'INV-2838', supplier: 'Apex Tech Corp', amount: '$9,340.00', status: 'risk', contractCeiling: 'N/A', billedUnit: 'N/A' },
  { id: 'INV-2837', supplier: 'Nova Energy', amount: '$15,420.00', status: 'ok', contractCeiling: 'Off-Peak Tier', billedUnit: 'Off-Peak Tier' },
] as const;

/** Merges the structural invoice base with the active locale's invoice copy. */
export function localizeInvoices(t: Dict): MockInvoice[] {
  return INVOICE_BASE.map((base) => {
    const tr = t.invoices[base.id];
    return {
      id: base.id,
      supplier: base.supplier,
      amount: base.amount,
      status: base.status,
      statusLabel: tr.statusLabel,
      anomalyTitle: tr.anomalyTitle,
      anomalyBody: tr.anomalyBody,
      actionLog: tr.actionLog,
      metadata: {
        contractCeiling: base.contractCeiling,
        billedUnit: base.billedUnit,
        category: tr.category,
        erpSyncStatus: tr.erpSyncStatus,
      },
    };
  });
}
