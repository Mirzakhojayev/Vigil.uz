'use client';

import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Download, Filter, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { AuditLogEntry } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* ── Action dot indicator ── */
function ActionIndicator({ action }: { action: string }) {
  let dot = 'status-dot status-dot-muted';
  let label = action.replace(/_/g, ' ');

  if (action.includes('ESCALATE'))   { dot = 'status-dot status-dot-danger'; }
  if (action.includes('APPROVE'))    { dot = 'status-dot status-dot-success'; }
  if (action === 'AGENT_EMAIL')      { dot = 'status-dot status-dot-info'; }
  if (action === 'REPLY_SIMULATED')  { dot = 'status-dot status-dot-info'; }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span className={dot} />
      {label}
    </span>
  );
}

/* ── Severity dot indicator ── */
function SeverityIndicator({ severity }: { severity?: string }) {
  if (!severity) return null;
  const map: Record<string, string> = {
    critical: 'status-dot status-dot-danger',
    high:     'status-dot status-dot-danger',
    medium:   'status-dot status-dot-warning',
    low:      'status-dot status-dot-info',
  };
  const dot = map[severity.toLowerCase()] ?? 'status-dot status-dot-muted';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
      <span className={dot} />
      {severity}
    </span>
  );
}

export default function LogPage() {
  const [logs,           setLogs]           = useState<AuditLogEntry[]>([]);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter,   setActionFilter]   = useState<string>('all');
  const [loading,        setLoading]        = useState(true);

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLog();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchesSearch =
        log.reasoning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (severityFilter !== 'all' && (!log.severity || log.severity.toLowerCase() !== severityFilter)) return false;
      if (actionFilter   !== 'all' && log.action.toLowerCase() !== actionFilter) return false;
      return true;
    });
  };

  const filteredLogs  = getFilteredLogs();
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "vigil_audit_log.json");
    document.body.appendChild(a); a.click(); a.remove();
  };

  const handleExportCSV = () => {
    const headers = ["ID","Timestamp","Actor","Action","Entity Type","Entity ID","Severity","Confidence","Reasoning"];
    const rows = filteredLogs.map(l => [
      l.id, l.timestamp, l.actor, l.action, l.entity_type, l.entity_id,
      l.severity || 'N/A', l.confidence || '1.0',
      `"${l.reasoning.replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.setAttribute("href", url);
    a.setAttribute("download", "vigil_audit_log.csv");
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading audit logs…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[88vh] flex flex-col overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="shrink-0 flex justify-between items-start gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Trail Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable record of all automated and manual procurement decisions.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Download className="h-4 w-4 text-primary" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportJSON}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent text-foreground disabled:opacity-40 cursor-pointer"
          >
            <Download className="h-4 w-4 text-primary" />
            JSON
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <Card className="vigil-card shrink-0 p-4 flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reasoning, actor, entity ID…"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 text-sm h-9"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Risk
          </span>
          <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val || 'all')}>
            <SelectTrigger className="bg-background border border-border rounded-lg text-xs h-9 w-28">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Action
          </span>
          <Select value={actionFilter} onValueChange={(val) => setActionFilter(val || 'all')}>
            <SelectTrigger className="bg-background border border-border rounded-lg text-xs h-9 w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              <SelectItem value="all">All</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* ── Log list ── */}
      <Card className="vigil-card flex-1 p-5 flex flex-col min-h-0 overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity Log</span>
          <span className="text-xs text-muted-foreground">{filteredLogs.length} events</span>
        </div>

        <ScrollArea className="flex-1 pr-1">
          <div className="divide-y divide-border">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-3">
                      <ActionIndicator action={log.action} />
                      <SeverityIndicator severity={log.severity} />
                      <span className="text-xs text-muted-foreground">
                        {log.entity_type.toUpperCase()}: {log.entity_id}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed max-w-4xl">{log.reasoning}</p>
                  </div>
                  <div className="text-right shrink-0 min-w-[120px]">
                    <span className="text-xs text-muted-foreground block">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-xs font-medium text-foreground/70 block mt-0.5">{log.actor}</span>
                    {log.confidence !== undefined && log.confidence !== null && (
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        {Math.round((log.confidence as number) * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No logs match the current filters.
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
