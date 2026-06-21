'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  FileSpreadsheet, 
  Mail, 
  ScrollText, 
  Bot,
  RefreshCw, 
  Database,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../../lib/api';
import { useTheme } from '@/context/ThemeContext';

const navigation = [
  { name: 'Dashboard',        href: '/dashboard', icon: LayoutDashboard },
  { name: 'Financial Audit',  href: '/audit',     icon: ShieldAlert },
  { name: 'Purchase Orders',  href: '/orders',    icon: FileSpreadsheet },
  { name: 'Inbox & Agent',    href: '/inbox',     icon: Mail },
  { name: 'Audit Trail',      href: '/log',       icon: ScrollText },
  { name: 'Ask RAG',          href: '/ask',       icon: Bot },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [resetting,    setResetting]    = useState(false);
  const [resetStatus,  setResetStatus]  = useState<string | null>(null);

  const handleReset = async () => {
    if (!confirm('Reset and re-seed all databases? This clears manual decisions and regenerates anomaly data.')) return;
    setResetting(true);
    setResetStatus('Resetting…');
    try {
      await api.resetDatabase();
      setResetStatus('Done!');
      setTimeout(() => { setResetStatus(null); window.location.reload(); }, 1500);
    } catch (err: any) {
      setResetStatus('Failed');
      alert(`Reset failed: ${err.message}`);
      setTimeout(() => setResetStatus(null), 3000);
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Sign out of this session?')) {
      localStorage.removeItem('vigil_auth');
      router.push('/');
    }
  };

  return (
    <div className="flex h-full w-60 flex-col fixed inset-y-0 z-50 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-colors duration-200">

      {/* ── Brand header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-[0.18em] text-foreground">VIGIL</span>
          <span className="text-[9px] text-primary font-semibold tracking-widest mt-0.5">PROCUREMENT AI</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
        >
          {theme === 'dark'
            ? <Sun  className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4 text-primary" />
          }
        </button>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex flex-1 flex-col px-3 py-5 gap-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-foreground'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/50'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="px-3 pb-5 space-y-1 border-t border-sidebar-border pt-4">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-colors disabled:opacity-40 cursor-pointer"
        >
          {resetting
            ? <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            : <Database  className="h-4 w-4" />
          }
          {resetStatus || 'Reset Data'}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/8 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
