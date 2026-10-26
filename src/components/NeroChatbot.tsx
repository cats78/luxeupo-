import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Bot,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../types';
import { useSettings } from '../context/SettingsContext';
import {
  NERO_CONFIG,
  SUGGESTED_QUESTIONS,
  processNeroQuery,
} from '../data/neroKnowledgeBase';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedProducts?: Product[];
  showWhatsAppButton?: boolean;
}

interface NeroChatbotProps {
  products: Product[];
  onOpenProduct?: (productId: string) => void;
}

export const NeroChatbot: React.FC<NeroChatbotProps> = ({
  products,
  onOpenProduct,
}) => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const rawPhone = settings.phone ? settings.phone.replace(/\D/g, '') : NERO_CONFIG.defaultWhatsAppPhone;
  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  // Initialize with exact required welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: NERO_CONFIG.welcomeGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Realistic assistant delay for smooth natural feel
    setTimeout(() => {
      const response = processNeroQuery(text, products, cleanPhone);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedProducts: response.matchedProducts,
        showWhatsAppButton: response.showWhatsAppButton,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: NERO_CONFIG.welcomeGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating NERO Toggle Button: Positioned directly above the WhatsApp button */}
      <div className="fixed bottom-[88px] sm:bottom-[96px] right-6 z-40 flex items-center gap-2.5">
        
        {/* Subtle tooltip / label visible when closed on desktop */}
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#1C1917] text-[#FAF8F5] px-3 py-1.5 rounded-full shadow-lg border border-[#B88E52]/40 text-xs font-normal tracking-wide pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E52]" />
            <span>Chat with NERO</span>
          </div>
        )}

        {/* NERO Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close NERO Shopping Assistant' : 'Open NERO Shopping Assistant'}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1C1917] hover:bg-[#2D2A26] border-2 border-[#B88E52] text-[#FAF8F5] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#B88E52]/40 relative group cursor-pointer"
        >
          {/* Subtle gold glow pulse */}
          <span className="absolute -inset-1 rounded-full bg-[#B88E52]/20 animate-pulse pointer-events-none" />

          {isOpen ? (
            <X className="w-6 h-6 text-[#FAF8F5] transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Bot className="w-6 h-6 text-[#B88E52] drop-shadow" />
              <span className="text-[9px] font-medium tracking-wider text-[#FAF8F5] uppercase mt-0.5">
                NERO
              </span>
            </div>
          )}

          {/* Active status indicator dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#B88E52] border-2 border-[#1C1917] rounded-full shadow" />
        </button>
      </div>

      {/* NERO Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="NERO Shopping Assistant"
          className="fixed bottom-[156px] sm:bottom-[172px] right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[540px] max-h-[75vh] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E7E5E4] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
        >
          {/* Chat Header */}
          <div className="bg-[#1C1917] px-4 py-3.5 flex items-center justify-between text-white border-b border-[#B88E52]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2D2A26] border border-[#B88E52] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#B88E52]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-sm font-medium tracking-wider text-white">
                    NERO
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#B88E52] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-[#B88E52]/30">
                    AI ASSISTANT
                  </span>
                </div>
                <p className="text-[11px] text-[#A8A29E] font-light">
                  LEXUPHO Shopping Concierge • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 text-[#A8A29E] hover:text-white rounded-md hover:bg-white/10 transition-colors"
                aria-label="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close NERO"
                className="p-1.5 text-[#A8A29E] hover:text-white rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#B88E52] text-white rounded-br-xs'
                      : 'bg-white text-[#1C1917] border border-[#E7E5E4] rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Product Matches if returned */}
                {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {msg.matchedProducts.map((p) => (
                      <a
                        key={p.id}
                        href={`/product/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] transition-colors shadow-xs group"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-[#1C1917] truncate group-hover:text-[#B88E52]">
                            {p.name}
                          </h4>
                          <span className="text-xs text-[#B88E52] font-semibold">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#B88E52] shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Render WhatsApp fallback button if answer unavailable */}
                {msg.showWhatsAppButton && (
                  <div className="mt-2.5">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        'Hello LEXUPHO Concierge, I have an inquiry about your furniture.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>Connect with Concierge on WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <span className="text-[10px] text-[#A8A29E] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Quick-select questions appear directly after the welcome message */}
            {messages.length === 1 && messages[0].id.startsWith('welcome') && !isTyping && (
              <div className="w-full space-y-2 pl-1">
                <p className="text-[10px] uppercase tracking-wider text-[#78716C] font-medium">
                  How can I help you?
                </p>
                <div className="flex flex-col items-start gap-2">
                  {SUGGESTED_QUESTIONS.map((question, idx) => (
                    <button
                      key={`${question}-${idx}`}
                      type="button"
                      onClick={() => handleSendMessage(question)}
                      className="max-w-full text-left px-3 py-2 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#B88E52] hover:bg-[#FAF5EC] text-[#44403C] hover:text-[#8B6838] text-xs transition-colors cursor-pointer"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#E7E5E4] w-16 text-[#B88E52]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88E52] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88E52] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#B88E52] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Area */}
          <div className="p-3 bg-white border-t border-[#E7E5E4]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NERO anything about LEXUPHO..."
                className="flex-1 px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E7E5E4] rounded-lg text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#B88E52] focus:ring-1 focus:ring-[#B88E52]"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2 rounded-lg bg-[#B88E52] hover:bg-[#A57D43] disabled:opacity-40 disabled:hover:bg-[#B88E52] text-white transition-colors cursor-pointer shrink-0 shadow-sm"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
