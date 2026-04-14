import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION, generatePaymentLinkDeclaration } from '../ai-config';
import { PRICING } from '../data';

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isStreaming?: boolean;
}

export const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Здравствуйте! Я AI-ассистент ретрита "Отражение". Готов ответить на ваши вопросы о программе, тарифах и помочь с бронированием. Чем могу помочь?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const initChat = () => {
    if (chatRef.current) return;
    
    // Fallback to process.env if import.meta.env is not available
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("API ключ не найден.");
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: 'Ошибка: API ключ не настроен. Добавьте VITE_GEMINI_API_KEY в .env' }]);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: [generatePaymentLinkDeclaration] }],
        temperature: 0.7,
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userText }]);
    setIsLoading(true);

    if (!chatRef.current) {
      initChat();
    }

    try {
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

      let responseStream = await chatRef.current!.sendMessageStream({ message: userText });
      
      let fullText = '';

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: fullText } : msg
          ));
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const fc of chunk.functionCalls) {
            if (fc.name === 'generatePaymentLink') {
              const args = fc.args as any;
              const plan = (PRICING as any[]).find(p => p.name.toLowerCase() === String(args.tariffName || '').toLowerCase());
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
                  ? `Сгенерирована ссылка на оплату (Тариф: ${args.tariffName}): ${link}`
                  : `Не удалось сгенерировать ссылку на оплату (${errorMessage || 'сервис временно недоступен'}). Оставьте заявку — свяжемся лично.`,
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
                    msg.id === modelMsgId ? { ...msg, text: fullText } : msg
                  ));
                }
              }
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
      ));

    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: 'Произошла ошибка при получении ответа. Попробуйте еще раз.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => { (window as any).ym?.(108536568, "reachGoal", "chat_open"); setIsOpen(true); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-brown text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Открыть чат"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-brown/10 overflow-hidden flex flex-col font-sans">
          {/* Header */}
          <div className="bg-brown text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Ассистент</h3>
                <p className="text-xs text-white/70">Онлайн</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Закрыть чат"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#fdfbf9] flex flex-col gap-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : msg.role === 'system' ? 'self-center items-center max-w-[95%]' : 'self-start items-start'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brown text-white rounded-tr-sm' 
                      : msg.role === 'system'
                      ? 'bg-gray-100 text-gray-600 text-xs border border-gray-200'
                      : 'bg-white text-gray-800 border border-brown/10 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'system' ? (
                    <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-brown underline">$1</a>') }} />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  )}
                  {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-brown/50 animate-pulse align-middle"></span>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-brown/10 bg-white">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 p-1 focus-within:border-brown/50 focus-within:ring-1 focus-within:ring-brown/50 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-gray-800 placeholder-gray-400 outline-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="p-2 mb-0.5 mr-0.5 bg-brown text-white rounded-lg hover:bg-brown-dark disabled:opacity-50 disabled:hover:bg-brown transition-colors flex-shrink-0"
                aria-label="Отправить"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
