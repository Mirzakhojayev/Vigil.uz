'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LoginModal from '../components/landing/LoginModal';
import BookDemoModal from '../components/landing/BookDemoModal';
import { useLanguage } from '../context/LanguageContext';

interface MockInvoice {
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

const mockInvoices: MockInvoice[] = [
  {
    id: 'INV-2841',
    supplier: 'Vertex Global',
    amount: '$4,200.00',
    status: 'risk',
    statusLabel: '⚠ Duplicate',
    anomalyTitle: 'Potential Duplicate Payment Blocked',
    anomalyBody: 'Identical amount ($4,200.00) and metadata match INV-2790 processed 3 days ago. ERP disbursement hold placed automatically.',
    actionLog: [
      '09:42 AM - Transaction ingested from SAP',
      '09:42 AM - Risk Engine flagged high fuzzy-match similarity with INV-2790',
      '09:43 AM - Automated hold placed on ERP disbursement',
      '09:43 AM - Notification dispatched to Audit Queue'
    ],
    metadata: {
      contractCeiling: 'N/A (Duplicate Check)',
      billedUnit: 'N/A',
      category: 'IT Hardware',
      erpSyncStatus: 'DISBURSEMENT_HOLD'
    }
  },
  {
    id: 'INV-2840',
    supplier: 'Meridian Log.',
    amount: '$12,850.00',
    status: 'warn',
    statusLabel: '↑ +12.5%',
    anomalyTitle: 'Contract Price Variance Detected',
    anomalyBody: 'Unit price deviation of 12.5% detected on electronics category. Contract ceiling is $48.20/unit; billed at $54.23/unit. Auto-email drafted to Meridian Logistics.',
    actionLog: [
      '08:15 AM - Ingested invoice INV-2840 from email stream',
      '08:16 AM - Line-item parser extracted unit price of $54.23',
      '08:16 AM - Matched with Master Services Agreement (MSA-2025-V2)',
      '08:17 AM - Automated reconciliation draft prepared for Supplier'
    ],
    metadata: {
      contractCeiling: '$48.20 / unit',
      billedUnit: '$54.23 / unit',
      category: 'Electronics Logistics',
      erpSyncStatus: 'REVIEW_REQUIRED'
    }
  },
  {
    id: 'INV-2839',
    supplier: 'SteelPoint Inc',
    amount: '$7,100.00',
    status: 'ok',
    statusLabel: '✓ Clear',
    anomalyTitle: 'Verification Passed',
    anomalyBody: 'Invoice amounts, item quantities, and bank routing numbers match Purchase Order PO-9081 and Goods Received Note GRN-112. No action required.',
    actionLog: [
      '07:30 AM - Ingested transaction from NetSuite',
      '07:30 AM - 3-way match validation successful',
      '07:31 AM - Route details & bank details verified',
      '07:31 AM - Auto-approved for payment run'
    ],
    metadata: {
      contractCeiling: '$150.00 / hr',
      billedUnit: '$150.00 / hr',
      category: 'Raw Steel Materials',
      erpSyncStatus: 'AUTO_APPROVED'
    }
  },
  {
    id: 'INV-2838',
    supplier: 'Apex Tech Corp',
    amount: '$9,340.00',
    status: 'risk',
    statusLabel: '⚠ Unapproved PO',
    anomalyTitle: 'Unapproved Purchase Order Bypass',
    anomalyBody: 'Invoice submitted without a valid pre-approved Purchase Order in ERP. Supplier has bypassed procurement guardrails.',
    actionLog: [
      '06:12 AM - Invoice received via API gateway',
      '06:12 AM - PO reference lookup failed in NetSuite database',
      '06:13 AM - Flagged as out-of-compliance procurement',
      '06:13 AM - Sent alert to Department Head for manual override'
    ],
    metadata: {
      contractCeiling: 'N/A',
      billedUnit: 'N/A',
      category: 'Software Licenses',
      erpSyncStatus: 'BLOCKED'
    }
  },
  {
    id: 'INV-2837',
    supplier: 'Nova Energy',
    amount: '$15,420.00',
    status: 'ok',
    statusLabel: '✓ Clear',
    anomalyTitle: 'Verification Passed',
    anomalyBody: 'Utilities invoice matched with utility telemetry data. Billing tier corresponds to off-peak contract rates.',
    actionLog: [
      'Yesterday - Monthly billing statement parsed',
      'Yesterday - Matched with building IoT consumption telemetry',
      'Yesterday - Approved for automatic payment run'
    ],
    metadata: {
      contractCeiling: 'Off-Peak Tier',
      billedUnit: 'Off-Peak Tier',
      category: 'Utility Services',
      erpSyncStatus: 'AUTO_APPROVED'
    }
  }
];

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Dashboard Interactivity States
  const [selectedMockId, setSelectedMockId] = useState('INV-2840');
  const [activeInsightTab, setActiveInsightTab] = useState<'insight' | 'logs' | 'metadata'>('insight');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCount, setScannedCount] = useState(247);
  const [risksCount, setRisksCount] = useState(12);
  const [savedAmount, setSavedAmount] = useState(38.4);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'risk' | 'warn'>('all');

  const handleRunScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMessage(t('commandCenter.scanning'));
    
    setTimeout(() => {
      setIsScanning(false);
      setScannedCount(prev => prev + 15);
      setRisksCount(prev => prev + 1);
      setSavedAmount(prev => parseFloat((prev + 4.2).toFixed(1)));
      setScanMessage(t('commandCenter.scanComplete', { id: 'INV-2841' }));
      setSelectedMockId('INV-2841'); // auto-select the new anomaly
      
      // Auto clear message after 4s
      setTimeout(() => {
        setScanMessage(null);
      }, 4000);
    }, 1500);
  };

  // Localize mock invoices dynamically
  const { translations } = require('../context/translations');
  const localizedInvoices = mockInvoices.map(inv => {
    const locInv = translations[language]?.invoices?.[inv.id];
    if (locInv) {
      return {
        ...inv,
        statusLabel: locInv.statusLabel || inv.statusLabel,
        anomalyTitle: locInv.anomalyTitle || inv.anomalyTitle,
        anomalyBody: locInv.anomalyBody || inv.anomalyBody,
        actionLog: locInv.actionLog || inv.actionLog,
        metadata: {
          ...inv.metadata,
          category: locInv.category || inv.metadata.category,
          erpSyncStatus: locInv.erpSyncStatus || inv.metadata.erpSyncStatus
        }
      };
    }
    return inv;
  });

  const filteredInvoices = localizedInvoices.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const selectedInvoice = localizedInvoices.find(inv => inv.id === selectedMockId) || localizedInvoices[1];

  useEffect(() => {
    setMounted(true);
    // Clear previous auth state on landing
    localStorage.removeItem('vigil_auth');
  }, []);


  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  return (
    <div className="w-full shrink-0 flex-1 min-h-screen bg-background text-on-surface antialiased relative flex flex-col transition-colors duration-300">
      
      {/* ── STYLE TAG EMBED FOR THE LANDING PAGE DESIGN ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-0:    #ffffff;
          --bg-1:    #f8fafc;
          --bg-2:    #f1f5f9;
          --bg-3:    #e2e8f0;
          --blue:    #2563eb;
          --blue-lt: #3b82f6;
          --blue-dk: #1d4ed8;
          --text-1:  #0f172a;
          --text-2:  #475569;
          --text-3:  #64748b;
          --border:  rgba(0,0,0,0.08);
          --border-h: rgba(0,0,0,0.14);
          --radius:  12px;
        }

        .dark {
          --bg-0:    #08090d;
          --bg-1:    #0f1117;
          --bg-2:    #15181f;
          --bg-3:    #1e2230;
          --text-1:  #f1f5f9;
          --text-2:  #94a3b8;
          --text-3:  #64748b;
          --border:  rgba(255,255,255,0.08);
          --border-h: rgba(255,255,255,0.14);
        }

        .lp-container {
          background: var(--bg-0);
          color: var(--text-1);
          line-height: 1.6;
        }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%;
          background: var(--bg-0);
          opacity: 0.98;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .lp-nav-logo {
          font-size: 18px; font-weight: 700; color: var(--text-1);
          text-decoration: none; letter-spacing: -0.3px;
        }
        .lp-nav-links {
          display: flex; align-items: center; gap: 2px;
          list-style: none;
        }
        .lp-nav-links a {
          padding: 6px 14px;
          color: var(--text-2); font-size: 14px; font-weight: 450;
          text-decoration: none; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .lp-nav-links a:hover { color: var(--text-1); background: rgba(255,255,255,0.06); }
        .lp-nav-links button {
          padding: 6px 14px;
          color: var(--text-2); font-size: 14px; font-weight: 450;
          background: none; border: none; cursor: pointer; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .lp-nav-links button:hover { color: var(--text-1); background: rgba(255,255,255,0.06); }
        .lp-nav-right { display: flex; align-items: center; gap: 10px; }
        .lp-btn-ghost {
          padding: 7px 16px; border-radius: 8px;
          border: none; background: none;
          color: var(--text-2); font-size: 14px; font-family: inherit;
          cursor: pointer; transition: color 0.15s, background 0.15s;
        }
        .lp-btn-ghost:hover { color: var(--text-1); background: rgba(255,255,255,0.06); }
        .lp-btn-primary {
          padding: 8px 20px; border-radius: 8px;
          background: var(--blue); border: none;
          color: #fff; font-size: 14px; font-weight: 500; font-family: inherit;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
        }
        .lp-btn-primary:hover { background: var(--blue-lt); }
        .lp-btn-primary:active { transform: scale(0.97); }
        .lp-theme-btn {
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg-2);
          color: var(--text-2); font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.15s;
        }
        .lp-theme-btn:hover { border-color: var(--border-h); color: var(--text-1); }

        /* ── TECHNICAL NET GRID MESH ── */
        .technical-grid {
          position: relative;
        }
        .technical-grid::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image: 
            linear-gradient(to right, rgba(37,99,235,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(37,99,235,0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 85%);
        }
        .dark .technical-grid::before {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
        }

        /* ── SECTIONS ── */
        .lp-section { padding: 100px 5%; position: relative; z-index: 1; }

        /* ── HERO ── */
        #lp-hero {
          min-height: 100vh; padding-top: 130px; padding-bottom: 80px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center; gap: 60px;
          width: 100%;
        }
        .lp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 12px; border-radius: 20px;
          border: 1px solid rgba(37,99,235,0.3);
          background: rgba(37,99,235,0.08);
          color: var(--blue-lt); font-size: 13px; font-weight: 500;
          margin-bottom: 28px;
        }
        .lp-hero-eyebrow .lp-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--blue-lt);
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .lp-hero-title {
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700; line-height: 1.15;
          letter-spacing: -1.5px; margin-bottom: 24px;
        }
        .lp-hero-title .lp-accent { color: var(--blue-lt); }
        .lp-hero-body {
          font-size: 18px; color: var(--text-2);
          line-height: 1.7; margin-bottom: 40px;
          max-width: 480px;
        }
        .lp-hero-ctas { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .lp-btn-demo {
          padding: 12px 28px; border-radius: 10px;
          background: var(--blue); border: none;
          color: #fff; font-size: 15px; font-weight: 500; font-family: inherit;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .lp-btn-demo:hover { background: var(--blue-lt); }
        .lp-btn-demo:active { transform: scale(0.97); }
        .lp-btn-outline {
          padding: 11px 28px; border-radius: 10px;
          background: none; border: 1px solid var(--border-h);
          color: var(--text-1); font-size: 15px; font-family: inherit;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .lp-btn-outline:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .lp-hero-trust {
          margin-top: 28px; color: var(--text-3); font-size: 13px;
          display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
        }
        .lp-trust-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-3); }

        /* Hero right — animated ring graphic */
        .lp-hero-visual {
          display: flex; align-items: center; justify-content: center;
        }
        .lp-ring-wrap {
          position: relative; width: 380px; height: 380px;
        }
        /* Animated orbit dots */
        .lp-orbit-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          margin-top: -4px;
          margin-left: -4px;
          z-index: 2;
        }
        .lp-dot-1 {
          background: var(--blue-lt);
          box-shadow: 0 0 10px var(--blue-lt);
          animation: lp-orbit-1 20s linear infinite;
        }
        .lp-dot-2 {
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: lp-orbit-2 30s linear infinite;
        }
        .lp-dot-3 {
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
          animation: lp-orbit-3 15s linear infinite;
        }
        @keyframes lp-orbit-1 {
          from { transform: rotate(0deg) translateX(190px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(190px) rotate(-360deg); }
        }
        @keyframes lp-orbit-2 {
          from { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(150px) rotate(0deg); }
        }
        @keyframes lp-orbit-3 {
          from { transform: rotate(0deg) translateX(110px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(110px) rotate(-360deg); }
        }
        .lp-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(37,99,235,0.18);
          animation: lp-spin-slow linear infinite;
        }
        .lp-ring-1 { inset: 0; animation-duration: 30s; }
        .lp-ring-2 { inset: 40px; border-color: rgba(37,99,235,0.12); animation-duration: 50s; animation-direction: reverse; }
        .lp-ring-3 { inset: 80px; border-color: rgba(37,99,235,0.08); animation-duration: 20s; }
        @keyframes lp-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .lp-ring-core {
          position: absolute; inset: 120px;
          border-radius: 50%; border: 1px solid rgba(37,99,235,0.3);
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-ring-label {
          text-align: center;
          font-size: 13px; font-weight: 600; color: var(--blue-lt);
          letter-spacing: 0.5px;
        }
        .lp-ring-label span { display: block; font-size: 10px; color: var(--text-3); font-weight: 400; margin-top: 2px; letter-spacing: 1.5px; text-transform: uppercase; }

        /* ── LOGOS ── */
        #lp-logos {
          padding: 50px 5%;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg-1);
          width: 100%;
        }
        .lp-logos-label {
          text-align: center; font-size: 12px; font-weight: 500;
          color: var(--text-3); letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 28px;
        }
        .lp-logos-row {
          display: flex; align-items: center; justify-content: center;
          gap: 60px; flex-wrap: wrap;
        }
        .lp-logo-item {
          font-size: 15px; font-weight: 600; color: var(--text-3);
          letter-spacing: -0.3px; transition: color 0.2s;
        }
        .lp-logo-item:hover { color: var(--text-2); }

        /* ── FEATURES ── */
        #lp-features { background: var(--bg-1); width: 100%; }
        .lp-section-label {
          font-size: 12px; font-weight: 600; color: var(--blue-lt);
          letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;
        }
        .lp-section-title {
          font-size: clamp(28px, 3.5vw, 42px); font-weight: 700;
          line-height: 1.15; letter-spacing: -1px; margin-bottom: 16px;
        }
        .lp-section-body {
          font-size: 17px; color: var(--text-2); line-height: 1.7;
          max-width: 560px; margin-bottom: 56px;
        }
        .lp-features-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        .lp-feature-card {
          padding: 32px; border-radius: var(--radius);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .lp-feature-card:hover { border-color: var(--border-h); }
        .lp-feature-card.lp-dark { background: var(--bg-2); }
        
        .lp-feature-card.lp-light { background: #fff; border-color: #e2e8f0; }
        .lp-feature-card.lp-light .lp-fc-title { color: #0f172a; }
        .lp-feature-card.lp-light .lp-fc-body { color: #475569; }
        .lp-feature-card.lp-light .lp-fc-item-title { color: #1e293b; }
        .lp-feature-card.lp-light .lp-fc-item-body { color: #64748b; }
        .lp-feature-card.lp-light .lp-fc-icon-wrap { background: #f1f5f9; border-color: #e2e8f0; }
        .lp-feature-card.lp-light .lp-fc-icon { color: #2563eb; }

        .lp-fc-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 10px; border-radius: 8px;
          border: 1px solid rgba(37,99,235,0.25);
          background: rgba(37,99,235,0.1);
          font-size: 12px; font-weight: 600; color: var(--blue-lt);
          margin-bottom: 20px;
        }
        .lp-fc-badge.lp-gray {
          background: rgba(148,163,184,0.08);
          border-color: rgba(148,163,184,0.18);
          color: var(--text-2);
        }
        .lp-fc-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.4px; }
        .lp-fc-body { font-size: 14px; color: var(--text-2); line-height: 1.6; margin-bottom: 28px; }
        .lp-fc-items { display: flex; flex-direction: column; gap: 16px; }
        .lp-fc-item { display: flex; align-items: flex-start; gap: 14px; text-align: left; }
        .lp-fc-icon-wrap {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-fc-icon { font-size: 16px; }
        .lp-fc-text { flex: 1; }
        .lp-fc-item-title { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
        .lp-fc-item-body { font-size: 13px; color: var(--text-2); line-height: 1.5; }

        /* ── COMMAND CENTER ── */
        #lp-command { background: var(--bg-0); width: 100%; }
        .lp-cmd-header { text-align: center; margin-bottom: 56px; }
        .lp-cmd-header .lp-section-body { margin: 0 auto; }
        .lp-browser-mock {
          border-radius: 14px; border: 1px solid var(--border);
          background: var(--bg-2); overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
          text-align: left;
        }
        .lp-browser-bar {
          height: 40px; background: var(--bg-3);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px; padding: 0 16px;
        }
        .lp-browser-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-browser-dot.lp-red { background: #ef4444; }
        .lp-browser-dot.lp-yellow { background: #f59e0b; }
        .lp-browser-dot.lp-green { background: #22c55e; }
        .lp-browser-url {
          flex: 1; max-width: 260px; margin: 0 auto;
          height: 24px; background: var(--bg-0); border-radius: 6px;
          border: 1px solid var(--border); font-size: 12px; color: var(--text-3);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .lp-browser-content {
          display: grid; grid-template-columns: 220px 1fr; gap: 0;
        }
        .lp-bc-sidebar {
          border-right: 1px solid var(--border); padding: 16px;
          background: var(--bg-1);
        }
        .lp-bc-sidebar-title { font-size: 10px; font-weight: 600; color: var(--text-3); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
        .lp-bc-nav-item {
          padding: 8px 10px; border-radius: 7px; margin-bottom: 2px;
          font-size: 13px; color: var(--text-2); cursor: pointer;
          display: flex; align-items: center; gap: 8px;
        }
        .lp-bc-nav-item.lp-active { background: rgba(37,99,235,0.12); color: var(--blue-lt); }
        .lp-bc-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .lp-bc-main { padding: 16px; }
        .lp-bc-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;
        }
        .lp-bc-stat {
          padding: 12px 14px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg-0);
        }
        .lp-bc-stat-label { font-size: 10px; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; }
        .lp-bc-stat-val { font-size: 18px; font-weight: 700; line-height: 1; }
        .lp-bc-stat-val.lp-blue { color: var(--blue-lt); }
        .lp-bc-stat-val.lp-green { color: #22c55e; }
        .lp-bc-stat-val.lp-amber { color: #f59e0b; }
        .lp-bc-table { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position: relative; }
        .lp-bc-table-head {
          display: grid; grid-template-columns: 100px 1fr 100px 110px;
          gap: 0; padding: 0;
          background: var(--bg-3); border-bottom: 1px solid var(--border);
          font-size: 10px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.8px;
        }
        .lp-bc-table-head > span {
          padding: 8px 12px;
          border-right: 1px solid var(--border);
        }
        .lp-bc-table-head > span:last-child {
          border-right: none;
        }
        .lp-bc-table-row {
          display: grid; grid-template-columns: 100px 1fr 100px 110px;
          gap: 0; padding: 0;
          border-bottom: 1px solid var(--border); font-size: 12px;
          align-items: stretch; transition: all 0.2s ease;
          cursor: pointer;
        }
        .lp-bc-table-row > span {
          padding: 10px 12px;
          border-right: 1px solid var(--border);
          display: flex;
          align-items: center;
        }
        .lp-bc-table-row > span:last-child {
          border-right: none;
        }
        .lp-bc-table-row:last-child { border-bottom: none; }
        .lp-bc-table-row:hover { background: rgba(37,99,235,0.04) !important; }
        .lp-bc-table-row.lp-selected {
          background: rgba(37,99,235,0.08) !important;
          position: relative;
        }
        .lp-bc-table-row.lp-selected::after {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--blue-lt);
          box-shadow: 0 0 8px var(--blue-lt);
        }
        
        /* Scanner line */
        .lp-scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue-lt), transparent);
          box-shadow: 0 0 10px var(--blue-lt), 0 0 20px var(--blue-lt);
          animation: lp-scan-move 1.5s ease-in-out infinite;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes lp-scan-move {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .lp-bc-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500;
        }
        .lp-bc-badge.lp-risk { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
        .lp-bc-badge.lp-ok { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .lp-bc-badge.lp-warn { background: rgba(245,158,11,0.1); color: #fbbf24; border: 1px solid rgba(245,158,11,0.2); }
        .lp-bc-anomaly {
          margin-top: 12px; padding: 12px 14px; border-radius: 8px;
          border: 1px solid rgba(37,99,235,0.2); background: rgba(37,99,235,0.06);
        }
        .lp-bc-anomaly-title { font-size: 11px; font-weight: 600; color: var(--blue-lt); margin-bottom: 4px; }
        .lp-bc-anomaly-body { font-size: 12px; color: var(--text-2); line-height: 1.5; }

        /* ── DEPLOYMENT ── */
        #lp-deploy {
          background: var(--bg-1);
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
          width: 100%;
        }
        .lp-deploy-items { display: flex; flex-direction: column; gap: 24px; margin-top: 36px; text-align: left; }
        .lp-deploy-item { display: flex; align-items: flex-start; gap: 16px; }
        .lp-deploy-icon {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          border: 1px solid var(--border); background: var(--bg-2);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .lp-deploy-item-title { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .lp-deploy-item-body { font-size: 14px; color: var(--text-2); line-height: 1.6; }
        .lp-stat-pill {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 220px; height: 220px; border-radius: 50%;
          border: 1px solid rgba(37,99,235,0.2);
          background: rgba(37,99,235,0.05);
          margin: 0 auto;
        }
        .lp-stat-icon { font-size: 36px; margin-bottom: 8px; }
        .lp-stat-number { font-size: 38px; font-weight: 700; color: var(--blue-lt); line-height: 1; }
        .lp-stat-unit { font-size: 14px; color: var(--text-3); margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; }

        /* ── TESTIMONIAL ── */
        #lp-testimonial {
          text-align: center;
          background: #fff; color: #0f172a; padding: 80px 5%; width: 100%;
        }
        .lp-stars { font-size: 22px; color: var(--blue); margin-bottom: 28px; }
        .lp-quote-text {
          font-size: clamp(18px, 2.5vw, 22px); font-weight: 500; color: #1e293b;
          line-height: 1.6; max-width: 680px; margin: 0 auto 36px; font-style: italic;
        }
        .lp-quote-author { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .lp-author-avatar {
          width: 48px; height: 48px; border-radius: 50%; overflow: hidden;
          background: #e2e8f0; display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: #475569; font-size: 16px;
        }
        .lp-author-name { font-size: 15px; font-weight: 600; color: #1e293b; }
        .lp-author-role { font-size: 13px; color: #64748b; margin-top: 1px; }

        /* ── CTA ── */
        #lp-cta {
          background: var(--blue); text-align: center; padding: 100px 5%; width: 100%;
        }
        .lp-cta-title {
          font-size: clamp(26px, 3.5vw, 44px); font-weight: 700;
          line-height: 1.2; letter-spacing: -1px; margin-bottom: 20px;
          max-width: 600px; margin-left: auto; margin-right: auto;
          color: #fff;
        }
        .lp-cta-body {
          font-size: 18px; color: rgba(255,255,255,0.75);
          max-width: 480px; margin: 0 auto 40px; line-height: 1.7;
        }
        .lp-cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .lp-btn-cta-white {
          padding: 13px 30px; border-radius: 10px;
          background: #fff; border: none;
          color: var(--blue-dk); font-size: 15px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
        }
        .lp-btn-cta-white:hover { background: #f1f5f9; }
        .lp-btn-cta-white:active { transform: scale(0.97); }
        .lp-btn-cta-outline {
          padding: 12px 30px; border-radius: 10px;
          background: none; border: 2px solid rgba(255,255,255,0.4);
          color: #fff; font-size: 15px; font-weight: 500; font-family: inherit;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .lp-btn-cta-outline:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.08); }
        .lp-cta-trust {
          margin-top: 24px; font-size: 13px; color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap;
        }
        .lp-cta-trust .lp-trust-dot { background: rgba(255,255,255,0.4); }

        /* ── FOOTER ── */
        .lp-footer {
          background: var(--bg-1); border-top: 1px solid var(--border);
          padding: 60px 5% 40px; width: 100%; text-align: left;
        }
        .lp-footer-grid {
          display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; margin-bottom: 48px;
        }
        .lp-footer-brand-name { font-size: 17px; font-weight: 700; margin-bottom: 12px; }
        .lp-footer-brand-desc { font-size: 14px; color: var(--text-3); line-height: 1.6; max-width: 260px; }
        .lp-footer-col-title { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 14px; }
        .lp-footer-links { list-style: none; display: flex; flex-direction: column; gap: 8px; padding: 0; }
        .lp-footer-links a { font-size: 14px; color: var(--text-3); text-decoration: none; transition: color 0.15s; }
        .lp-footer-links a:hover { color: var(--text-1); }
        .lp-footer-bottom {
          border-top: 1px solid var(--border); padding-top: 24px;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
          font-size: 13px; color: var(--text-3);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          #lp-hero { grid-template-columns: 1fr; text-align: center; }
          .lp-hero-body { margin-left: auto; margin-right: auto; }
          .lp-hero-ctas { justify-content: center; }
          .lp-hero-trust { justify-content: center; }
          .lp-hero-visual { display: none; }
          .lp-features-grid { grid-template-columns: 1fr; }
          #lp-deploy { grid-template-columns: 1fr; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
          .lp-browser-content { grid-template-columns: 1fr; }
          .lp-bc-sidebar { display: none; }
        }
        @media (max-width: 600px) {
          .lp-nav { padding: 0 4%; }
          .lp-nav-links { display: none; }
          .lp-section { padding: 70px 4%; }
          .lp-footer-grid { grid-template-columns: 1fr; }
        }
      `}} />

      {/* Main Wrapper */}
      <div className="lp-container w-full shrink-0 flex-1 min-h-screen relative flex flex-col">
        
        {/* NAVBAR */}
        <nav className="lp-nav">
          <a href="#" className="lp-nav-logo">Vigil</a>
          <ul className="lp-nav-links">
            <li><a href="#lp-features">Product</a></li>
            <li><a href="#lp-deploy">Solutions</a></li>
            <li><a href="#lp-command">Integrations</a></li>
            <li><button onClick={() => setIsLoginOpen(true)}>Sign In</button></li>
          </ul>
          <div className="lp-nav-right">
            <button
              onClick={toggleTheme}
              className="lp-theme-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
            </button>
            <button className="lp-btn-primary" onClick={() => setIsDemoOpen(true)}>Book a Demo</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-section technical-grid" id="lp-hero">
          <div className="lp-hero-left text-left" style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="lp-hero-title">
              The first Action &amp; Risk layer that plugs directly into your existing financial workflow.
            </h1>
            <p className="lp-hero-body">
              No new cards. No infrastructure changes. Just total visibility — protecting your margins in real-time before errors exit your ERP.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-demo" onClick={() => setIsDemoOpen(true)}>
                Book a Demo →
              </button>
              <button className="lp-btn-outline" onClick={() => setIsLoginOpen(true)}>
                ▶ Watch 2-min Overview
              </button>
            </div>
            <div className="lp-hero-trust">
              <span>No credit card required</span>
              <span className="lp-trust-dot"></span>
              <span>SOC2 Compliant</span>
              <span className="lp-trust-dot"></span>
              <span>Plug-and-play</span>
            </div>
          </div>

          {/* ANIMATED RING VISUAL */}
          <div className="lp-hero-visual" style={{ position: 'relative', zIndex: 1 }}>
            <div className="lp-ring-wrap">
              <div className="lp-ring lp-ring-1"></div>
              <div className="lp-ring lp-ring-2"></div>
              <div className="lp-ring lp-ring-3"></div>
              <div className="lp-orbit-dot lp-dot-1" title="Vertex Node"></div>
              <div className="lp-orbit-dot lp-dot-2" title="Meridian Node"></div>
              <div className="lp-orbit-dot lp-dot-3" title="SteelPoint Node"></div>
              <div className="lp-ring-core">
                <div className="lp-ring-label">
                  VIGIL
                  <span>AI Command</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS */}
        <div id="lp-logos">
          <p className="lp-logos-label">Built to integrate with</p>
          <div className="lp-logos-row">
            <span className="lp-logo-item">SAP ERP</span>
            <span className="lp-logo-item">Oracle NetSuite</span>
            <span className="lp-logo-item">Microsoft Dynamics</span>
            <span className="lp-logo-item">Sage Intacct</span>
            <span className="lp-logo-item">Workday Financials</span>
          </div>
        </div>

        {/* FEATURES */}
        <section className="lp-section technical-grid" id="lp-features">
          <div className="lp-section-label">The Dual Engine Architecture</div>
          <h2 className="lp-section-title">A unified system that doesn't just watch your data — it acts on it.</h2>
          <p className="lp-section-body">Protecting your margins in real-time with two complementary intelligence layers working in parallel.</p>

          <div className="lp-features-grid">
            {/* ACTION LAYER */}
            <div className="lp-feature-card lp-dark">
              <div className="lp-fc-badge">
                ✦ Action Layer
              </div>
              <h3 className="lp-fc-title">Automated workflows that resolve discrepancies fast.</h3>
              <p className="lp-fc-body">From flagging to resolution — without a single manual email.</p>
              <div className="lp-fc-items">
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: 'var(--blue-lt)' }}>✉</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">Auto-drafting supplier emails</div>
                    <div className="lp-fc-item-body">Instantly generate reconciliation requests when discrepancies are flagged by the system.</div>
                  </div>
                </div>
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: 'var(--blue-lt)' }}>☰</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">PO Tracking &amp; Matching</div>
                    <div className="lp-fc-item-body">24/7 synchronization between warehouse receiving logs and finance purchase orders.</div>
                  </div>
                </div>
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: 'var(--blue-lt)' }}>◎</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">Status Interpretation</div>
                    <div className="lp-fc-item-body">Natural language processing to extract shipping delays and stock-outs from unstructured emails.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RISK LAYER */}
            <div className="lp-feature-card lp-light">
              <div className="lp-fc-badge lp-gray">
                ◉ Risk Layer
              </div>
              <h3 className="lp-fc-title">Continuous risk intelligence across your entire supply chain.</h3>
              <p className="lp-fc-body">ML-powered anomaly detection that catches what human auditors miss.</p>
              <div className="lp-fc-items">
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: '#2563eb' }}>◎</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">Anomaly Detection</div>
                    <div className="lp-fc-item-body">ML-driven pattern recognition for unusual billing frequency or outlier pricing tiers.</div>
                  </div>
                </div>
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: '#2563eb' }}>▣</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">Duplicate Prevention</div>
                    <div className="lp-fc-item-body">Advanced fuzzy matching logic to block double-payments before they exit your ERP.</div>
                  </div>
                </div>
                <div className="lp-fc-item">
                  <div className="lp-fc-icon-wrap">
                    <span className="lp-fc-icon" style={{ color: '#2563eb' }}>⬡</span>
                  </div>
                  <div className="lp-fc-text">
                    <div className="lp-fc-item-title">Historical Price Auditing</div>
                    <div className="lp-fc-item-body">Continuous look-back analysis to ensure current invoices align with multi-year contract terms.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMAND CENTER */}
        <section className="lp-section technical-grid" id="lp-command">
          <div className="lp-cmd-header" style={{ position: 'relative', zIndex: 1 }}>
            <div className="lp-section-label">The Command Center</div>
            <h2 className="lp-section-title">One screen. Infinite visibility.</h2>
            <p className="lp-section-body">Vigil centralizes every transaction into a high-density, actionable stream.</p>
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
                <div className="lp-bc-nav-item lp-active">
                  <span className="lp-bc-dot" style={{ background: 'var(--blue-lt)' }}></span> Command Center
                </div>
                <div className="lp-bc-nav-item">
                  <span className="lp-bc-dot" style={{ background: 'var(--text-3)' }}></span> Audit Queue
                </div>
                <div className="lp-bc-nav-item">
                  <span className="lp-bc-dot" style={{ background: 'var(--text-3)' }}></span> Supplier Profiles
                </div>
                <div className="lp-bc-nav-item">
                  <span className="lp-bc-dot" style={{ background: 'var(--text-3)' }}></span> Ask AI
                </div>
                <div className="lp-bc-nav-item">
                  <span className="lp-bc-dot" style={{ background: 'var(--text-3)' }}></span> Settings
                </div>
              </div>
              <div className="lp-bc-main">
                <div className="lp-bc-stats">
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-label">Invoices Today</div>
                    <div className="lp-bc-stat-val lp-blue">{scannedCount}</div>
                  </div>
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-label">Risks Caught</div>
                    <div className="lp-bc-stat-val lp-green">{risksCount}</div>
                  </div>
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-label">Saved</div>
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
                      ALL
                    </button>
                    <button 
                      onClick={() => setFilterStatus('risk')}
                      className={`px-2.5 py-1 rounded cursor-pointer border transition-colors ${filterStatus === 'risk' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-border text-[var(--text-3)] bg-transparent'}`}
                    >
                      RISKS
                    </button>
                    <button 
                      onClick={() => setFilterStatus('warn')}
                      className={`px-2.5 py-1 rounded cursor-pointer border transition-colors ${filterStatus === 'warn' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-border text-[var(--text-3)] bg-transparent'}`}
                    >
                      WARNINGS
                    </button>
                  </div>
                  <button 
                    onClick={handleRunScan}
                    disabled={isScanning}
                    className="lp-btn-primary py-1 px-3 text-[11px] flex items-center gap-1.5 font-mono shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isScanning ? '⚡ SCANNING...' : '⚡ SCAN ERP'}
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
                    <span>Invoice</span>
                    <span>Supplier</span>
                    <span>Amount</span>
                    <span>Status</span>
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
                    <button 
                      onClick={() => setActiveInsightTab('insight')} 
                      className={`pb-1 cursor-pointer border-none bg-transparent hover:text-blue-lt transition-colors ${activeInsightTab === 'insight' ? 'text-blue-lt border-b-2 border-blue-lt font-semibold' : 'text-[var(--text-3)]'}`}
                    >
                      Anomaly Insight
                    </button>
                    <button 
                      onClick={() => setActiveInsightTab('logs')} 
                      className={`pb-1 cursor-pointer border-none bg-transparent hover:text-blue-lt transition-colors ${activeInsightTab === 'logs' ? 'text-blue-lt border-b-2 border-blue-lt font-semibold' : 'text-[var(--text-3)]'}`}
                    >
                      Action Log
                    </button>
                    <button 
                      onClick={() => setActiveInsightTab('metadata')} 
                      className={`pb-1 cursor-pointer border-none bg-transparent hover:text-blue-lt transition-colors ${activeInsightTab === 'metadata' ? 'text-blue-lt border-b-2 border-blue-lt font-semibold' : 'text-[var(--text-3)]'}`}
                    >
                      ERP Metadata
                    </button>
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
                      <div><span className="text-[var(--text-3)]">Category:</span> {selectedInvoice.metadata.category}</div>
                      <div><span className="text-[var(--text-3)]">ERP Sync:</span> <code className="bg-[var(--bg-3)] px-1 py-0.5 rounded text-blue-lt">{selectedInvoice.metadata.erpSyncStatus}</code></div>
                      <div><span className="text-[var(--text-3)]">Contract Ceiling:</span> {selectedInvoice.metadata.contractCeiling}</div>
                      <div><span className="text-[var(--text-3)]">Billed Price:</span> {selectedInvoice.metadata.billedUnit}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEPLOYMENT */}
        <section className="lp-section" id="lp-deploy">
          <div className="lp-deploy-left text-left">
            <div className="lp-section-label">Zero-Friction Deployment</div>
            <h2 className="lp-section-title">Live in 48 hours. Guaranteed.</h2>
            <p className="lp-section-body">Vigil was built for teams that can't afford a six-month implementation cycle. We sit quietly atop your existing tech stack, ingesting data without requiring a single line of custom code.</p>
            <div className="lp-deploy-items">
              <div className="lp-deploy-item">
                <div className="lp-deploy-icon">🔗</div>
                <div>
                  <div className="lp-deploy-item-title">ERP Agnostic</div>
                  <div className="lp-deploy-item-body">Works with NetSuite, SAP, Oracle, and Microsoft Dynamics out of the box.</div>
                </div>
              </div>
              <div className="lp-deploy-item">
                <div className="lp-deploy-icon">✉</div>
                <div>
                  <div className="lp-deploy-item-title">Email Integration</div>
                  <div className="lp-deploy-item-body">Direct hooks into Outlook and Gmail to process supplier communications automatically.</div>
                </div>
              </div>
              <div className="lp-deploy-item">
                <div className="lp-deploy-icon">🛡</div>
                <div>
                  <div className="lp-deploy-item-title">Bank-Grade Security</div>
                  <div className="lp-deploy-item-body">SOC2 Type II compliant with end-to-end AES-256 encryption across all data flows.</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="lp-stat-pill">
              <div className="lp-stat-icon">⚡</div>
              <div className="lp-stat-number">48</div>
              <div className="lp-stat-unit">Hours Setup</div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <div id="lp-testimonial">
          <div className="lp-stars">★★★★★</div>
          <p className="lp-quote-text">
            "Before Vigil, our audit cycle was entirely reactive. We were finding errors three months too late. Now, anomalies are caught before the payment run even begins. We've reduced manual audit time by 90%."
          </p>
          <div className="lp-quote-author">
            <div className="lp-author-avatar">SC</div>
            <div className="text-left">
              <div className="lp-author-name">Sarah Chen</div>
              <div className="lp-author-role">VP of Finance, SwiftFlow Logistics</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="lp-section" id="lp-cta">
          <h2 className="lp-cta-title">
            Stop losing margins to financial leaders using autonomous oversight to reclaim their edge.
          </h2>
          <p className="lp-cta-body">
            Join the supply chain finance teams already using Vigil to protect every dollar in their operations.
          </p>
          <div className="lp-cta-btns">
            <button className="lp-btn-cta-white" onClick={() => setIsDemoOpen(true)}>Schedule Your Demo</button>
            <button className="lp-btn-cta-outline" onClick={() => setIsDemoOpen(true)}>Talk to an Expert</button>
          </div>
          <div className="lp-cta-trust">
            <span>No credit card required</span>
            <span className="lp-trust-dot"></span>
            <span>SOC2 Compliant</span>
            <span className="lp-trust-dot"></span>
            <span>Plug-and-play</span>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-name">Vigil</div>
              <p className="lp-footer-brand-desc">The autonomous command center for modern supply chain finance.</p>
            </div>
            <div>
              <div className="lp-footer-col-title">Platform</div>
              <ul className="lp-footer-links">
                <li><a href="#lp-features">Action Layer</a></li>
                <li><a href="#lp-features">Risk Layer</a></li>
                <li><a href="#lp-command">Integrations</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Company</div>
              <ul className="lp-footer-links">
                <li><a href="#">About</a></li>
                <li><a href="mailto:contact@vigil.ai">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© 2026 Vigil. All rights reserved.</span>
            <span>No credit card required · SOC2 Compliant</span>
          </div>
        </footer>

      </div>

      {/* Modals */}
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isDemoOpen && <BookDemoModal onClose={() => setIsDemoOpen(false)} />}
    </div>
  );
}
