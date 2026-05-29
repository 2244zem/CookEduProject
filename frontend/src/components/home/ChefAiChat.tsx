import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertTriangle, RotateCcw } from 'lucide-react';
import api from '../../lib/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  error?: boolean;
}

export default function ChefAiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: 'Halo! Saya Chef AI Assistant. Siap membantu Anda belajar memasak dengan cara yang menyenangkan. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Countdown timer untuk rate limit
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rateLimitCountdown > 0) {
      timer = setTimeout(() => setRateLimitCountdown(rateLimitCountdown - 1), 1000);
    } else if (rateLimitCountdown === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
    return () => clearTimeout(timer);
  }, [rateLimitCountdown, isRateLimited]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRetryMessage(null);

    try {
      const response = await api.post('/chef-ai', { question: messageText });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: response.data.response || response.data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsRateLimited(false);
      setRateLimitCountdown(0);
    } catch (error: any) {
      if (error.response?.status === 429) {
        setIsRateLimited(true);
        setRetryMessage(messageText);
        setRateLimitCountdown(60); // 60 detik countdown

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: '⚠️ Dapur AI Sedang Sibuk (Error 429 - Terlalu Banyak Permintaan). API limit sedang tercapai. Mohon tunggu beberapa saat...',
          timestamp: new Date(),
          error: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: `❌ Terjadi kesalahan: ${error.message || 'Gagal menghubungi AI'}. Silakan coba lagi.`,
          timestamp: new Date(),
          error: true,
        };

        setMessages((prev) => [...prev, errorMessage]);
        setRetryMessage(messageText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryMessage) {
      handleSendMessage(retryMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-[40px] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-950 p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl">👨‍🍳</div>
          <div>
            <h2 className="text-white font-bold text-sm">Chef AI Assistant</h2>
            <p className="text-blue-100 text-xs">
              {isRateLimited ? '⏳ Sedang istirahat...' : '🟢 Siap membantu'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                    : msg.error
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 rounded-bl-none shadow-md border border-red-300 dark:border-red-700'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-slate-900 dark:text-blue-100 rounded-bl-none shadow-md'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.type === 'user' ? 'text-blue-100' : msg.error ? 'text-red-700 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 text-slate-900 dark:text-blue-100 p-3 rounded-2xl rounded-bl-none flex gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Retry Section */}
      <AnimatePresence>
        {isRateLimited && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                Tunggu {rateLimitCountdown}s sebelum mencoba lagi
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              disabled={rateLimitCountdown > 0}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Coba Lagi
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && !isRateLimited && handleSendMessage()}
          placeholder="Tanya Chef AI..."
          disabled={isLoading || isRateLimited}
          className="flex-1 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:text-white placeholder:text-gray-400"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSendMessage()}
          disabled={isLoading || isRateLimited || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all shadow-md"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
