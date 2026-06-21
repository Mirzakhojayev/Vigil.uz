'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Play, Mail, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { PurchaseOrder } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/* ── Status indicator — dot + label ── */
function StatusIndicator({ status }: { status: string }) {
  const map: Record<string, { dot: string; label: string }> = {
    paid:      { dot: 'status-dot status-dot-success', label: 'Paid' },
    invoiced:  { dot: 'status-dot status-dot-info',    label: 'Invoiced' },
    shipped:   { dot: 'status-dot status-dot-info',    label: 'Shipped' },
    confirmed: { dot: 'status-dot status-dot-info',    label: 'Confirmed' },
    overdue:   { dot: 'status-dot status-dot-danger',  label: 'Overdue' },
  };
  const { dot, label } = map[status.toLowerCase()] ?? { dot: 'status-dot status-dot-warning', label: 'Pending' };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`${dot} ${status.toLowerCase() === 'overdue' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

export default function OrdersPage() {
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

  useEffect(() => { fetchOrders(); }, []);

  const handleSimulate = async () => {
    if (!selectedOrderId) return;
    setSimulating(true);
    try {
      await api.simulateReply(selectedOrderId, scenario);
      await fetchOrders();
      alert(`Supplier reply simulated. Check Inbox & Agent for email transcripts.`);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
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
          <span className="text-sm text-muted-foreground">Loading purchase orders…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[88vh] flex flex-col overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor procurement statuses, track automated reminders, and simulate supplier replies.
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* PO Table */}
        <Card className="vigil-card lg:col-span-8 p-4 flex flex-col h-full min-h-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
            All Purchase Orders
          </span>
          <ScrollArea className="flex-1 rounded-lg border border-border">
            <Table className="w-full text-xs text-left">
              <TableHeader>
                <TableRow className="bg-muted/50 text-muted-foreground text-[10px] uppercase tracking-wider">
                  <TableHead className="p-3 font-semibold">PO ID</TableHead>
                  <TableHead className="p-3 font-semibold">Supplier</TableHead>
                  <TableHead className="p-3 font-semibold">Delivery Due</TableHead>
                  <TableHead className="p-3 font-semibold text-right">Value</TableHead>
                  <TableHead className="p-3 font-semibold text-center">Reminders</TableHead>
                  <TableHead className="p-3 font-semibold text-center">Status</TableHead>
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
                        <StatusIndicator status={po.status} />
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
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Order Details</span>
                <h3 className="text-sm font-semibold text-foreground mt-1">{selectedOrder.id}</h3>
              </div>

              {/* Quick stats */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5 text-sm">
                {[
                  { label: 'Supplier',           value: selectedOrder.supplier?.name },
                  { label: 'Order Date',         value: selectedOrder.order_date },
                  { label: 'Expected Delivery',  value: selectedOrder.expected_delivery },
                  { label: 'Total Value',        value: `$${selectedOrder.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
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
                  Line Items
                </span>
                <ScrollArea className="border border-border rounded-lg p-3 max-h-36 bg-muted/20">
                  <div className="space-y-2.5 divide-y divide-border">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <div key={item.id || idx} className="pt-2.5 first:pt-0 flex justify-between text-xs">
                          <div>
                            <span className="font-medium text-foreground block">{item.description}</span>
                            <span className="text-muted-foreground">Code: {item.item_code} · Qty: {item.quantity}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground block">${item.unit_price.toFixed(2)}/unit</span>
                            <span className="font-medium text-foreground">${(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No line item detail available.</span>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Notes */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Activity Notes
                </span>
                <ScrollArea className="border border-border rounded-lg p-3 max-h-32 bg-muted/20">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedOrder.notes || 'No activity notes logged.'}
                  </p>
                </ScrollArea>
              </div>

              {/* Simulator */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Simulate Supplier Reply</span>
                </div>
                <Select
                  value={scenario}
                  onValueChange={(val) => setScenario(val || 'shipment_dispatched')}
                  disabled={simulating}
                >
                  <SelectTrigger className="w-full bg-background border border-border rounded-lg text-sm h-9">
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-popover-foreground">
                    <SelectItem value="shipment_dispatched">🟢 Shipment Dispatched</SelectItem>
                    <SelectItem value="delay_weather">🌧️ Weather Delay</SelectItem>
                    <SelectItem value="delay_customs">🛂 Customs Hold</SelectItem>
                    <SelectItem value="dispute_pricing">⚠️ Pricing Dispute</SelectItem>
                    <SelectItem value="partial_shipment">📦 Partial Shipment</SelectItem>
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
                  Simulate Reply
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground text-center">
              Select a purchase order to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
