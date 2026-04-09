import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm Elisa. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim() || '';
  const hasApiKey = !!apiKey && apiKey !== '';
  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  const buildPrompt = (userText: string) => {
    const history = messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n\n');

    return [
      'You are a helpful AI assistant for a data toolkit application.',
      'Help users understand how to clean, visualize, convert, and model their data.',
      'Keep responses concise, practical, and easy to act on.',
      history,
      `User: ${userText}`,
      'Assistant:',
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || !hasApiKey) return;
    
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      let responseText = '';
      let lastError: unknown = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: buildPrompt(userText),
          });
          responseText = response.text?.trim() || '';
          if (responseText) break;
        } catch (err) {
          lastError = err;
        }
      }
      
      if (!responseText) {
        throw lastError || new Error('No response from model');
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I couldn't reach the AI service (${errorMessage}). Check your API key restrictions and try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI assistant"
        title="Open AI assistant"
        className={cn(
          "fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-semibold">Elisa</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close AI assistant"
                title="Close AI assistant"
                className="text-indigo-100 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white text-indigo-600 border border-indigo-100")}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-sm", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm")}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-white text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-indigo-600" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                  {!hasApiKey && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-xs text-yellow-800">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>Configure your GEMINI_API_KEY in the .env file to enable AI chat</span>
                    </div>
                  )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={hasApiKey ? "Ask a question..." : "API key not configured"}
                    disabled={!hasApiKey}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-slate-100 disabled:text-slate-400"
                />
                <button
                  onClick={handleSend}
                    disabled={loading || !input.trim() || !hasApiKey}
                  aria-label="Send message"
                  title="Send message"
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
