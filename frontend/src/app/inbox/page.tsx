'use client';

import React, { useState, useEffect } from 'react';
import { Mail, ArrowUpRight, ArrowDownLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { AgentEmail } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/i18n/I18nProvider';
import type { Dict } from '@/i18n';

/* ── Tone label — inline text, no pill ── */
function ToneLabel({ tone, ib }: { tone?: string; ib: Dict['inbox'] }) {
  if (!tone) return null;
  const dotMap: Record<string, string> = {
    friendly: 'status-dot status-dot-success',
    firm:     'status-dot status-dot-warning',
    urgent:   'status-dot status-dot-danger',
  };
  const key = tone.toLowerCase();
  const dot = dotMap[key];
  const label = (ib.tone as Record<string, string>)[key];
  if (!dot || !label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`${dot} ${key === 'urgent' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

export default function InboxPage() {
  const { t } = useI18n();
  const ib = t.inbox;
  const [emails,          setEmails]          = useState<AgentEmail[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [loading,         setLoading]         = useState(true);

  const fetchEmails = async () => {
    try {
      const data = await api.getEmails();
      setEmails(data);
      if (data.length > 0 && selectedEmailId === null) setSelectedEmailId(data[0].id);
    } catch (err) {
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchEmails();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{ib.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[88vh] flex flex-col overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="shrink-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{ib.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ib.desc}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchEmails}
          className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent text-foreground cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 text-primary" />
          {ib.refresh}
        </Button>
      </div>

      {/* ── Split-screen grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* Email list */}
        <Card className="vigil-card lg:col-span-5 p-4 flex flex-col h-full min-h-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            {ib.outbox}
          </span>

          <ScrollArea className="flex-1 pr-1">
            <div className="space-y-2">
              {emails.length > 0 ? (
                emails.map((email) => {
                  const isSelected = email.id === selectedEmailId;
                  const isInbound  = email.direction === 'inbound';
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'row-active'
                          : 'bg-card border-border hover:bg-accent/50'
                      }`}
                    >
                      {/* Subject & date */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                          {email.subject}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(email.sent_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Direction + supplier + tone */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                            isInbound ? 'text-sky-600 dark:text-sky-400' : 'text-primary'
                          }`}>
                            {isInbound
                              ? <ArrowDownLeft className="h-3 w-3" />
                              : <ArrowUpRight  className="h-3 w-3" />
                            }
                            {isInbound ? ib.inbound : ib.outbound}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[110px]">
                            {email.supplier?.name}
                          </span>
                        </div>
                        {!isInbound && <ToneLabel tone={email.tone} ib={ib} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {ib.empty}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Message thread pane */}
        <Card className="vigil-card lg:col-span-7 p-5 flex flex-col h-full min-h-0">
          {selectedEmail ? (
            <div className="flex flex-col h-full gap-5">

              {/* Email metadata */}
              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-base font-semibold text-foreground leading-snug">{selectedEmail.subject}</h3>
                  {selectedEmail.direction === 'outbound'
                    ? <ToneLabel tone={selectedEmail.tone} ib={ib} />
                    : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="status-dot status-dot-info" />
                        {ib.simulatedReply}
                      </span>
                    )
                  }
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">{ib.from}</span>
                    <span className="text-foreground">
                      {selectedEmail.direction === 'inbound' ? selectedEmail.supplier?.name : ib.agentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">{ib.to}</span>
                    <span className="text-foreground">
                      {selectedEmail.direction === 'inbound' ? ib.agentName : selectedEmail.supplier?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">{ib.sent}</span>
                    <span className="text-foreground">{new Date(selectedEmail.sent_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">{ib.poReference}</span>
                    <span className="text-foreground font-medium">{selectedEmail.po_id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <Card className="flex-1 bg-muted/20 border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-full p-5 text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {selectedEmail.body}
                </ScrollArea>
              </Card>

              {/* Compliance note */}
              <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-lg px-4 py-3 text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {ib.complianceNote}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Mail className="h-8 w-8 text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">{ib.selectToRead}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
