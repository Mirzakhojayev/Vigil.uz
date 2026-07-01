'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { localizeInvoices } from '@/lib/landingData';

type InsightTab = 'insight' | 'logs' | 'metadata';
type FilterStatus = 'all' | 'risk' | 'warn';

export default function CommandCenter() {
  const { t } = useI18n();
  const c = t.command;

  const [selectedMockId, setSelectedMockId] = useState('INV-2840');
  const [activeInsightTab, setActiveInsightTab] = useState<InsightTab>('insight');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(247);
  const [risksCount, setRisksCount] = useState(12);
  const [savedAmount, setSavedAmount] = useState(38.4);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const invoices = localizeInvoices(t);
  const filteredInvoices = invoices.filter((inv) => filterStatus === 'all' || inv.status === filterStatus);
  const selectedInvoice = invoices.find((inv) => inv.id === selectedMockId) || invoices[1];

  const handleRunScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMessage(c.scanningMsg);

    setTimeout(() => {
      setIsScanning(false);
      setScannedCount((prev) => prev + 15);
      setRisksCount((prev) => prev + 1);
      setSavedAmount((prev) => parseFloat((prev + 4.2).toFixed(1)));
      setScanMessage(c.scanComplete('INV-2841'));
      setSelectedMockId('INV-2841'); // auto-select the new anomaly

      // Auto clear message after 4s
      setTimeout(() => setScanMessage(null), 4000);
    }, 1500);
  };

  return (
    <section className="lp-section technical-grid" id="lp-command">
      <div className="lp-cmd-header" style={{ position: 'relative', zIndex: 1 }}>
        <div className="lp-section-label">{c.label}</div>
        <h2 className="lp-section-title">{c.title}</h2>
        <p className="lp-section-body">{c.body}</p>
      </div>

      <div className="lp-browser-mock" style={{ position: 'relative', zIndex: 1 }}>
        <div className="lp-browser-bar">
          <span className="lp-browser-dot lp-red"></span>
          <span className="lp-browser-dot lp-yellow"></span>
          <span className="lp-browser-dot lp-green"></span>
          <div className="lp-browser-url">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            vigil.ai/command-center
          </div>
        </div>
        <div className="lp-browser-content">
          <div className="lp-bc-sidebar">
            <div className="lp-bc-sidebar-title">Vigil</div>
            {c.sidebar.map((item, index) => (
              <div key={item} className={`lp-bc-nav-item ${index === 0 ? 'lp-active' : ''}`}>
                <span className="lp-bc-dot" style={{ background: index === 0 ? 'var(--blue-lt)' : 'var(--text-3)' }}></span> {item}
              </div>
            ))}
          </div>
          <div className="lp-bc-main">
            <div className="lp-bc-stats">
              <div className="lp-bc-stat">
                <div className="lp-bc-stat-label">{c.stats.invoices}</div>
                <div className="lp-bc-stat-val lp-blue">{scannedCount}</div>
              </div>
              <div className="lp-bc-stat">
                <div className="lp-bc-stat-label">{c.stats.risks}</div>
                <div className="lp-bc-stat-val lp-green">{risksCount}</div>
              </div>
              <div className="lp-bc-stat">
                <div className="lp-bc-stat-label">{c.stats.saved}</div>
                <div className="lp-bc-stat-val lp-amber">${savedAmount}k</div>
              </div>
            </div>

            {/* Filter and Scan Toolbar */}
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div className="flex gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded cursor-pointer border transition-colors ${filterStatus === 'all' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-border text-[var(--text-3)] bg-transparent'}`}
                >
                  {c.filters.all}
                </button>
                <button
                  onClick={() => setFilterStatus('risk')}
                  className={`px-2.5 py-1 rounded cursor-pointer border transition-colors ${filterStatus === 'risk' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-border text-[var(--text-3)] bg-transparent'}`}
                >
                  {c.filters.risks}
                </button>
                <button
                  onClick={() => setFilterStatus('warn')}
                  className={`px-2.5 py-1 rounded cursor-pointer border transition-colors ${filterStatus === 'warn' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-border text-[var(--text-3)] bg-transparent'}`}
                >
                  {c.filters.warnings}
                </button>
              </div>
              <button
                onClick={handleRunScan}
                disabled={isScanning}
                className="lp-btn-primary py-1 px-3 text-[11px] flex items-center gap-1.5 font-mono shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isScanning ? c.scanning : c.scan}
              </button>
            </div>

            {/* Scan Status Message */}
            {scanMessage && (
              <div className="mb-3 p-2 text-xs font-mono rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-2 animate-pulse">
                <span>⚙</span>
                <span>{scanMessage}</span>
              </div>
            )}

            <div className="lp-bc-table">
              {isScanning && <div className="lp-scanner-line"></div>}
              <div className="lp-bc-table-head">
                <span>{c.table.invoice}</span>
                <span>{c.table.supplier}</span>
                <span>{c.table.amount}</span>
                <span>{c.table.status}</span>
              </div>
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedMockId(inv.id)}
                  className={`lp-bc-table-row ${selectedMockId === inv.id ? 'lp-selected' : ''}`}
                >
                  <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{inv.id}</span>
                  <span style={{ color: 'var(--text-2)' }}>{inv.supplier}</span>
                  <span style={{ fontWeight: 600 }}>{inv.amount}</span>
                  <span>
                    <div className={`lp-bc-badge ${
                      inv.status === 'risk' ? 'lp-risk' :
                      inv.status === 'warn' ? 'lp-warn' : 'lp-ok'
                    }`}>
                      {inv.statusLabel}
                    </div>
                  </span>
                </div>
              ))}
            </div>

            <div className="lp-bc-anomaly text-left">
              {/* Tab Selector */}
              <div className="flex border-b border-[var(--border)] mb-3 gap-4 pb-1 text-[11px] font-mono">
                {([
                  ['insight', c.tabs.insight],
                  ['logs', c.tabs.logs],
                  ['metadata', c.tabs.metadata],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveInsightTab(tab)}
                    className={`pb-1 cursor-pointer border-none bg-transparent hover:text-blue-lt transition-colors ${activeInsightTab === tab ? 'text-blue-lt border-b-2 border-blue-lt font-semibold' : 'text-[var(--text-3)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeInsightTab === 'insight' && (
                <div>
                  <div className="lp-bc-anomaly-title">{selectedInvoice.anomalyTitle} — {selectedInvoice.id}</div>
                  <div className="lp-bc-anomaly-body">{selectedInvoice.anomalyBody}</div>
                </div>
              )}
              {activeInsightTab === 'logs' && (
                <div className="text-[11px] font-mono space-y-1.5 text-[var(--text-2)]">
                  {selectedInvoice.actionLog.map((log, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-blue-lt">⚡</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeInsightTab === 'metadata' && (
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-[var(--text-2)]">
                  <div><span className="text-[var(--text-3)]">{c.meta.category}:</span> {selectedInvoice.metadata.category}</div>
                  <div><span className="text-[var(--text-3)]">{c.meta.erpSync}:</span> <code className="bg-[var(--bg-3)] px-1 py-0.5 rounded text-blue-lt">{selectedInvoice.metadata.erpSyncStatus}</code></div>
                  <div><span className="text-[var(--text-3)]">{c.meta.ceiling}:</span> {selectedInvoice.metadata.contractCeiling}</div>
                  <div><span className="text-[var(--text-3)]">{c.meta.billed}:</span> {selectedInvoice.metadata.billedUnit}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
