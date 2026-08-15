import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { ChatMessage } from './components/ChatMessage.jsx';
import { ChatInput } from './components/ChatInput.jsx';
import Auth from './components/Auth.jsx';
import { Menu, X, Moon, Sun, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lengthPref, setLengthPref] = useState('medium');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    });
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data.map(m => ({ id: m.id, role: m.role, content: m.content })));
    } catch (error) {
      console.error("Failed to fetch messages for session", error);
    }
  };

  const createOrGetSessionId = async (firstMessageContent) => {
    if (currentSessionId) return currentSessionId;

    try {
      const title = firstMessageContent.substring(0, 30) + (firstMessageContent.length > 30 ? '...' : '');
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ user_id: session.user.id, title }])
        .select()
        .single();

      if (error) throw error;
      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error("Failed to create session", error);
      return null;
    }
  };

  const saveMessageToSupabase = async (sessionId, role, content) => {
    if (!sessionId) return;
    try {
      await supabase.from('messages').insert([{
        session_id: sessionId,
        role,
        content
      }]);
    } catch (error) {
      console.error("Failed to save message", error);
    }
  };

  const handleSend = async (content) => {
    const userMessageId = uuidv4();
    const userMessage = { id: userMessageId, role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const activeSessionId = await createOrGetSessionId(content);
    await saveMessageToSupabase(activeSessionId, 'user', content);

    const assistantMessageId = uuidv4();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

    let fullAssistantResponse = '';

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          lengthPreference: lengthPref,
          language: 'auto'
        }),
      });

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullAssistantResponse += data.content;
                  setMessages((prev) => prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: m.content + data.content } : m
                  ));
                } else if (data.error) {
                    setMessages((prev) => prev.map((m) =>
                      m.id === assistantMessageId ? { ...m, content: `Error: ${data.error}` } : m
                    ));
                }
              } catch (e) {
                console.error('Error parsing stream data', e);
              }
            }
          }
        }
      }

      if (fullAssistantResponse) {
        await saveMessageToSupabase(activeSessionId, 'assistant', fullAssistantResponse);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMessageId ? { ...m, content: m.content || 'An error occurred while connecting to Coco. Please try again.' } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-50 p-2 glass-panel rounded-lg hover:bg-white/20 transition-colors"
        >
          <Menu size={24} />
        </button>
      )}

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 left-4 z-50 p-2 glass-panel rounded-lg hover:bg-white/20 transition-colors lg:hidden"
        >
          <X size={24} />
        </button>
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        session={session}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
      />

      <div className="flex-1 flex flex-col h-full relative w-full max-w-full">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors text-red-400 hover:text-red-300"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 pb-32">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-full">
            {messages.length === 0 ? (
              <div className="text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-full blur-xl absolute opacity-50 -z-10"></div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-teal-400">
                  Hi, I'm Coco
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto font-medium">
                  Your intelligent, multilingual assistant. How can I help you today?
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-start">
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    onCopy={handleCopy}
                    isStreaming={isLoading && index === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 pointer-events-none">
          <div className="pointer-events-auto">
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              lengthPref={lengthPref}
              setLengthPref={setLengthPref}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
