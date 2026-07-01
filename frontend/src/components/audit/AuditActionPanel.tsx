'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, MessageSquare, Send, User, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { Invoice, AuditLogEntry } from '../../types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/i18n/I18nProvider';

interface AuditActionPanelProps {
  invoice: Invoice;
  onActionComplete: () => void;
}

export default function AuditActionPanel({ invoice, onActionComplete }: AuditActionPanelProps) {
  const { t } = useI18n();
  const ap = t.audit.action;
  const statusLabels = t.audit.status as Record<string, string>;
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionHistory, setActionHistory] = useState<AuditLogEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch log history for this specific invoice
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const logs = await api.getAuditLog();
      // Filter log entries that belong to this invoice
      const filtered = logs.filter(log => log.entity_id === invoice.id && log.entity_type === 'invoice');
      // Sort with newest first
      setActionHistory(filtered);
    } catch (err) {
      console.error('Error fetching audit log history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchHistory();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.id]);

  const handleAction = async (action: 'approve' | 'escalate' | 'note') => {
    if (action === 'note' && !noteText.trim()) return;
    
    setSubmitting(true);
    try {
      await api.performAuditAction(invoice.id, action, noteText);
      setNoteText('');
      await fetchHistory();
      onActionComplete();
    } catch (err) {
      alert(ap.actionFailed(err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Panel Title */}
      <div>
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{ap.decisionCenter}</span>
        <h3 className="text-sm font-semibold text-foreground mt-1">{ap.panelTitle}</h3>
      </div>

      {/* Quick Status Info */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{ap.statusLabel}</span>
          <span className={`font-medium ${
            invoice.status === 'approved'  ? 'text-emerald-500' :
            invoice.status === 'escalated' ? 'text-red-500'     : 'text-amber-500'
          }`}>
            {statusLabels[invoice.status] ?? invoice.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{ap.amountLabel}</span>
          <span className="font-semibold text-foreground">
            ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Decision Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleAction('approve')}
          disabled={submitting || invoice.status === 'approved'}
          className="flex items-center justify-center gap-2 h-9 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15 border border-emerald-500/30 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4" />
          {ap.approve}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleAction('escalate')}
          disabled={submitting || invoice.status === 'escalated'}
          className="flex items-center justify-center gap-2 h-9 text-sm font-medium text-red-600 dark:text-red-400 bg-red-500/8 hover:bg-red-500/15 border border-red-500/30 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
        >
          <AlertOctagon className="h-4 w-4" />
          {ap.escalate}
        </Button>
      </div>

      {/* Add Audit Notes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          {ap.addNote}
        </label>
        <div className="relative">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={submitting}
            placeholder={ap.notePlaceholder}
            rows={4}
            className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none placeholder:text-muted-foreground/60 pr-12"
          />
          <Button
            variant="ghost"
            onClick={() => handleAction('note')}
            disabled={submitting || !noteText.trim()}
            className="absolute bottom-2.5 right-2.5 p-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 cursor-pointer h-8 w-8 flex items-center justify-center"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Audit Action Timeline (History) */}
      <div className="flex-1 flex flex-col min-h-[180px]">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{ap.decisionHistory}</span>
        <ScrollArea className="flex-1 bg-muted/20 border border-border rounded-lg p-4 relative">
          {historyLoading && actionHistory.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : actionHistory.length > 0 ? (
            <div className="relative border-l border-border ml-2.5 pl-5 space-y-5">
              {actionHistory.map((log) => {
                let dotColor = 'bg-slate-500';
                if (log.action.includes('ESCALATE')) dotColor = 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
                if (log.action.includes('APPROVE')) dotColor = 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
                if (log.action === 'ADD_NOTE') dotColor = 'bg-indigo-400 shadow-[0_0_8px_#818cf8]';

                return (
                  <div key={log.id} className="relative group text-xs">
                    {/* Circle timeline indicator */}
                    <span className={`absolute -left-[26px] top-1 h-3.5 w-3.5 rounded-full border border-background ${dotColor}`} />
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mb-0.5">
                      <span className="font-semibold text-muted-foreground uppercase">{log.action.replace('_', ' ')}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <p className="text-foreground/90 font-sans leading-relaxed">
                      {log.reasoning}
                    </p>
                    
                    <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground mt-1">
                      <User className="h-3 w-3" />
                      <span>{log.actor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-mono text-center px-4 py-8">
              {ap.noHistory}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
