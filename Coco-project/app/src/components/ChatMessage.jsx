import { User, Bot, Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils.js';

export function ChatMessage({ role, content, onCopy, onRegenerate, isStreaming }) {
  const isUser = role === 'user';

  return (
    <div className={cn("flex gap-4 w-full px-4 py-6 md:px-6 rounded-2xl mb-4",
      isUser ? "bg-white/5 dark:bg-white/5 backdrop-blur-sm ml-auto max-w-[85%]" : "glass-panel mr-auto w-full")}>

      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner",
        isUser ? "bg-indigo-500/20 text-indigo-500" : "bg-teal-500/20 text-teal-500")}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      <div className="flex-1 min-w-0 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            {isUser ? 'You' : 'Coco'}
          </span>
          <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
            {!isUser && onRegenerate && (
              <button onClick={onRegenerate} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Regenerate">
                <RefreshCw size={14} />
              </button>
            )}
            <button onClick={() => onCopy(content)} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Copy">
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({_node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                  />
                ) : (
                  <code {...props} className={`${className} bg-black/20 px-1 py-0.5 rounded text-sm`}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content || (isStreaming ? '...' : '')}
          </ReactMarkdown>
          {isStreaming && <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle"></span>}
        </div>
      </div>
    </div>
  );
}
