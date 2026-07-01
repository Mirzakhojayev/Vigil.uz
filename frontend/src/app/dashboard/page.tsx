'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Play, 
  Activity, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';
import { AuditSummary, AuditLogEntry } from '../../types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/i18n/I18nProvider';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/* ── Status dot helper ── */
function statusDot(variant: 'success' | 'warning' | 'danger' | 'info' | 'muted') {
  const cls: Record<string, string> = {
    success: 'status-dot status-dot-success',
    warning: 'status-dot status-dot-warning',
    danger:  'status-dot status-dot-danger',
    info:    'status-dot status-dot-info',
    muted:   'status-dot status-dot-muted',
  };
  return <span className={cls[variant]} />;
}

function getLogVariant(action: string): 'danger' | 'success' | 'info' | 'muted' | 'warning' {
  if (action.includes('ESCALATE'))    return 'danger';
  if (action.includes('APPROVE'))     return 'success';
  if (action === 'AGENT_EMAIL')       return 'info';
  if (action === 'REPLY_SIMULATED')   return 'muted';
  return 'muted';
}

export default function Dashboard() {
  const { t } = useI18n();
  const d = t.dashboard;
  const [summary,      setSummary]      = useState<AuditSummary | null>(null);
  const [recentLogs,   setRecentLogs]   = useState<AuditLogEntry[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [auditRunning, setAuditRunning] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [banner,       setBanner]       = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const fetchDashboardData = async () => {
    try {
      const sumData = await api.getAuditSummary();
      const logs    = await api.getAuditLog();
      setSummary(sumData);
      setRecentLogs(logs.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchDashboardData();
    })();
  }, []);

  const showBanner = (type: 'ok' | 'err', msg: string) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner(null), 5000);
  };

  const triggerAuditScan = async () => {
    setAuditRunning(true);
    try {
      await api.runAudit();
      await fetchDashboardData();
      showBanner('ok', d.banners.auditOk);
    } catch (err) {
      showBanner('err', d.banners.auditErr(errorMessage(err)));
    } finally {
      setAuditRunning(false);
    }
  };

  const triggerAgentCycle = async () => {
    setAgentRunning(true);
    try {
      const res = await api.runAgentCycle();
      await fetchDashboardData();
      showBanner('ok', d.banners.agentOk(res.emails_drafted.length));
    } catch (err) {
      showBanner('err', d.banners.agentErr(errorMessage(err)));
    } finally {
      setAgentRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{d.loading}</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { name: d.kpis.total.name,    value: summary?.total_invoices || 0,  icon: FileText,     variant: 'info'    as const, description: d.kpis.total.desc },
    { name: d.kpis.pending.name,  value: summary?.pending_human  || 0,  icon: AlertTriangle,variant: 'warning' as const, description: d.kpis.pending.desc },
    { name: d.kpis.approved.name, value: summary?.auto_approved  || 0,  icon: CheckCircle2, variant: 'success' as const, description: d.kpis.approved.desc },
    {
      name: d.kpis.spend.name,
      value: `$${(summary?.total_spend_under_review || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      variant: 'danger' as const,
      description: d.kpis.spend.desc
    },
  ];

  const iconColour: Record<string, string> = {
    info:    'text-blue-500',
    warning: 'text-amber-500',
    success: 'text-emerald-500',
    danger:  'text-red-500',
  };

  return (
    <div className="space-y-8 w-full">

      {/* ── Inline banner ── */}
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
            banner.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300'
          }`}
        >
          {banner.type === 'ok' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {banner.msg}
        </motion.div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{d.header.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {d.header.desc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={triggerAuditScan}
            disabled={auditRunning || agentRunning}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-border bg-card hover:bg-accent text-foreground disabled:opacity-50 cursor-pointer"
          >
            {auditRunning
              ? <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              : <ShieldCheck className="h-4 w-4 text-primary" />
            }
            {d.actions.runAudit}
          </Button>

          <Button
            onClick={triggerAgentCycle}
            disabled={auditRunning || agentRunning}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {agentRunning
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : <Play className="h-4 w-4 fill-current" />
            }
            {d.actions.runAgent}
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
          >
            <Card className="vigil-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{kpi.name}</span>
                <kpi.icon className={`h-4 w-4 ${iconColour[kpi.variant]}`} />
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">{kpi.description}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Middle row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RAG promo */}
        <Card className="vigil-card lg:col-span-2 p-6 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{d.rag.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {d.rag.desc}
              </p>
              <div className="mt-2 space-y-0.5">
                <span className="text-sm text-primary block italic">&ldquo;{d.rag.example1}&rdquo;</span>
                <span className="text-sm text-primary block italic">&ldquo;{d.rag.example2}&rdquo;</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <Link
              href="/ask"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {d.rag.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Severity breakdown */}
        <Card className="vigil-card p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {d.severity.title}
          </h3>
          <div className="space-y-3.5">
            {[
              { name: d.severity.critical, count: summary?.severity_counts?.critical || 0, variant: 'danger'   as const, barColor: 'bg-red-500' },
              { name: d.severity.high,     count: summary?.severity_counts?.high     || 0, variant: 'warning'  as const, barColor: 'bg-amber-500' },
              { name: d.severity.medium,   count: summary?.severity_counts?.medium   || 0, variant: 'warning'  as const, barColor: 'bg-yellow-400' },
              { name: d.severity.low,      count: summary?.severity_counts?.low      || 0, variant: 'info'     as const, barColor: 'bg-blue-400' },
            ].map(item => {
              const maxCount = Math.max(1, ...Object.values(summary?.severity_counts || {}));
              const widthPct = `${Math.min(100, (item.count / maxCount) * 100)}%`;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {statusDot(item.variant)}
                      {item.name}
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.barColor} opacity-70`}
                      style={{ width: item.count > 0 ? widthPct : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Activity Logs ── */}
      <Card className="vigil-card p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {d.activity.title}
          </h3>
          <Link href="/log" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            {d.activity.viewAll}
          </Link>
        </div>

        <div className="divide-y divide-border">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => {
              const variant = getLogVariant(log.action);
              return (
                <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 shrink-0">{statusDot(variant)}</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">{log.entity_type.toUpperCase()}: {log.entity_id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{log.reasoning}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right pl-6">
                    <span className="text-xs text-muted-foreground block">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-xs font-medium text-foreground/70 block mt-0.5">{log.actor}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {d.activity.empty}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
