import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, Volume2, Square } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION, generatePaymentLinkDeclaration } from '../ai-config';

// Audio Encoding/Decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setMessages([{ role: 'system', text: 'Подключение к ассистенту...' }]);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API ключ не найден. Пожалуйста, добавьте GEMINI_API_KEY.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      
      audioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;
      nextStartTimeRef.current = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setMessages(prev => [...prev, { role: 'system', text: 'Ассистент готов. Говорите!' }]);

            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle function calls
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'generatePaymentLink') {
                  const args = fc.args as any;
                  const link = `https://pay.otrazhenie-camp.ru/checkout?tariff=${encodeURIComponent(args.tariffName)}&name=${encodeURIComponent(args.userName)}`;
                  
                  setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    text: `Сгенерирована ссылка на оплату для ${args.userName} (Тариф: ${args.tariffName}): ${link}` 
                  }]);

                  sessionPromise.then((session) => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Ссылка успешно сгенерирована: " + link },
                      },
                    });
                  });
                }
              }
            }

            // Handle audio output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputAudioContext.currentTime,
              );
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
              );
              
              const outputNode = outputAudioContext.createGain();
              outputNode.connect(outputAudioContext.destination);

              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setError('Произошла ошибка соединения.');
            disconnect();
          },
          onclose: () => {
            disconnect();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: AI_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [generatePaymentLinkDeclaration] }],
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не удалось подключиться к микрофону или API.');
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    
    setIsConnected(false);
    setIsConnecting(false);
    setMessages(prev => [...prev, { role: 'system', text: 'Сессия завершена.' }]);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-brown text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Mic size={24} />
      </button>

      {/* Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-brown/10 overflow-hidden flex flex-col">
          <div className="bg-brown text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Volume2 size={20} />
              <span className="font-semibold">AI Ассистент</span>
            </div>
            <button onClick={() => { setIsOpen(false); disconnect(); }} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto bg-[#fdfbf9] flex flex-col gap-3 text-sm">
            {messages.length === 0 && !isConnected && !isConnecting && (
              <p className="text-text-dark-soft text-center mt-4">
                Нажмите "Подключиться", чтобы задать вопрос голосом.
              </p>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${msg.role === 'system' ? 'bg-gray-100 text-gray-600 text-xs text-center' : 'bg-brown/10 text-brown-dark'}`}>
                {msg.text}
              </div>
            ))}
            {error && (
              <div className="p-3 rounded-xl bg-red-100 text-red-700 text-xs text-center">
                {error}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-brown/10 bg-white flex justify-center">
            {!isConnected && !isConnecting ? (
              <button
                onClick={connect}
                className="w-full py-3 bg-brown text-white rounded-xl font-medium hover:bg-brown-dark transition-colors flex items-center justify-center gap-2"
              >
                <Mic size={18} /> Подключиться
              </button>
            ) : isConnecting ? (
              <button disabled className="w-full py-3 bg-brown/50 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Соединение...
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Square size={18} fill="currentColor" /> Завершить
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
