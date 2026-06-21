'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, RefreshCw, HelpCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { Invoice } from '../../types';
import RiskScoreBar from '../../components/audit/RiskScoreBar';
import FindingDetail from '../../components/audit/FindingDetail';
import AuditActionPanel from '../../components/audit/AuditActionPanel';
import AnomalyBadge from '../../components/audit/AnomalyBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/* ── Status dot indicator ── */
function StatusIndicator({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string }> = {
    approved:  { dot: 'status-dot status-dot-success', label: 'Approved' },
    escalated: { dot: 'status-dot status-dot-danger',  label: 'Escalated' },
    paid:      { dot: 'status-dot status-dot-info',    label: 'Paid' },
  };
  const { dot, label } = map[status] ?? { dot: 'status-dot status-dot-warning', label: 'Pending' };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={dot} />
      {label}
    </span>
  );
}

const FILTER_TABS = [
  { type: 'all',       label: 'All' },
  { type: 'flagged',   label: 'Flagged' },
  { type: 'approved',  label: 'Approved' },
  { type: 'escalated', label: 'Escalated' },
] as const;

export default function AuditPage() {
  const [invoices,          setInvoices]          = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [filterType,        setFilterType]        = useState<'all' | 'flagged' | 'approved' | 'escalated'>('all');
  const [loading,           setLoading]           = useState(true);
  const [recalculating,     setRecalculating]     = useState(false);

  const fetchInvoices = async (autoSelect = false) => {
    try {
      const data = await api.getInvoices();
      setInvoices(data);
      if (data.length > 0) {
        if (autoSelect || !selectedInvoiceId) {
          const defaultSelect = data.find(inv => inv.risk_score >= 15 && inv.status !== 'approved') || data[0];
          setSelectedInvoiceId(defaultSelect.id);
        }
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(true); }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await api.runAudit();
      await fetchInvoices(false);
    } catch (err: any) {
      alert(`Audit scan failed: ${err.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  const getFilteredInvoices = () => {
    return invoices.filter(inv => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.supplier?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.po_id || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'flagged')   return inv.risk_score >= 15 && inv.status !== 'approved';
      if (filterType === 'approved')  return inv.status === 'approved';
      if (filterType === 'escalated') return inv.status === 'escalated';
      return true;
    });
  };

  const filteredInvoices  = getFilteredInvoices();
  const selectedInvoice   = invoices.find(inv => inv.id === selectedInvoiceId);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading audit workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] flex flex-col gap-5 overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Review Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resolve price deviations, duplicate billing, split invoices, and vendor risk scores.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent text-foreground disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-primary ${recalculating ? 'animate-spin' : ''}`} />
          Recalculate Scores
        </Button>
      </div>

      {/* ── 3-Panel Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* Panel 1: Invoice List */}
        <Card className="vigil-card lg:col-span-4 p-4 flex flex-col h-full min-h-0">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice, supplier…"
              className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground h-9"
            />
          </div>

          {/* Filter tabs — underline style */}
          <div className="flex items-center gap-1 border-b border-border mb-4 shrink-0">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.type}
                onClick={() => setFilterType(tab.type as any)}
                className={`px-3 pb-2 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                  filterType === tab.type
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrolling list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const isSelected = inv.id === selectedInvoiceId;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'row-active'
                        : 'bg-card border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-semibold text-foreground block">{inv.id}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5 truncate max-w-[160px]">{inv.supplier?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-foreground block">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <StatusIndicator status={inv.status} />
                      </div>
                    </div>
                    <RiskScoreBar score={inv.risk_score} />
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No invoices match the current filter.
              </div>
            )}
          </div>
        </Card>

        {/* Panel 2: Finding Detail */}
        <Card className="vigil-card lg:col-span-5 p-4 flex flex-col h-full min-h-0">
          {selectedInvoice ? (
            <FindingDetail invoice={selectedInvoice} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">Select an invoice to review findings</span>
            </div>
          )}
        </Card>

        {/* Panel 3: Action Panel */}
        <Card className="vigil-card lg:col-span-3 p-4 flex flex-col h-full min-h-0">
          {selectedInvoice ? (
            <AuditActionPanel invoice={selectedInvoice} onActionComplete={() => fetchInvoices(false)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">Select an invoice to record decisions</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
