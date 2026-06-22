'use client';

import React, { useState } from 'react';

interface BookDemoModalProps {
  onClose: () => void;
}

const SLOTS = ['Tomorrow 10:00 AM', 'Tomorrow 2:00 PM', 'Wed 11:00 AM', 'Wed 4:00 PM'];

export default function BookDemoModal({ onClose }: BookDemoModalProps) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('VP Finance / CFO');
  const [slot, setSlot] = useState(SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  const handleClose = () => {
    setEmail('');
    setCompany('');
    setRole('VP Finance / CFO');
    setSlot(SLOTS[0]);
    setSubmitting(false);
    setSuccess(false);
    onClose();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bd-slide-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bd-overlay {
          position: fixed; inset: 0; z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          background: rgba(2,6,23,0.72);
          backdrop-filter: blur(6px);
          padding: 16px;
        }
        .bd-card {
          position: relative; width: 100%; max-width: 440px;
          background: var(--bg-0);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px 32px 32px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          text-align: left;
          animation: bd-slide-in 0.22s ease forwards;
        }
        .bd-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg-2);
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; color: var(--text-2);
          font-size: 16px; line-height: 1; transition: background 0.15s;
        }
        .bd-close:hover { background: var(--bg-3); color: var(--text-1); }
        .bd-accent-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue-lt), transparent);
          border-radius: 20px 20px 0 0;
        }
        .bd-label {
          display: block; font-size: 10px; font-weight: 600;
          color: var(--text-3); letter-spacing: 1px;
          text-transform: uppercase; margin: 14px 0 6px;
          font-family: 'JetBrains Mono', monospace;
        }
        .bd-input {
          display: block; width: 100%; box-sizing: border-box;
          background: var(--bg-2); border: 1px solid var(--border);
          border-radius: 10px; padding: 0 14px; height: 44px;
          font-size: 13px; font-family: 'JetBrains Mono', monospace;
          color: var(--text-1); outline: none; transition: border-color 0.15s;
        }
        .bd-input:focus { border-color: var(--blue-lt); }
        .bd-slots {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;
        }
        .bd-slot {
          padding: 9px 6px; border-radius: 8px; font-size: 11px;
          font-family: 'JetBrains Mono', monospace; text-align: center;
          cursor: pointer; border: 1px solid var(--border);
          background: var(--bg-2); color: var(--text-2);
          transition: all 0.15s;
        }
        .bd-slot:hover { border-color: var(--blue-lt); color: var(--blue-lt); }
        .bd-slot.bd-slot-active {
          border-color: var(--blue-lt);
          background: rgba(37,99,235,0.1);
          color: var(--blue-lt);
        }
        .bd-submit {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; padding: 13px;
          margin-top: 20px; border-radius: 10px; border: none;
          background: var(--blue); color: #fff;
          font-size: 13px; font-family: 'JetBrains Mono', monospace;
          font-weight: 700; cursor: pointer; transition: opacity 0.15s;
        }
        .bd-submit:hover { opacity: 0.9; }
        .bd-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .bd-success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 24px; color: #22c55e;
        }
        .bd-dismiss {
          padding: 11px 28px; border-radius: 10px; border: none;
          background: var(--blue); color: #fff;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: opacity 0.15s;
        }
        .bd-dismiss:hover { opacity: 0.9; }
      `}} />

      <div className="bd-overlay" onClick={handleClose}>
        <div className="bd-card" onClick={(e) => e.stopPropagation()}>
          <div className="bd-accent-bar" />
          <button className="bd-close" onClick={handleClose} title="Close">✕</button>

          {!success ? (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--blue-lt)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Autonomous Procurement Command
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                  Book a Private Demo
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
                  Schedule a live walk-through to see Vigil in action on your ERP dataset.
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="bd-label">Work Email</label>
                <input
                  className="bd-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />

                <label className="bd-label">Company Name</label>
                <input
                  className="bd-input"
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                />

                <label className="bd-label">Your Role</label>
                <select
                  className="bd-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>VP Finance / CFO</option>
                  <option>Internal Auditor</option>
                  <option>Procurement Manager</option>
                  <option>Developer / Ops</option>
                </select>

                <label className="bd-label">Preferred Time Slot</label>
                <div className="bd-slots">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`bd-slot${slot === s ? ' bd-slot-active' : ''}`}
                      onClick={() => setSlot(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button type="submit" className="bd-submit" disabled={submitting}>
                  {submitting ? '⏳ Scheduling...' : '→ Confirm Appointment'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="bd-success-icon">✓</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '10px' }}>
                Session Confirmed
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '24px' }}>
                Your demo for <strong style={{ color: 'var(--text-1)' }}>{slot}</strong> is booked.
                A calendar invite will be sent to{' '}
                <strong style={{ color: 'var(--text-1)' }}>{email}</strong>.
              </div>
              <button className="bd-dismiss" onClick={handleClose}>Close</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
