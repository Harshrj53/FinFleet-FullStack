import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, AlertCircle, TrendingUp, HelpCircle, Lock, Crown } from 'lucide-react';
import { PLANS, useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ChatPage = () => {
  const { plan, chatCount, updateChatCount, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your FinFleet AI assistant. How can I help you with your trading journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Access Control Logic
  const hasAccess = plan === PLANS.ELITE || plan === PLANS.PRIME;
  const isLimited = plan === PLANS.ELITE;
  const limitReached = isLimited && chatCount >= 5;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !hasAccess || limitReached) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    updateChatCount();

    // Mock AI Response
    setTimeout(() => {
      const responses = [
        "Based on current market trends, the RSI indicates a potential oversold condition on the 4H timeframe.",
        "Risk management is key. I recommend a stop-loss at the 1.5% below your entry price.",
        "The upcoming earnings report might cause volatility. Consider lowering your position size.",
        "Technical analysis suggests a strong resistance level at $42,500 for BTC.",
        "Diversifying into ETFs can provide stability in a bearish market environment."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto h-[700px] flex flex-col md:flex-row gap-6">
        
        {/* Sidebar / Info */}
        <div className="w-full md:w-80 space-y-4">
          <div className="card-premium p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="font-bold dark:text-white">Elite AI</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your Plan</div>
                <div className="text-sm font-bold text-brand-600">{plan}</div>
              </div>

              {isLimited && (
                <div className="p-3 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-800">
                  <div className="text-xs text-brand-600 uppercase tracking-widest mb-1">Usage Today</div>
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold dark:text-white">{chatCount}/5</span>
                    <span className="text-xs text-slate-500">chats used</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-600 transition-all duration-500" 
                      style={{ width: `${(chatCount / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Suggestions</h4>
              <button className="w-full text-left p-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Market sentiment?</span>
              </button>
              <button className="w-full text-left p-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>Explain RSI</span>
              </button>
            </div>
          </div>

          {!isAuthenticated && (
             <div className="card-premium p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
                <h4 className="font-bold mb-2">Login Required</h4>
                <p className="text-xs text-brand-100 mb-4">Please log in to check your plan status and access the AI.</p>
                <Link to="/login" className="block w-full text-center py-2 bg-white text-brand-700 rounded-lg text-sm font-bold shadow-lg">Login Now</Link>
             </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-grow flex flex-col card-premium p-0 overflow-hidden relative border-brand-500/10">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-brand-600" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-bold dark:text-white">FinFleet Assistant</div>
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active</div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.map((m, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-brand-600 text-white shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area / Lock Screen */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            {!hasAccess ? (
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white">Premium Feature</h4>
                  <p className="text-xs text-slate-500">Access to our AI Assistant is reserved for Elite & Prime members.</p>
                </div>
                <Link to="/courses" className="btn-primary py-2 px-6 text-sm">Upgrade to Elite</Link>
              </div>
            ) : limitReached ? (
              <div className="flex flex-col items-center text-center p-6 space-y-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold dark:text-white">Daily Limit Reached</h4>
                  <p className="text-xs text-slate-500">You've used all 5 chats for today. Get unlimited access with Elite Prime.</p>
                </div>
                <Link to="/courses" className="btn-primary py-2 px-6 text-sm bg-accent-gold hover:bg-amber-600">Upgrade to Prime</Link>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about market analysis, crypto, or forex..."
                  className="flex-grow bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
