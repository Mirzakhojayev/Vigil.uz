'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, AlertCircle, FileText, Building, HelpCircle, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { RAGSource } from '../../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: RAGSource[];
  isTyping?: boolean;
}

const SAMPLE_CHIPS = [
  { text: 'Who has price deviation spikes?',  query: 'Which suppliers have had price anomalies recently?' },
  { text: 'Duplicates with Meridian?',         query: 'Show me any duplicate invoices from Meridian Logistics.' },
  { text: 'Spend on electronics?',             query: 'What is the total spend on electronics category?' },
  { text: 'Which PO is overdue?',              query: 'Show me overdue orders and what reminders were sent.' },
];

function getSourceIcon(type: string) {
  switch (type) {
    case 'invoice':          return <FileText   className="h-3.5 w-3.5 text-primary" />;
    case 'po':               return <FileText   className="h-3.5 w-3.5 text-sky-500" />;
    case 'supplier_profile':
    case 'supplier':         return <Building   className="h-3.5 w-3.5 text-emerald-500" />;
    default:                 return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Vigil, your AI procurement auditor. I have direct access to SQLite (structured data like totals and invoice lists) and ChromaDB (semantic search over emails, audit reasoning, and supplier profiles).\n\nAsk me anything about suppliers, purchase order delays, or flagged financial anomalies."
    }
  ]);
  const [inputText,      setInputText]      = useState('');
  const [loading,        setLoading]        = useState(false);
  const [selectedSource, setSelectedSource] = useState<RAGSource | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId   = Date.now().toString();
    const typingMsgId = (Date.now() + 1).toString();

    setMessages(prev => [
      ...prev,
      { id: userMsgId,   sender: 'user',      text: textToSend },
      { id: typingMsgId, sender: 'assistant',  text: '', isTyping: true },
    ]);
    setInputText('');
    setLoading(true);
    setSelectedSource(null);

    try {
      const res = await api.queryRAG(textToSend);
      setMessages(prev => prev.map(msg =>
        msg.id === typingMsgId
          ? { id: typingMsgId, sender: 'assistant', text: res.answer, sources: res.sources }
          : msg
      ));
    } catch (err: any) {
      setMessages(prev => prev.map(msg =>
        msg.id === typingMsgId
          ? { id: typingMsgId, sender: 'assistant', text: `Sorry, an error occurred: ${err.message}` }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[88vh] flex flex-col gap-5 overflow-hidden w-full">

      {/* ── Header ── */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ask RAG Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Query procurement databases using semantic search and direct SQL calculations.
        </p>
      </div>

      {/* ── Split-screen ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">

        {/* Chat window */}
        <Card className="vigil-card lg:col-span-8 p-4 flex flex-col h-full min-h-0">

          {/* Messages */}
          <ScrollArea className="flex-1 pr-1 mb-4">
            <div className="space-y-4 pb-2">
              {messages.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      isAssistant
                        ? 'bg-muted/50 border border-border text-foreground'
                        : 'bg-primary text-primary-foreground shadow-sm'
                    }`}>
                      {msg.isTyping ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Analyzing queries…
                        </div>
                      ) : (
                        <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                      )}

                      {/* Source citations */}
                      {isAssistant && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                            Sources
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src) => (
                              <button
                                key={src.id}
                                onClick={() => setSelectedSource(src)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                                  selectedSource?.id === src.id
                                    ? 'bg-primary/10 border-primary/40 text-primary'
                                    : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                                }`}
                              >
                                {getSourceIcon(src.type)}
                                {src.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isAssistant && (
                      <div className="h-8 w-8 rounded-lg bg-primary border border-primary/60 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Sample query chips (only on first load) */}
          {messages.length === 1 && (
            <div className="shrink-0 mb-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Sample queries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(chip.query)}
                    className="text-left p-3 rounded-lg border border-border bg-muted/30 hover:bg-accent/60 hover:border-primary/30 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(inputText); }}
            className="shrink-0 flex gap-2"
          >
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder="Ask about suppliers, invoices, price anomalies…"
              className="flex-1 bg-background border border-border rounded-lg px-4 text-sm h-11 focus:border-primary"
            />
            <Button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="h-11 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        {/* Citation inspector panel */}
        <Card className="vigil-card lg:col-span-4 p-4 flex flex-col h-full min-h-0">
          <div className="mb-4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Citation Inspector
            </span>
            <p className="text-sm font-medium text-foreground mt-0.5">Source Verification</p>
          </div>

          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/20 flex flex-col">
            {selectedSource ? (
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Source header */}
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      {getSourceIcon(selectedSource.type)}
                      <span className="text-sm font-semibold text-foreground">{selectedSource.id}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {selectedSource.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Text snippet */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                      Context Excerpt
                    </span>
                    <p className="text-xs text-foreground/85 leading-relaxed bg-muted/50 border border-border rounded-lg p-3 whitespace-pre-wrap">
                      {selectedSource.text_snippet}
                    </p>
                  </div>

                  {/* Grounding note */}
                  <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-lg p-3 text-xs text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>The AI synthesized its response using this specific segment retrieved from the procurement database.</span>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-5 gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground">Click a source citation in the chat to inspect the raw context.</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
