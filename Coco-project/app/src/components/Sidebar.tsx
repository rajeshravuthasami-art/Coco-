import { Plus, MessageSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ isOpen, onNewChat }: { isOpen: boolean, onNewChat: () => void }) {
  return (
    <div className={cn("glass-panel h-screen flex flex-col transition-all duration-300 z-10 rounded-r-2xl border-l-0", isOpen ? "w-64" : "w-0 overflow-hidden opacity-0")}>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl py-3 transition-colors shadow-lg"
        >
          <Plus size={20} />
          <span className="font-semibold">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Recent</div>
        {/* Placeholder for history */}
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-left text-sm text-gray-700 dark:text-gray-300">
          <MessageSquare size={16} />
          <span className="truncate">What is Glassmorphism?</span>
        </button>
      </div>

      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-left text-sm text-gray-700 dark:text-gray-300">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
