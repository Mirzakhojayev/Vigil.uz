/**
 * English dictionary — the canonical source of truth for the app's i18n shape.
 * Every other locale is typed as `Dict`, so a missing or misspelled key is a
 * compile-time error rather than a silent runtime fallback.
 */
export const en = {
  nav: {
    product: 'Product',
    solutions: 'Solutions',
    integrations: 'Integrations',
    signIn: 'Sign In',
    bookDemo: 'Book a Demo',
    toLight: 'Switch to Light Mode',
    toDark: 'Switch to Dark Mode',
  },
  hero: {
    title: 'The first Action & Risk layer that plugs directly into your existing financial workflow.',
    body: 'No new cards. No infrastructure changes. Just total visibility — protecting your margins in real-time before errors exit your ERP.',
    bookDemo: 'Book a Demo →',
    watchOverview: '▶ Watch 2-min Overview',
    trust: {
      noCard: 'No credit card required',
      soc2: 'SOC2 Compliant',
      plugPlay: 'Plug-and-play',
    },
    ringSub: 'AI Command',
  },
  logos: {
    label: 'Built to integrate with',
  },
  features: {
    label: 'The Dual Engine Architecture',
    title: "A unified system that doesn't just watch your data — it acts on it.",
    body: 'Protecting your margins in real-time with two complementary intelligence layers working in parallel.',
    action: {
      badge: '✦ Action Layer',
      title: 'Automated workflows that resolve discrepancies fast.',
      body: 'From flagging to resolution — without a single manual email.',
      items: [
        {
          title: 'Auto-drafting supplier emails',
          body: 'Instantly generate reconciliation requests when discrepancies are flagged by the system.',
        },
        {
          title: 'PO Tracking & Matching',
          body: '24/7 synchronization between warehouse receiving logs and finance purchase orders.',
        },
        {
          title: 'Status Interpretation',
          body: 'Natural language processing to extract shipping delays and stock-outs from unstructured emails.',
        },
      ],
    },
    risk: {
      badge: '◉ Risk Layer',
      title: 'Continuous risk intelligence across your entire supply chain.',
      body: 'ML-powered anomaly detection that catches what human auditors miss.',
      items: [
        {
          title: 'Anomaly Detection',
          body: 'ML-driven pattern recognition for unusual billing frequency or outlier pricing tiers.',
        },
        {
          title: 'Duplicate Prevention',
          body: 'Advanced fuzzy matching logic to block double-payments before they exit your ERP.',
        },
        {
          title: 'Historical Price Auditing',
          body: 'Continuous look-back analysis to ensure current invoices align with multi-year contract terms.',
        },
      ],
    },
  },
  command: {
    label: 'The Command Center',
    title: 'One screen. Infinite visibility.',
    body: 'Vigil centralizes every transaction into a high-density, actionable stream.',
    sidebar: ['Command Center', 'Audit Queue', 'Supplier Profiles', 'Ask AI', 'Settings'],
    stats: {
      invoices: 'Invoices Today',
      risks: 'Risks Caught',
      saved: 'Saved',
    },
    filters: {
      all: 'ALL',
      risks: 'RISKS',
      warnings: 'WARNINGS',
    },
    scan: '⚡ SCAN ERP',
    scanning: '⚡ SCANNING...',
    scanningMsg: 'Scanning ERP transactions in real-time...',
    scanComplete: (id: string) => `Scan complete: New duplicate payment attempt blocked (${id})!`,
    table: {
      invoice: 'Invoice',
      supplier: 'Supplier',
      amount: 'Amount',
      status: 'Status',
    },
    tabs: {
      insight: 'Anomaly Insight',
      logs: 'Action Log',
      metadata: 'ERP Metadata',
    },
    meta: {
      category: 'Category',
      erpSync: 'ERP Sync',
      ceiling: 'Contract Ceiling',
      billed: 'Billed Price',
    },
  },
  deploy: {
    label: 'Zero-Friction Deployment',
    title: 'Live in 48 hours. Guaranteed.',
    body: "Vigil was built for teams that can't afford a six-month implementation cycle. We sit quietly atop your existing tech stack, ingesting data without requiring a single line of custom code.",
    items: [
      {
        icon: '🔗',
        title: 'ERP Agnostic',
        body: 'Works with NetSuite, SAP, Oracle, and Microsoft Dynamics out of the box.',
      },
      {
        icon: '✉',
        title: 'Email Integration',
        body: 'Direct hooks into Outlook and Gmail to process supplier communications automatically.',
      },
      {
        icon: '🛡',
        title: 'Bank-Grade Security',
        body: 'SOC2 Type II compliant with end-to-end AES-256 encryption across all data flows.',
      },
    ],
    statUnit: 'Hours Setup',
  },
  testimonial: {
    quote: '"Before Vigil, our audit cycle was entirely reactive. We were finding errors three months too late. Now, anomalies are caught before the payment run even begins. We\'ve reduced manual audit time by 90%."',
    name: 'Sarah Chen',
    role: 'VP of Finance, SwiftFlow Logistics',
  },
  cta: {
    title: 'Stop losing margins to financial leaders using autonomous oversight to reclaim their edge.',
    body: 'Join the supply chain finance teams already using Vigil to protect every dollar in their operations.',
    schedule: 'Schedule Your Demo',
    talk: 'Talk to an Expert',
  },
  footer: {
    brandDesc: 'The autonomous command center for modern supply chain finance.',
    platform: 'Platform',
    company: 'Company',
    actionLayer: 'Action Layer',
    riskLayer: 'Risk Layer',
    integrations: 'Integrations',
    about: 'About',
    contact: 'Contact',
    rights: '© 2026 Vigil. All rights reserved.',
    bottomTrust: 'No credit card required · SOC2 Compliant',
  },
  loginModal: {
    brand: 'Auditor Cryptographic Node',
    title: 'Initialize Gateway',
    desc: 'Verify credentials to access secure audit trails.',
    username: 'Username',
    accessKey: 'Access Key',
    autofill: 'Autofill Compliance Credentials',
    submit: 'ESTABLISH CONNECTION',
    submitting: 'INITIALIZING...',
    error: 'ACCESS DENIED: Invalid Auditor Credentials.',
    footer: 'SECURE SHA-256 CONSOLE // MOCK NETWORK INTERFACE',
    devToken: 'DEV TOKEN: auditor@vigil.ai / password123',
  },
  demoModal: {
    brand: 'Autonomous Procurement Command',
    title: 'Book a Private Demo',
    desc: 'Schedule a live walk-through to see Vigil in action on your ERP dataset.',
    workEmail: 'Work Email',
    company: 'Company Name',
    role: 'Your Role',
    roles: {
      cfo: 'VP Finance / CFO',
      auditor: 'Internal Auditor',
      manager: 'Procurement Manager',
      dev: 'Developer / Ops',
    },
    slotLabel: 'Preferred Time Slot',
    slots: ['Tomorrow 10:00 AM', 'Tomorrow 2:00 PM', 'Wed 11:00 AM', 'Wed 4:00 PM'],
    confirm: '→ Confirm Appointment',
    scheduling: '⏳ Scheduling...',
    successTitle: 'Session Confirmed',
    successBody: (slot: string, email: string) =>
      `Your demo for ${slot} is booked. A calendar invite will be sent to ${email}.`,
    close: 'Close',
  },
  invoices: {
    'INV-2841': {
      statusLabel: '⚠ Duplicate',
      anomalyTitle: 'Potential Duplicate Payment Blocked',
      anomalyBody: 'Identical amount ($4,200.00) and metadata match INV-2790 processed 3 days ago. ERP disbursement hold placed automatically.',
      actionLog: [
        '09:42 AM - Transaction ingested from SAP',
        '09:42 AM - Risk Engine flagged high fuzzy-match similarity with INV-2790',
        '09:43 AM - Automated hold placed on ERP disbursement',
        '09:43 AM - Notification dispatched to Audit Queue',
      ],
      category: 'IT Hardware',
      erpSyncStatus: 'DISBURSEMENT_HOLD',
    },
    'INV-2840': {
      statusLabel: '↑ +12.5%',
      anomalyTitle: 'Contract Price Variance Detected',
      anomalyBody: 'Unit price deviation of 12.5% detected on electronics category. Contract ceiling is $48.20/unit; billed at $54.23/unit. Auto-email drafted to Meridian Logistics.',
      actionLog: [
        '08:15 AM - Ingested invoice INV-2840 from email stream',
        '08:16 AM - Line-item parser extracted unit price of $54.23',
        '08:16 AM - Matched with Master Services Agreement (MSA-2025-V2)',
        '08:17 AM - Automated reconciliation draft prepared for Supplier',
      ],
      category: 'Electronics Logistics',
      erpSyncStatus: 'REVIEW_REQUIRED',
    },
    'INV-2839': {
      statusLabel: '✓ Clear',
      anomalyTitle: 'Verification Passed',
      anomalyBody: 'Invoice amounts, item quantities, and bank routing numbers match Purchase Order PO-9081 and Goods Received Note GRN-112. No action required.',
      actionLog: [
        '07:30 AM - Ingested transaction from NetSuite',
        '07:30 AM - 3-way match validation successful',
        '07:31 AM - Route details & bank details verified',
        '07:31 AM - Auto-approved for payment run',
      ],
      category: 'Raw Steel Materials',
      erpSyncStatus: 'AUTO_APPROVED',
    },
    'INV-2838': {
      statusLabel: '⚠ Unapproved PO',
      anomalyTitle: 'Unapproved Purchase Order Bypass',
      anomalyBody: 'Invoice submitted without a valid pre-approved Purchase Order in ERP. Supplier has bypassed procurement guardrails.',
      actionLog: [
        '06:12 AM - Invoice received via API gateway',
        '06:12 AM - PO reference lookup failed in NetSuite database',
        '06:13 AM - Flagged as out-of-compliance procurement',
        '06:13 AM - Sent alert to Department Head for manual override',
      ],
      category: 'Software Licenses',
      erpSyncStatus: 'BLOCKED',
    },
    'INV-2837': {
      statusLabel: '✓ Clear',
      anomalyTitle: 'Verification Passed',
      anomalyBody: 'Utilities invoice matched with utility telemetry data. Billing tier corresponds to off-peak contract rates.',
      actionLog: [
        'Yesterday - Monthly billing statement parsed',
        'Yesterday - Matched with building IoT consumption telemetry',
        'Yesterday - Approved for automatic payment run',
      ],
      category: 'Utility Services',
      erpSyncStatus: 'AUTO_APPROVED',
    },
  },
};

/** The canonical dictionary shape every locale must satisfy. */
export type Dict = typeof en;
