export interface Supplier {
  id: string;
  name: string;
  country: string;
  category: string;
  reliability_score: number;
  avg_lead_time_days: number;
}

export interface SupplierPriceHistory {
  id: number;
  supplier_id: string;
  item_code: string;
  avg_unit_price: number;
  sample_count: number;
  last_updated: string;
}

export interface OrderItem {
  id: number;
  po_id: string;
  item_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  status: 'confirmed' | 'shipped' | 'overdue' | 'invoiced' | 'paid';
  order_date: string;
  expected_delivery: string;
  total_value: number;
  reminder_count: number;
  notes?: string;
  supplier: Supplier;
  items: OrderItem[];
}

export interface AuditFinding {
  id: number;
  invoice_id: string;
  check_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  reasoning: string;
  recommendation: 'auto_approve' | 'human_review' | 'escalate';
  created_at: string;
}

export interface Invoice {
  id: string;
  supplier_id: string;
  po_id?: string;
  amount: number;
  invoice_date: string;
  status: 'pending' | 'approved' | 'escalated' | 'paid';
  risk_score: number;
  last_audited?: string;
  supplier: Supplier;
  findings: AuditFinding[];
  po?: PurchaseOrder;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  confidence?: number;
}

export interface AgentEmail {
  id: number;
  po_id?: string;
  supplier_id: string;
  direction: 'outbound' | 'inbound';
  tone?: 'friendly' | 'firm' | 'urgent';
  subject: string;
  body: string;
  sent_at: string;
  is_reply_simulated: number;
  supplier: Supplier;
}

export interface RAGSource {
  id: string;
  type: 'invoice' | 'supplier' | 'po' | 'email' | 'audit_log' | 'audit_finding';
  text_snippet: string;
}

export interface RAGResponse {
  answer: string;
  sources: RAGSource[];
}

export interface AuditSummary {
  total_invoices: number;
  flagged_review: number;
  auto_approved: number;
  pending_human: number;
  total_spend_under_review: number;
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
