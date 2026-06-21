import { Invoice, PurchaseOrder, Supplier, SupplierPriceHistory, AuditSummary, AuditLogEntry, AgentEmail, RAGResponse } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `API error (${response.status}): ${response.statusText}`;
    try {
      const errJSON = JSON.parse(errText);
      errMsg = errJSON.detail || errMsg;
    } catch {
      if (errText) errMsg = errText;
    }
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // Data Endpoints
  getSuppliers: (): Promise<Supplier[]> =>
    fetch(`${API_BASE}/data/suppliers`).then(res => handleResponse<Supplier[]>(res)),

  getOrders: (): Promise<PurchaseOrder[]> =>
    fetch(`${API_BASE}/data/orders`).then(res => handleResponse<PurchaseOrder[]>(res)),

  getPriceHistory: (): Promise<SupplierPriceHistory[]> =>
    fetch(`${API_BASE}/data/price-history`).then(res => handleResponse<SupplierPriceHistory[]>(res)),

  resetDatabase: (): Promise<{ status: string; message: string }> =>
    fetch(`${API_BASE}/data/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => handleResponse<{ status: string; message: string }>(res)),

  // Audit Endpoints
  runAudit: (): Promise<{ status: string; message: string }> =>
    fetch(`${API_BASE}/audit/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => handleResponse<{ status: string; message: string }>(res)),

  getInvoices: (): Promise<Invoice[]> =>
    fetch(`${API_BASE}/audit/invoices`).then(res => handleResponse<Invoice[]>(res)),

  getInvoice: (id: string): Promise<Invoice> =>
    fetch(`${API_BASE}/audit/invoices/${id}`).then(res => handleResponse<Invoice>(res)),

  getAuditSummary: (): Promise<AuditSummary> =>
    fetch(`${API_BASE}/audit/summary`).then(res => handleResponse<AuditSummary>(res)),

  getAuditLog: (severity?: string, action?: string): Promise<AuditLogEntry[]> => {
    let url = `${API_BASE}/audit/log`;
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (action) params.append('action', action);
    if (params.toString()) url += `?${params.toString()}`;
    return fetch(url).then(res => handleResponse<AuditLogEntry[]>(res));
  },

  performAuditAction: (invoice_id: string, action: 'approve' | 'escalate' | 'note', note_text?: string): Promise<{ status: string; message: string }> =>
    fetch(`${API_BASE}/audit/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id, action, note_text }),
    }).then(res => handleResponse<{ status: string; message: string }>(res)),

  // Agent Endpoints
  runAgentCycle: (): Promise<{ status: string; emails_drafted: any[] }> =>
    fetch(`${API_BASE}/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(res => handleResponse<{ status: string; emails_drafted: any[] }>(res)),

  getEmails: (): Promise<AgentEmail[]> =>
    fetch(`${API_BASE}/agent/emails`).then(res => handleResponse<AgentEmail[]>(res)),

  simulateReply: (po_id: string, scenario: string): Promise<AgentEmail> =>
    fetch(`${API_BASE}/agent/simulate-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ po_id, scenario }),
    }).then(res => handleResponse<AgentEmail>(res)),

  // RAG Endpoints
  queryRAG: (query: string): Promise<RAGResponse> =>
    fetch(`${API_BASE}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => handleResponse<RAGResponse>(res)),
};
