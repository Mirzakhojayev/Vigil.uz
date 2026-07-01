'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, AlertCircle, ChevronRight, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
  const { t } = useI18n();
  const m = t.loginModal;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (username === 'auditor@vigil.ai' && password === 'password123') {
        localStorage.setItem('vigil_auth', 'true');
        router.push('/dashboard');
      } else {
        setError(m.error);
        setLoading(false);
      }
    }, 1000);
  };

  const handleAutofill = () => {
    setUsername('auditor@vigil.ai');
    setPassword('password123');
    setError(null);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2,6,23,0.72)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-0)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '40px 32px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          textAlign: 'left',
          animation: 'modal-slide-in 0.22s ease forwards',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes modal-slide-in {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .lm-close {
            position: absolute; top: 14px; right: 14px;
            width: 30px; height: 30px; border-radius: 8px;
            border: 1px solid var(--border); background: var(--bg-2);
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; color: var(--text-2);
            font-size: 16px; line-height: 1; transition: background 0.15s;
          }
          .lm-close:hover { background: var(--bg-3); color: var(--text-1); }
          .lm-label {
            display: block; font-size: 10px; font-weight: 600;
            color: var(--text-3); letter-spacing: 1px;
            text-transform: uppercase; margin-bottom: 6px;
            font-family: 'JetBrains Mono', monospace;
          }
          .lm-input-wrap { position: relative; }
          .lm-input-icon {
            position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
            color: var(--text-3); pointer-events: none;
            display: flex; align-items: center;
          }
          .lm-input {
            display: block; width: 100%; box-sizing: border-box;
            background: var(--bg-2); border: 1px solid var(--border);
            border-radius: 10px; padding: 0 14px 0 38px;
            height: 44px; font-size: 13px;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-1); outline: none;
            transition: border-color 0.15s;
          }
          .lm-input:focus { border-color: var(--blue-lt); }
          .lm-submit {
            display: flex; align-items: center; justify-content: center;
            gap: 8px; width: 100%; padding: 13px;
            margin-top: 8px; border-radius: 10px; border: none;
            background: var(--blue); color: #fff;
            font-size: 13px; font-family: 'JetBrains Mono', monospace;
            font-weight: 700; cursor: pointer; transition: opacity 0.15s;
          }
          .lm-submit:hover { opacity: 0.9; }
          .lm-submit:disabled { opacity: 0.45; cursor: not-allowed; }
          .lm-error {
            display: flex; align-items: center; gap: 8px;
            padding: 12px 14px; border-radius: 10px; margin-bottom: 16px;
            background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
            color: #f87171; font-size: 12px;
            font-family: 'JetBrains Mono', monospace;
          }
        `}} />

        {/* Close */}
        <button className="lm-close" onClick={onClose} title="Close"><X size={16} /></button>

        {/* Top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--blue-lt), transparent)',
          borderRadius: '20px 20px 0 0'
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--blue-lt)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            {m.brand}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {m.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
            {m.desc}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="lm-error">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label className="lm-label">{m.username}</label>
            <div className="lm-input-wrap">
              <span className="lm-input-icon"><User size={14} /></span>
              <input
                className="lm-input"
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="auditor@vigil.ai"
                autoComplete="username"
              />
            </div>
          </div>

          <div style={{ marginBottom: '6px' }}>
            <label className="lm-label">{m.accessKey}</label>
            <div className="lm-input-wrap">
              <span className="lm-input-icon"><Lock size={14} /></span>
              <input
                className="lm-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleAutofill}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--blue-lt)', cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              {m.autofill}
            </button>
          </div>

          <button type="submit" className="lm-submit" disabled={loading}>
            {loading ? m.submitting : m.submit}
            {!loading && <ChevronRight size={14} />}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '20px', paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center', fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)',
          lineHeight: 1.7
        }}>
          {m.footer}<br />
          {m.devToken}
        </div>
      </div>
    </div>
  );
}
