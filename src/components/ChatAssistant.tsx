import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Bot, Send, RotateCcw } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION, generatePaymentLinkDeclaration } from '../ai-config';
import { PRICING } from '../data';

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isStreaming?: boolean;
}

const STYLES = `
@keyframes voicePulse {
  0%   { box-shadow: 0 0 0 0 rgba(139,90,43,0.55); }
  60%  { box-shadow: 0 0 0 18px rgba(139,90,43,0); }
  100% { box-shadow: 0 0 0 0 rgba(139,90,43,0); }
}
@keyframes voiceRing {
  0%   { transform: scale(1); opacity: 0.7; }
  50%  { transform: scale(1.22); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes audioBar {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1); }
}
.voice-fab-pulse { animation: voicePulse 1.2s ease-out; }
.voice-fab-ring::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(139,90,43,0.5);
  animation: voiceRing 1.2s ease-out;
}
.chat-panel { animation: slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1) both; }
.audio-bar { animation: audioBar 0.7s ease-in-out infinite; }
.audio-bar:nth-child(2) { animation-delay: 0.12s; }
.audio-bar:nth-child(3) { animation-delay: 0.24s; }
.audio-bar:nth-child(4) { animation-delay: 0.08s; }
.audio-bar:nth-child(5) { animation-delay: 0.2s; }
`;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pulseActive, setPulseActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoOpened = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!document.getElementById('voice-assistant-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-assistant-styles';
      style.textContent = STYLES;
      document.head.appendChild(style);
    }
  }, []);

  // 30-second attention pulse when closed
  useEffect(() => {
    if (!isOpen) {
      pulseTimerRef.current = setInterval(() => {
        setPulseActive(true);
        setTimeout(() => setPulseActive(false), 1300);
      }, 30000);
    }
    return () => { if (pulseTimerRef.current) clearInterval(pulseTimerRef.current); };
  }, [isOpen]);

  // Auto-open after 2 minutes
  useEffect(() => {
    autoOpenTimerRef.current = setTimeout(() => {
      if (!hasAutoOpened.current && !isOpen) {
        hasAutoOpened.current = true;
        setIsOpen(true);
        (window as any).ym?.(108536568, 'reachGoal', 'chat_auto_open');
      }
    }, 120000);
    return () => { if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current); };
  }, []);

  const ruVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const pickRuVoice = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) return;
    const voices = synth.getVoices();
    if (!voices.length) return;
    const preferred = ['Milena', 'Irina', 'Microsoft Irina', 'Yuri', 'Katya', 'Google русский', 'Алёна', 'Dariya'];
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name));
      if (v) { ruVoiceRef.current = v; return; }
    }
    const femRu = voices.find(v =>
      v.lang.startsWith('ru') &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
    if (femRu) { ruVoiceRef.current = femRu; return; }
    const anyRu = voices.find(v => v.lang.startsWith('ru'));
    if (anyRu) ruVoiceRef.current = anyRu;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      pickRuVoice();
      window.speechSynthesis.addEventListener('voiceschanged', pickRuVoice);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', pickRuVoice);
    }
  }, [pickRuVoice]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const initChat = useCallback(() => {
    if (chatRef.current) return;
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (!apiKey) { console.error('API ключ не найден.'); return; }
    const ai = new GoogleGenAI({ apiKey });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [generatePaymentLinkDeclaration] }],
        temperature: 0.7,
      },
    });
  }, []);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    if (!ruVoiceRef.current) pickRuVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    if (ruVoiceRef.current) utterance.voice = ruVoiceRef.current;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled, pickRuVoice]);

  const stopSpeaking = () => { synthRef.current?.cancel(); setIsSpeaking(false); };

  // Send greeting when opened
  useEffect(() => {
    if (isOpen) {
      initChat();
      if (messages.length === 0) {
        const greeting: Message = {
          id: 'welcome',
          role: 'model',
          text: 'Привет! Я голосовой ассистент кэмпа «Отражение». Расскажи, что тебя интересует — программа, место, ведущие или стоимость?',
        };
        setMessages([greeting]);
        speakText(greeting.text);
      }
    }
  }, [isOpen]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Голосовой ввод не поддерживается вашим браузером. Попробуйте Chrome.'); return; }
    stopSpeaking();
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); setTranscript(''); };
    recognition.onresult = (event: any) => {
      const result = Array.from(event.results as any[]).map((r: any) => r[0].transcript).join('');
      setTranscript(result);
      if (event.results[event.results.length - 1].isFinal) {
        setTranscript('');
        handleSend(result);
      }
    };
    recognition.onerror = () => { setIsListening(false); setTranscript(''); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text }]);
    setIsLoading(true);

    if (!chatRef.current) initChat();

    try {
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

      let responseStream = await chatRef.current!.sendMessageStream({ message: text });
      let fullText = '';

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => prev.map(msg =>
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg,
          ));
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const fc of chunk.functionCalls) {
            if (fc.name === 'generatePaymentLink') {
              const args = fc.args as any;
              const plan = (PRICING as any[]).find(
                p => p.name.toLowerCase() === String(args.tariffName || '').toLowerCase(),
              );
              const priceNum = plan ? parseInt(String(plan.price).replace(/\D/g, ''), 10) : 0;

              let link = '';
              let errorMessage = '';
              try {
                const resp = await fetch('/api/prodamus/pay', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tariffName: plan?.name || args.tariffName,
                    price: priceNum,
                    name: args.userName,
                    contact: args.contactInfo,
                  }),
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                link = data.paymentUrl || '';
              } catch (e: any) {
                errorMessage = e?.message || 'request_failed';
              }

              const sysMsgId = Date.now().toString();
              setMessages(prev => [...prev, {
                id: sysMsgId,
                role: 'system',
                text: link
                  ? `Ссылка на оплату (${args.tariffName}): ${link}`
                  : `Не удалось сгенерировать ссылку (${errorMessage || 'сервис временно недоступен'}). Оставьте заявку — свяжемся лично.`,
              }]);

              const funcResponseStream = await chatRef.current!.sendMessageStream({
                message: [{
                  functionResponse: {
                    id: fc.id,
                    name: fc.name,
                    response: {
                      result: link
                        ? `Ссылка успешно сгенерирована: ${link}. Передай её пользователю.`
                        : `Не удалось создать ссылку оплаты (${errorMessage}). Извинись и предложи оставить заявку через форму на сайте.`,
                    },
                  },
                }] as any,
              });

              for await (const funcChunk of funcResponseStream) {
                if (funcChunk.text) {
                  fullText += funcChunk.text;
                  setMessages(prev => prev.map(msg =>
                    msg.id === modelMsgId ? { ...msg, text: fullText } : msg,
                  ));
                }
              }
            }
          }
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg,
      ));
      if (fullText) speakText(fullText);

    } catch (error: any) {
      console.error('Chat error:', error);
      const errMsg = 'Произошла ошибка. Попробуй ещё раз.';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: errMsg }]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = () => {
    const val = textInput.trim();
    if (!val) return;
    setTextInput('');
    handleSend(val);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleOpen = () => {
    hasAutoOpened.current = true;
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    (window as any).ym?.(108536568, 'reachGoal', 'chat_open');
    setIsOpen(true);
  };

  const handleClose = () => { stopSpeaking(); stopListening(); setIsOpen(false); };

  const hasSpeechSupport = typeof window !== 'undefined'
    && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const statusLabel = isListening ? 'Слушаю...' : isSpeaking ? 'Говорю...' : isLoading ? 'Думаю...' : 'Онлайн';

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 relative${pulseActive ? ' voice-fab-pulse voice-fab-ring' : ''}`}
          style={{ backgroundColor: '#8B5A2B' }}
          aria-label="Открыть голосового ассистента"
        >
          <Mic size={28} />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="chat-panel fixed bottom-6 right-6 z-50 w-[340px] sm:w-[390px] bg-white rounded-2xl shadow-2xl border border-brown/10 overflow-hidden flex flex-col font-sans"
          style={{ maxHeight: 'min(580px, 88vh)' }}>

          {/* Header */}
          <div className="text-white p-4 flex justify-between items-center shadow-md z-10 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B5A2B 0%, #6B3F1E 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative">
                {isListening ? (
                  /* Audio wave */
                  <div className="flex items-end gap-[3px] h-5">
                    {[4, 7, 10, 6, 8].map((h, i) => (
                      <div key={i} className="audio-bar w-[3px] rounded-full bg-white origin-bottom"
                        style={{ height: `${h}px` }} />
                    ))}
                  </div>
                ) : (
                  <Bot size={20} />
                )}
                {(isListening || isSpeaking || isLoading) && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Ассистент «Отражение»</h3>
                <p className="text-xs text-white/70">{statusLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                aria-label={voiceEnabled ? 'Выключить голос' : 'Включить голос'}
                title={voiceEnabled ? 'Выключить голос' : 'Включить голос'}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#fdfbf9] flex flex-col gap-3 min-h-0">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[88%] ${
                  msg.role === 'user'
                    ? 'self-end items-end'
                    : msg.role === 'system'
                    ? 'self-center items-center max-w-[95%]'
                    : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : msg.role === 'system'
                      ? 'bg-amber-50 text-amber-900 text-xs border border-amber-200 rounded-xl'
                      : 'bg-white text-gray-800 border border-brown/10 rounded-tl-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#8B5A2B' } : {}}
                >
                  {msg.role === 'system' ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: msg.text.replace(
                          /(https?:\/\/[^\s]+)/g,
                          '<a href="$1" target="_blank" rel="noopener" style="color:#8B5A2B;text-decoration:underline">Ссылка на оплату →</a>',
                        ),
                      }}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {msg.text}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 ml-1 rounded-sm animate-pulse align-middle"
                          style={{ backgroundColor: 'rgba(139,90,43,0.5)' }} />
                      )}
                    </span>
                  )}
                </div>
                {/* Replay button for model messages */}
                {msg.role === 'model' && !msg.isStreaming && msg.text && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-[#8B5A2B] transition-colors px-1"
                    title="Прослушать ещё раз"
                  >
                    <RotateCcw size={11} />
                    <span>повторить</span>
                  </button>
                )}
              </div>
            ))}
            {/* Live transcript bubble */}
            {transcript && (
              <div className="self-end max-w-[88%]">
                <div className="p-3 rounded-2xl rounded-tr-sm text-sm opacity-60 italic"
                  style={{ backgroundColor: '#8B5A2B', color: 'white' }}>
                  {transcript}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-brown/10 bg-white flex-shrink-0 flex flex-col gap-2">
            {/* Text input */}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={handleTextKeyDown}
                placeholder="Напишите вопрос..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-brown/20 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#8B5A2B] transition-colors bg-[#fdfbf9] disabled:opacity-50"
                style={{ maxHeight: '96px', lineHeight: '1.5' }}
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 96) + 'px';
                }}
              />
              <button
                onClick={handleTextSubmit}
                disabled={isLoading || !textInput.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105 active:scale-95 flex-shrink-0"
                style={{ backgroundColor: '#8B5A2B', color: 'white' }}
                aria-label="Отправить"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>

            {/* Voice button */}
            {hasSpeechSupport ? (
              <div className="flex items-center gap-3">
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={(e) => { e.preventDefault(); startListening(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 flex-1 h-10 rounded-xl text-sm font-medium transition-all duration-200 select-none ${
                    isListening
                      ? 'ring-2 ring-offset-1'
                      : 'hover:opacity-90 disabled:opacity-40'
                  }`}
                  style={{
                    backgroundColor: isListening ? '#6B3F1E' : '#8B5A2B',
                    color: 'white',
                    ...(isListening ? { ringColor: '#8B5A2B' } : {}),
                  }}
                  aria-label={isListening ? 'Остановить запись' : 'Говорить'}
                >
                  {isListening ? (
                    <>
                      <div className="flex items-end gap-[2px] h-4">
                        {[3, 6, 9, 5, 7].map((h, i) => (
                          <div key={i} className="audio-bar w-[2.5px] rounded-full bg-white/80 origin-bottom"
                            style={{ height: `${h}px` }} />
                        ))}
                      </div>
                      <span>Говорите...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      <span>Зажать и говорить</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">Голосовой ввод доступен только в Chrome/Edge</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
