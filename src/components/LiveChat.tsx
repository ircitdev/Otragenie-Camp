import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  from: 'visitor' | 'admin';
  ts: number;
};

const POLL_INTERVAL = 3000;

export const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'name' | 'chat'>('name');
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastMsgId, setLastMsgId] = useState(0);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && phase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, phase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = useCallback((sid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/livechat/poll?sessionId=${sid}&after=${lastMsgId}`);
        const data = await res.json();
        if (data.messages?.length) {
          const newMsgs: Message[] = data.messages.map((m: any) => ({
            id: String(m.id),
            text: m.text,
            from: 'admin',
            ts: m.created_at,
          }));
          setMessages(prev => [...prev, ...newMsgs]);
          setLastMsgId(data.messages[data.messages.length - 1].id);
        }
      } catch {}
    }, POLL_INTERVAL);
  }, [lastMsgId]);

  useEffect(() => {
    if (sessionId) startPolling(sessionId);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sessionId, lastMsgId]);

  const handleStart = async () => {
    if (!nameInput.trim()) return;
    setStarting(true);
    try {
      const res = await fetch('/api/livechat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorName: nameInput.trim() }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setPhase('chat');
      setMessages([{
        id: 'welcome',
        text: 'Привет! Напишите свой вопрос — менеджер ответит в ближайшее время.',
        from: 'admin',
        ts: Date.now(),
      }]);
    } catch {
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const tempMsg: Message = { id: `tmp_${Date.now()}`, text, from: 'visitor', ts: Date.now() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch('/api/livechat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, text }),
      });
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase === 'name') handleStart();
      else handleSend();
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-[#5c6b5e] text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] flex items-center justify-center"
        aria-label="Живой чат"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#5c6b5e]/50"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-44 right-6 z-40 w-[calc(100vw-3rem)] max-w-[340px] bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-stone-200/60 overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh' }}
          >
            {/* Header */}
            <div className="bg-[#5c6b5e] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-[0.85rem] font-semibold leading-none">Живой чат</p>
                <p className="text-white/60 text-[0.7rem] mt-0.5">Команда «Отражение»</p>
              </div>
            </div>

            {/* Name phase */}
            {phase === 'name' && (
              <div className="p-5 flex flex-col gap-4">
                <p className="text-[0.88rem] text-stone-600 leading-[1.55]">
                  Привет! Напишите своё имя, чтобы начать диалог с менеджером.
                </p>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ваше имя"
                  autoFocus
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-[0.9rem] outline-none focus:border-[#5c6b5e] focus:ring-1 focus:ring-[#5c6b5e]/30 transition"
                />
                <button
                  onClick={handleStart}
                  disabled={!nameInput.trim() || starting}
                  className="w-full bg-[#5c6b5e] text-white rounded-xl py-2.5 text-[0.85rem] font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition hover:bg-[#4a574b]"
                >
                  {starting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Начать чат
                </button>
              </div>
            )}

            {/* Chat phase */}
            {phase === 'chat' && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5" style={{ minHeight: 0 }}>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[0.85rem] leading-[1.5] ${
                        msg.from === 'visitor'
                          ? 'bg-[#5c6b5e] text-white rounded-br-sm'
                          : 'bg-stone-100 text-stone-700 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-stone-100 flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Написать сообщение…"
                    className="flex-1 border border-stone-200 rounded-xl px-3.5 py-2 text-[0.88rem] outline-none focus:border-[#5c6b5e] focus:ring-1 focus:ring-[#5c6b5e]/30 transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 rounded-xl bg-[#5c6b5e] flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-[#4a574b] flex-shrink-0"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
