import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION, generatePaymentLinkDeclaration } from '../ai-config';
import { PRICING } from '../data';

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isStreaming?: boolean;
}

// Pulse animation CSS injected once
const PULSE_STYLE = `
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
.voice-fab-pulse { animation: voicePulse 1.2s ease-out; }
.voice-fab-ring::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(139,90,43,0.5);
  animation: voiceRing 1.2s ease-out;
}
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

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoOpened = useRef(false);

  // Inject pulse CSS once
  useEffect(() => {
    if (!document.getElementById('voice-assistant-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-assistant-styles';
      style.textContent = PULSE_STYLE;
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
    return () => {
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
    };
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
    return () => {
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, []);

  // Init TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Init Gemini chat
  const initChat = useCallback(() => {
    if (chatRef.current) return;
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API ключ не найден.');
      return;
    }
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

  // TTS
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Prefer a Russian female voice if available
    const voices = synthRef.current.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('ru'));
    if (ruVoice) utterance.voice = ruVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // STT
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается вашим браузером. Попробуйте Chrome.');
      return;
    }
    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(result);
      if (event.results[event.results.length - 1].isFinal) {
        setTranscript('');
        handleSend(result);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Send message to Gemini
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

      // Speak the final response
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

  const handleOpen = () => {
    hasAutoOpened.current = true;
    if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    (window as any).ym?.(108536568, 'reachGoal', 'chat_open');
    setIsOpen(true);
  };

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    setIsOpen(false);
  };

  const hasSpeechSupport = typeof window !== 'undefined'
    && (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-brown text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 relative${pulseActive ? ' voice-fab-pulse voice-fab-ring' : ''}`}
          style={{ backgroundColor: '#8B5A2B' }}
          aria-label="Открыть голосового ассистента"
        >
          <Mic size={28} />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-brown/10 overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="text-white p-4 flex justify-between items-center shadow-md z-10 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5A2B 0%, #6B3F1E 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative">
                <Bot size={20} />
                {(isListening || isSpeaking) && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Голосовой ассистент</h3>
                <p className="text-xs text-white/70">
                  {isListening ? 'Слушаю...' : isSpeaking ? 'Говорю...' : isLoading ? 'Думаю...' : 'Онлайн'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* TTS toggle */}
              <button
                onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
                aria-label={voiceEnabled ? 'Выключить голос' : 'Включить голос'}
                title={voiceEnabled ? 'Выключить голос' : 'Включить голос'}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white transition-colors p-1"
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
                        <span className="inline-block w-1.5 h-4 ml-1 rounded-sm animate-pulse align-middle" style={{ backgroundColor: 'rgba(139,90,43,0.5)' }} />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {/* Live transcript */}
            {transcript && (
              <div className="self-end max-w-[88%]">
                <div className="p-3 rounded-2xl rounded-tr-sm text-sm opacity-60 italic" style={{ backgroundColor: '#8B5A2B', color: 'white' }}>
                  {transcript}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Controls */}
          <div className="p-4 border-t border-brown/10 bg-white flex-shrink-0">
            {hasSpeechSupport ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={(e) => { e.preventDefault(); startListening(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopListening(); }}
                  disabled={isLoading}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 select-none ${
                    isListening
                      ? 'scale-110 ring-4'
                      : 'hover:scale-105 disabled:opacity-50 disabled:hover:scale-100'
                  }`}
                  style={{
                    backgroundColor: isListening ? '#6B3F1E' : '#8B5A2B',
                    color: 'white',
                    ...(isListening ? { boxShadow: '0 0 0 8px rgba(139,90,43,0.2)' } : {}),
                  }}
                  aria-label={isListening ? 'Остановить запись' : 'Говорить (зажмите)'}
                >
                  {isLoading
                    ? <Loader2 size={24} className="animate-spin" />
                    : isListening
                    ? <MicOff size={24} />
                    : <Mic size={24} />}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  {isLoading ? 'Обрабатываю...' : isListening ? 'Говорите, отпустите когда закончите' : 'Зажмите и говорите'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">
                Голосовой ввод не поддерживается браузером
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
