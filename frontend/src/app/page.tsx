'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Lock, 
  AlertCircle, 
  ChevronRight,
  X 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear previous auth state on landing
    localStorage.removeItem('vigil_auth');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulated verification delay
    setTimeout(() => {
      if (username === 'auditor@vigil.ai' && password === 'password123') {
        localStorage.setItem('vigil_auth', 'true');
        router.push('/dashboard');
      } else {
        setError('ACCESS DENIED: Invalid Auditor Credentials.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleFillPreset = () => {
    setUsername('auditor@vigil.ai');
    setPassword('password123');
    setError(null);
  };

  if (!mounted) {
    return null; // prevent hydration mismatch
  }

  return (
    <div className="font-body-md text-body-md antialiased bg-background text-on-surface w-full min-h-screen relative">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-30 bg-surface-container-lowest/80 dark:bg-surface-navigation/80 backdrop-blur-md border-b border-outline-variant dark:border-outline">
        <div className="flex justify-between items-center h-16 px-container-margin w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Vigil</span>
          </div>
          <nav className="hidden md:flex items-center gap-xl">
            <a className="text-primary dark:text-primary-fixed-dim font-bold border-b-2 border-primary hover:text-primary transition-colors duration-200 py-1" href="#product">Product</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200" href="#architecture">Solutions</a>
            <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200" href="#deployment">Integrations</a>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              Sign In
            </button>
          </nav>
          <div className="flex items-center gap-md">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-all cursor-pointer shadow-sm flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
              )}
            </button>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="bg-primary px-lg py-sm rounded-lg text-on-primary font-label-md text-label-md hover:opacity-90 transition-colors duration-200 cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      <main className="mt-16">
        {/* Hero Section */}
        <section id="product" className="relative min-h-[90vh] flex items-center pt-xl technical-grid">
          <div className="container mx-auto px-container-margin relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div className="max-w-2xl text-left">
              <h1 className="font-display-lg text-display-lg text-on-surface mb-md leading-tight">
                Autonomous Oversight for the <span className="text-primary">Modern Supply Chain.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-lg">
                The first Action &amp; Risk layer that plugs directly into your existing financial workflow. No new cards. No infrastructure changes. Just total visibility.
              </p>
              <div className="flex flex-wrap gap-md">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-primary text-on-primary px-xl py-md rounded-lg font-label-md text-label-md flex items-center gap-sm shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                >
                  Book a Demo
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="border border-outline text-on-surface px-xl py-md rounded-lg font-label-md text-label-md flex items-center gap-sm hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  Watch 2-min Overview
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Technical Abstract Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-64 h-64 border border-outline/30 rounded-full"
                    style={{ animation: 'spin 10s linear infinite' }}
                  />
                  <div 
                    className="absolute w-80 h-80 border border-outline/10 rounded-full"
                    style={{ animation: 'spin 15s linear infinite reverse' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-xl border-y border-outline-variant bg-surface-container-lowest">
          <div className="px-container-margin">
            <p className="font-label-sm text-label-sm text-center text-outline uppercase tracking-widest mb-lg">Powering operations for industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-xl opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="h-8 w-32 flex items-center justify-center font-bold text-headline-sm text-on-surface-variant">LogiCore</div>
              <div className="h-8 w-32 flex items-center justify-center font-bold text-headline-sm text-on-surface-variant">NexusMFG</div>
              <div className="h-8 w-32 flex items-center justify-center font-bold text-headline-sm text-on-surface-variant">SwiftFlow</div>
              <div className="h-8 w-32 flex items-center justify-center font-bold text-headline-sm text-on-surface-variant">Vantage</div>
              <div className="h-8 w-32 flex items-center justify-center font-bold text-headline-sm text-on-surface-variant">Quantium</div>
            </div>
          </div>
        </section>

        {/* The Dual Engine (Action vs Risk) */}
        <section id="architecture" className="py-xl bg-background overflow-hidden">
          <div className="px-container-margin">
            <div className="max-w-3xl mb-xl text-left">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">The Dual Engine Architecture</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">A unified system that doesn't just watch your data—it acts on it, protecting your margins in real-time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg relative">
              {/* Action Layer */}
              <div className="p-xl rounded-xl border border-outline-variant bg-surface-container-lowest glow-subtle transition-transform hover:-translate-y-1 text-left">
                <div className="flex items-center gap-md mb-lg">
                  <div className="p-sm bg-primary text-on-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">auto_fix</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Action Layer</h3>
                </div>
                
                <ul className="space-y-lg">
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-primary mt-1">mail</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Auto-drafting supplier emails</h4>
                      <p className="text-on-surface-variant font-body-md">Instantly generate reconciliation requests when discrepancies are flagged by the system.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-primary mt-1">inventory_2</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">PO Tracking &amp; Matching</h4>
                      <p className="text-on-surface-variant font-body-md">24/7 synchronization between warehouse receiving logs and finance purchase orders.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-primary mt-1">psychology_alt</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">Status Interpretation</h4>
                      <p className="text-on-surface-variant font-body-md">Natural language processing to extract shipping delays and stock-outs from unstructured emails.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Risk Layer */}
              <div className="p-xl rounded-xl border border-outline-variant bg-surface-container-high glow-subtle transition-transform hover:-translate-y-1 text-left">
                <div className="flex items-center gap-md mb-lg">
                  <div className="p-sm bg-error text-on-error rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Risk Layer</h3>
                </div>
                
                <ul className="space-y-lg">
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-error mt-1">radar</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-error transition-colors">Anomaly Detection</h4>
                      <p className="text-on-surface-variant font-body-md">ML-driven pattern recognition for unusual billing frequency or outlier pricing tiers.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-error mt-1">content_copy</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-error transition-colors">Duplicate Prevention</h4>
                      <p className="text-on-surface-variant font-body-md">Advanced fuzzy matching logic to block double-payments before they exit your ERP.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-md group">
                    <span className="material-symbols-outlined text-error mt-1">history_edu</span>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-error transition-colors">Historical Price Auditing</h4>
                      <p className="text-on-surface-variant font-body-md">Continuous look-back analysis to ensure current invoices align with multi-year contract terms.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Product Preview */}
        <section className="py-xl bg-surface-navigation text-on-surface-variant">
          <div className="px-container-margin">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-surface-bright mb-sm">The Command Center</h2>
              <p className="font-body-lg text-body-lg text-surface-variant/80 max-w-2xl mx-auto">One screen. Infinite visibility. Vigil centralizes every transaction into a high-density, actionable stream.</p>
            </div>
            
            <div className="relative max-w-6xl mx-auto rounded-xl border border-outline/20 bg-surface shadow-2xl overflow-hidden group">
              {/* Browser Chrome */}
              <div className="bg-surface-container-high px-md py-sm flex items-center gap-sm border-b border-outline-variant">
                <div className="flex gap-xs">
                  <div className="w-3 h-3 rounded-full bg-error/40"></div>
                  <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                  <div className="w-3 h-3 rounded-full bg-success/40"></div>
                </div>
                <div className="mx-auto bg-surface px-xl py-xs rounded text-label-sm text-outline border border-outline-variant/30 font-mono">vigil.ai/command-center</div>
              </div>
              
              {/* App Interface Placeholder */}
              <div className="p-gutter min-h-[500px] flex gap-md bg-background text-left text-on-surface">
                <div className="w-nav-width hidden md:block space-y-sm shrink-0">
                  <div className="h-10 bg-surface-container rounded mb-md"></div>
                  <div className="h-6 bg-surface-container rounded-sm w-3/4"></div>
                  <div className="h-6 bg-surface-container rounded-sm w-1/2"></div>
                  <div className="h-6 bg-surface-container rounded-sm w-2/3"></div>
                  <div className="mt-xl h-24 bg-primary/5 rounded border border-primary/10"></div>
                </div>
                
                <div className="flex-1 space-y-md">
                  <div className="grid grid-cols-3 gap-md">
                    <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded p-md">
                      <div className="h-4 bg-surface-container w-1/2 mb-xs"></div>
                      <div className="h-8 bg-primary/10 w-3/4 rounded mt-sm"></div>
                    </div>
                    <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded p-md">
                      <div className="h-4 bg-surface-container w-1/2 mb-xs"></div>
                      <div className="h-8 bg-error/10 w-3/4 rounded mt-sm"></div>
                    </div>
                    <div className="h-32 bg-surface-container-lowest border border-outline-variant rounded p-md">
                      <div className="h-4 bg-surface-container w-1/2 mb-xs"></div>
                      <div className="h-8 bg-success-container/30 w-3/4 rounded mt-sm"></div>
                    </div>
                  </div>
                  
                  <div className="h-96 bg-surface-container-lowest border border-outline-variant rounded p-md relative overflow-hidden">
                    <div className="flex justify-between border-b border-outline-variant/50 pb-sm mb-md">
                      <div className="h-4 bg-surface-container w-32"></div>
                      <div className="h-4 bg-surface-container w-24"></div>
                    </div>
                    <div className="space-y-md">
                      <div className="h-12 bg-surface-container-low rounded-sm w-full animate-pulse"></div>
                      <div className="h-12 bg-surface-container-low rounded-sm w-full delay-75 animate-pulse"></div>
                      <div className="h-12 bg-surface-container-low rounded-sm w-full delay-150 animate-pulse"></div>
                      <div className="h-12 bg-surface-container-low rounded-sm w-full delay-200 animate-pulse"></div>
                    </div>
                    
                    {/* Hover Callouts */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="absolute top-1/4 right-1/4 glass-card p-md rounded shadow-xl border-primary/30 max-w-xs text-left">
                        <p className="font-label-md text-label-md text-primary mb-1">Anomaly Insight</p>
                        <p className="font-body-md text-on-surface">Unit price deviation of 12.5% detected on Invoice #8841-A. <span className="text-primary font-bold">Action taken: Email drafted.</span></p>
                      </div>
                      <div className="absolute bottom-1/4 left-1/4 glass-card p-md rounded shadow-xl border-success/30 max-w-xs text-left">
                        <p className="font-label-md text-label-md text-success mb-1">Risk Mitigated</p>
                        <p className="font-body-md text-on-surface">Duplicate payment of $4,200 blocked. Supplier "Vertex" notified.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 'Plug & Play' Advantage */}
        <section id="deployment" className="py-xl bg-background technical-grid">
          <div className="px-container-margin grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            <div className="text-left">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">Zero-Friction Deployment</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">Vigil was built for teams that can't afford a six-month implementation cycle. We sit quietly atop your existing tech stack, ingesting data without requiring a single line of custom code.</p>
              
              <div className="space-y-lg">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-fixed rounded-lg border border-primary/20 text-primary">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">ERP Agnostic</h4>
                    <p className="text-on-surface-variant">Works with NetSuite, SAP, Oracle, and Microsoft Dynamics out of the box.</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-fixed rounded-lg border border-primary/20 text-primary">
                    <span className="material-symbols-outlined">mark_email_read</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Email Integration</h4>
                    <p className="text-on-surface-variant">Direct hooks into Outlook and Gmail to process supplier communications.</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-fixed rounded-lg border border-primary/20 text-primary">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Bank-Grade Security</h4>
                    <p className="text-on-surface-variant">SOC2 Type II compliant with end-to-end AES-256 encryption.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="inline-block p-xl glass-card rounded-2xl border-outline-variant">
                  <span className="material-symbols-outlined text-[48px] text-primary mb-md">bolt</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">Live in <span className="text-primary">48 Hours</span></h3>
                  <p className="font-label-md text-label-md text-outline uppercase tracking-widest mt-2">Guaranteed setup time</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-xl bg-surface-container-lowest">
          <div className="px-container-margin max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-xs mb-lg text-primary">
              <span className="material-symbols-outlined fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="material-symbols-outlined fill-current" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <blockquote className="font-headline-lg text-headline-lg text-on-surface italic mb-xl leading-relaxed">
              "Before Vigil, our audit cycle was entirely reactive. We were finding errors three months too late. Now, anomalies are caught before the payment run even begins. We've reduced manual audit time by 90%."
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full mb-md overflow-hidden bg-surface-container">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Sarah Chen" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAStR4mRx7Pt55lhqvx3TJ5R958OG7wiHISQEqJ9VMLbWo1TehLTtVKGCWBR38sOoGaWy4UzXdAj0-WmL0w8jEYL36zzjKk2luNmN_NI-60ByjC5qt-M8HhtgMoNc1LzEd_KUnf0FjA3yHWxYu1hBclgWWtR_h1j9AxtO1m6c0cao1alPP-epXc5YiXbajZm9l7fEx7z0EHEuLnANc5f0gjInVyf09YMKW7SjmkWjOkFswx69goiDCzX86sP5zlAHNvQQJzmxgBikU" 
                />
              </div>
              <p className="font-bold text-on-surface text-sm">Sarah Chen</p>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wide">CFO, Global Logisys</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-xl relative bg-primary text-on-primary overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="technical-grid h-full w-full"></div>
          </div>
          <div className="px-container-margin relative z-10 text-center">
            <h2 className="font-display-lg text-display-lg mb-md text-on-primary">
              Stop chasing invoices. <br />
              <span className="opacity-70">Start managing scale.</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl mx-auto mb-xl">
              Join hundreds of financial leaders using autonomous oversight to reclaim their margins.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-md">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-surface-bright text-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-xl cursor-pointer"
              >
                Schedule Your Demo
              </button>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="border border-on-primary/30 text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-white/10 transition-all cursor-pointer"
              >
                Talk to an Expert
              </button>
            </div>
            <p className="mt-lg font-label-sm text-label-sm text-on-primary/60">No credit card required. SOC2 Compliant. Plug-and-play.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest dark:bg-surface-navigation border-t border-outline-variant dark:border-outline text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg py-xl px-container-margin w-full max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-2">
            <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim block mb-md">Vigil</span>
            <p className="text-on-surface-variant dark:text-surface-variant max-w-sm font-body-md text-body-md">
              The autonomous command center for modern supply chain finance. Precision, visibility, and control at scale.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface dark:text-inverse-on-surface mb-md">Platform</h4>
            <ul className="space-y-sm text-on-surface-variant dark:text-surface-variant font-body-md">
              <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#product">Action Layer</a></li>
              <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#architecture">Risk Layer</a></li>
              <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#deployment">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface dark:text-inverse-on-surface mb-md">Company</h4>
            <ul className="space-y-sm text-on-surface-variant dark:text-surface-variant font-body-md">
              <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-colors" href="#product">About</a></li>
              <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-colors" href="mailto:contact@vigil.ai">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant/30 py-lg px-container-margin flex flex-col md:flex-row justify-between items-center gap-md max-w-7xl mx-auto">
          <p className="text-on-surface-variant dark:text-surface-variant text-label-md font-label-md">© 2026 Vigil Oversight. All rights reserved.</p>
          <div className="flex gap-lg">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">public</span></a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">link</span></a>
          </div>
        </div>
      </footer>

      {/* Cryptographic Gateway Overlay Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl relative text-left">
            {/* Close Button */}
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Top Glow Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="text-center space-y-2.5 mb-6">
              <span className="text-[9px] font-mono text-primary tracking-[0.25em] uppercase block font-semibold">
                Auditor Cryptographic Node
              </span>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-mono uppercase">
                Initialize Gateway
              </h2>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
                Please verify credentials to access secure audit trails and system activity monitors.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block font-semibold">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="auditor@vigil.ai"
                    className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-foreground placeholder-muted-foreground/50 transition-colors h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block font-semibold">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-foreground placeholder-muted-foreground/50 transition-colors h-11"
                  />
                </div>
              </div>

              {/* Preset Autofill Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleFillPreset}
                  className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors hover:underline cursor-pointer"
                >
                  Autofill Compliance Credentials
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold bg-primary text-primary-foreground shadow hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer h-11 mt-2"
              >
                {loading ? 'INITIALIZING CLOUD VAULT...' : 'ESTABLISH CONNECT'}
                {!loading && <ChevronRight className="h-4.5 w-4.5" />}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center font-mono text-[9px] text-muted-foreground leading-relaxed">
              SECURE SHA-256 CONSOLE // MOCK NETWORK INTERFACE <br />
              DEV TOKEN: auditor@vigil.ai / password123
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
