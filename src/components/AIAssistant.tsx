import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
interface AIAssistantProps {
  data: Record<string, any>[];
  columns: string[];
  onUseAI: () => void;
}

export function AIAssistant({ data, columns, onUseAI }: AIAssistantProps) {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: "Hi! I'm your AI Data Analyst. I've looked at your dataset's columns. What would you like to know about your data?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string)?.trim() || '';
  const hasApiKey = !!apiKey && apiKey !== '';
  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  const buildPrompt = (userText: string) => {
    const dataSample = data.slice(0, 5);
    const conversation = messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n\n');

    return [
      'You are an expert AI Data Analyst.',
      `Dataset columns: ${columns.join(', ') || 'No columns available'}`,
      `Total rows: ${data.length}`,
      `Sample data: ${JSON.stringify(dataSample, null, 2)}`,
      'Provide helpful, accurate, and concise insights based on the dataset.',
      'Format your response using Markdown.',
      conversation,
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
    
    onUseAI();
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      let reply = '';
      let lastError: unknown = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: buildPrompt(userText),
          });
          reply = response.text?.trim() || '';
          if (reply) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!reply) {
        throw lastError || new Error('No response from model');
      }

      setMessages(prev => [...prev, { role: 'model', text: reply || 'I could not generate a response.' }]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'model', text: `Sorry, I could not reach the AI service (${errorMessage}). Check your API key restrictions and try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">AI Data Analyst</h3>
          <p className="text-xs text-slate-500">Ask questions about your dataset</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn("p-3 rounded-2xl", msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none")}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="text-sm text-slate-800">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-md font-bold mb-2 mt-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2" {...props} />,
                      code: ({node, inline, className, children, ...props}: any) => {
                        return inline ? (
                          <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-700" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-slate-800 text-slate-50 p-3 rounded-lg mb-2 overflow-x-auto text-xs font-mono">
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-sm text-slate-500">Analyzing data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask something like 'What are the key trends in this data?'"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send AI question"
            title="Send AI question"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
