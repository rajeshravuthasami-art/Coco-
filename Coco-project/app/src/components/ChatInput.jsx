import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

export function ChatInput({ onSend, isLoading, lengthPref, setLengthPref }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4">
      <div className="absolute -top-12 left-4 flex gap-2 glass-panel py-1 px-2 rounded-full mb-2 text-xs font-medium">
        {['short', 'medium', 'long'].map((len) => (
          <button
            key={len}
            onClick={() => setLengthPref(len)}
            className={cn("px-3 py-1 rounded-full transition-colors capitalize",
              lengthPref === len
                ? "bg-indigo-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-white/20"
            )}
          >
            {len}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl flex items-end gap-2 p-2 relative shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-shadow">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Coco anything..."
          className="flex-1 max-h-[200px] bg-transparent border-0 focus:ring-0 resize-none px-4 py-3 text-sm md:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0 mb-1 mr-1"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
      <div className="text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        Coco can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
}
