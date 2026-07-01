'use client';

import React, { useState, useEffect } from 'react';
import { Play, Mail, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { PurchaseOrder } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/i18n/I18nProvider';
import type { Dict } from '@/i18n';

/* ── Status indicator — dot + label ── */
function StatusIndicator({ status, o }: { status: string; o: Dict['orders'] }) {
  const dotMap: Record<string, string> = {
    paid:      'status-dot status-dot-success',
    invoiced:  'status-dot status-dot-info',
    shipped:   'status-dot status-dot-info',
    confirmed: 'status-dot status-dot-info',
    overdue:   'status-dot status-dot-danger',
  };
  const key = status.toLowerCase();
  const statusLabels = o.status as Record<string, string>;
  const dot = dotMap[key] ?? 'status-dot status-dot-warning';
  const label = statusLabels[key] ?? o.status.pending;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`${dot} ${key === 'overdue' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

export default function OrdersPage() {
  const { t } = useI18n();
  const o = t.orders;
  const [orders,          setOrders]          = useState<PurchaseOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [scenario,        setScenario]        = useState('shipment_dispatched');
  const [loading,         setLoading]         = useState(true);
  const [simulating,      setSimulating]      = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrderId) setSelectedOrderId(data[0].id);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchOrders();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSimulate = async () => {
    if (!selectedOrderId) return;
    setSimulating(true);
    try {
      await api.simulateReply(selectedOrderId, scenario);
      await fetchOrders();
      alert(o.simulateOk);
    } catch (err) {
      alert(o.simulateFailed(err instanceof Error ? err.message : String(err)));
    } finally {
      setSimulating(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{o.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[88vh] flex flex-col overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{o.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {o.desc}
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* PO Table */}
        <Card className="vigil-card lg:col-span-8 p-4 flex flex-col h-full min-h-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            {o.allOrders}
          </span>
          <ScrollArea className="flex-1 rounded-lg border border-border">
            <Table className="w-full text-xs text-left">
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider">
                  <TableHead className="p-3 font-semibold">{o.table.poId}</TableHead>
                  <TableHead className="p-3 font-semibold">{o.table.supplier}</TableHead>
                  <TableHead className="p-3 font-semibold">{o.table.delivery}</TableHead>
                  <TableHead className="p-3 font-semibold text-right">{o.table.value}</TableHead>
                  <TableHead className="p-3 font-semibold text-center">{o.table.reminders}</TableHead>
                  <TableHead className="p-3 font-semibold text-center">{o.table.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {orders.map((po) => {
                  const isSelected = po.id === selectedOrderId;
                  return (
                    <TableRow
                      key={po.id}
                      onClick={() => setSelectedOrderId(po.id)}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        isSelected ? 'row-active' : ''
                      }`}
                    >
                      <TableCell className="p-3 font-medium text-foreground">{po.id}</TableCell>
                      <TableCell className="p-3 text-foreground">
                        {po.supplier?.name}
                        <span className="text-[10px] text-muted-foreground block">{po.supplier?.category}</span>
                      </TableCell>
                      <TableCell className="p-3 text-muted-foreground">{po.expected_delivery}</TableCell>
                      <TableCell className="p-3 text-right font-medium text-foreground">
                        ${po.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        {po.reminder_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <Mail className="h-3 w-3" />
                            {po.reminder_count}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <StatusIndicator status={po.status} o={o} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Detail Panel */}
        <Card className="vigil-card lg:col-span-4 p-5 flex flex-col h-full min-h-0 overflow-y-auto">
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Header */}
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{o.details}</span>
                <h3 className="text-sm font-semibold text-foreground mt-1">{selectedOrder.id}</h3>
              </div>

              {/* Quick stats */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5 text-sm">
                {[
                  { label: o.stats.supplier, value: selectedOrder.supplier?.name },
                  { label: o.stats.orderDate, value: selectedOrder.order_date },
                  { label: o.stats.delivery, value: selectedOrder.expected_delivery },
                  { label: o.stats.total, value: `$${selectedOrder.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Line items */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  {o.lineItems}
                </span>
                <ScrollArea className="border border-border rounded-lg p-3 max-h-36 bg-muted/20">
                  <div className="space-y-2.5 divide-y divide-border">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={item.id || idx} className="pt-2.5 first:pt-0 flex justify-between text-xs">
                          <div>
                            <span className="font-medium text-foreground block">{item.description}</span>
                            <span className="text-muted-foreground">{o.itemMeta(item.item_code, item.quantity)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground block">${item.unit_price.toFixed(2)}{o.perUnit}</span>
                            <span className="font-medium text-foreground">${(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">{o.noLineItems}</span>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Notes */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  {o.activityNotes}
                </span>
                <ScrollArea className="border border-border rounded-lg p-3 max-h-32 bg-muted/20">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedOrder.notes || o.noNotes}
                  </p>
                </ScrollArea>
              </div>

              {/* Simulator */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{o.simulateTitle}</span>
                </div>
                <Select
                  value={scenario}
                  onValueChange={(val) => setScenario(val || 'shipment_dispatched')}
                  disabled={simulating}
                >
                  <SelectTrigger className="w-full bg-background border border-border rounded-lg text-sm h-9">
                    <SelectValue placeholder={o.scenarioPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="shipment_dispatched">{o.scenarios.shipment_dispatched}</SelectItem>
                    <SelectItem value="delay_weather">{o.scenarios.delay_weather}</SelectItem>
                    <SelectItem value="delay_customs">{o.scenarios.delay_customs}</SelectItem>
                    <SelectItem value="dispute_pricing">{o.scenarios.dispute_pricing}</SelectItem>
                    <SelectItem value="partial_shipment">{o.scenarios.partial_shipment}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {simulating
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Play className="h-4 w-4 fill-current" />
                  }
                  {o.simulateBtn}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
              {o.selectToView}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
