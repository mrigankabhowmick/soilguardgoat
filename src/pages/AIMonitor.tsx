import React, { useState, useEffect } from 'react';
import {
  Brain, AlertTriangle, Flame, Droplets, Bug, Eye, Activity,
  CheckCircle, XCircle, Mic, Send, User, Bot, Zap
} from 'lucide-react';

type Alert = {
  id: number;
  type: string;
  title: string;
  desc: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  read: boolean;
};

const DETECTION_CATEGORIES = [
  { label: 'Pest Detection', value: 94, color: '#f59e0b', count: 3 },
  { label: 'Plant Disease', value: 87, color: '#ef4444', count: 1 },
  { label: 'Fire/Smoke', value: 99, color: '#f97316', count: 0 },
  { label: 'Flood Risk', value: 76, color: '#3b82f6', count: 0 },
  { label: 'Intrusion', value: 91, color: '#8b5cf6', count: 2 },
  { label: 'Crop Damage', value: 88, color: '#22c55e', count: 1 },
];

const INITIAL_ALERTS: Alert[] = [
  { id: 1, type: 'pest', title: 'Aphid Infestation Detected', desc: 'High density aphid colony detected in Zone B, Row 14-18. Immediate action recommended.', severity: 'high', time: '2 min ago', icon: Bug, read: false },
  { id: 2, type: 'disease', title: 'Leaf Blight Identified', desc: 'Early signs of bacterial leaf blight detected in wheat crop (Zone A). 8% of area affected.', severity: 'medium', time: '15 min ago', icon: AlertTriangle, read: false },
  { id: 3, type: 'intrusion', title: 'Animal Intrusion – Zone C', desc: 'Large animal detected near irrigation perimeter in Zone C. Possible deer/boar.', severity: 'medium', time: '32 min ago', icon: Eye, read: true },
  { id: 4, type: 'crop', title: 'Crop Damage Alert', desc: 'Mechanical damage detected in Zone D, potentially from recent equipment pass.', severity: 'low', time: '1h ago', icon: AlertTriangle, read: true },
];

const CHAT_INIT = [
  { role: 'assistant', text: 'Hello! I\'m your SoilGuard AI assistant. I\'m monitoring your farm in real-time. How can I help you today?' },
];

export default function AIMonitor() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [messages, setMessages] = useState(CHAT_INIT);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [tick, setTick] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const markRead = (id: number) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTyping(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.text }));
      chatHistory.push({ role: 'user', content: userMsg });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.error || 'I couldn\'t process that. Please try again.' }]);
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Please check your network and try again.' }]);
    }
  };

  const unread = alerts.filter(a => !a.read).length;
  const detections = { total: 247, today: 18, accuracy: 96.4 };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Detections', value: detections.total + tick, icon: Brain, color: 'text-green-400 bg-green-500/10' },
          { label: 'Today', value: detections.today, icon: Activity, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'AI Accuracy', value: `${detections.accuracy}%`, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Active Alerts', value: unread, icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Detection categories */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Detection Systems</span>
              <span className="ml-auto text-xs text-gray-600">AI-powered</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {DETECTION_CATEGORIES.map(cat => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{cat.label}</span>
                    {cat.count > 0 && (
                      <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{cat.count}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full">
                      <div
                        className="h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{cat.value}%</span>
                  </div>
                  <div className="text-xs text-gray-700">Accuracy</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert cards */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Active Alerts</span>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unread}</span>
              )}
            </div>
            <div className="space-y-3">
              {alerts.map(alert => {
                const Icon = alert.icon;
                const severityStyle = {
                  critical: 'border-red-500/40 bg-red-500/5',
                  high: 'border-orange-500/40 bg-orange-500/5',
                  medium: 'border-yellow-500/40 bg-yellow-500/5',
                  low: 'border-gray-700/50 bg-gray-800/20',
                };
                const severityDot = {
                  critical: 'bg-red-500',
                  high: 'bg-orange-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-gray-600',
                };
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl p-4 border ${severityStyle[alert.severity]} ${!alert.read ? 'opacity-100' : 'opacity-60'} transition-opacity cursor-pointer`}
                    onClick={() => markRead(alert.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot[alert.severity]} ${!alert.read ? 'animate-pulse' : ''}`} />
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">{alert.title}</span>
                          <span className="text-xs text-gray-600 flex-shrink-0">{alert.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{alert.desc}</p>
                      </div>
                      {alert.read ? <CheckCircle className="w-4 h-4 text-gray-700 flex-shrink-0" /> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Detection Feed */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">Live Object Detection</span>
              </div>
              <span className="text-xs text-gray-600">YOLOv8 · 30 FPS</span>
            </div>
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/442589/pexels-photo-442589.jpeg?auto=compress&w=800"
                alt="ai detection"
                className="w-full h-full object-cover opacity-60"
              />
              {/* Detection boxes */}
              <div className="absolute top-8 left-16 w-24 h-16 border-2 border-yellow-400 rounded">
                <div className="absolute -top-4 left-0 bg-yellow-400 text-black text-[9px] px-1 font-mono">Aphid 94%</div>
              </div>
              <div className="absolute top-20 right-20 w-16 h-20 border-2 border-red-400 rounded">
                <div className="absolute -top-4 left-0 bg-red-400 text-black text-[9px] px-1 font-mono">Disease 87%</div>
              </div>
              <div className="absolute bottom-4 left-4 text-xs font-mono text-green-400 bg-black/60 px-2 py-1 rounded">
                {(28.6139 + Math.sin(tick * 0.3) * 0.001).toFixed(4)}°N · Objects: {2 + (tick % 2)}
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Assistant */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl flex flex-col" style={{ height: 560 }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/50">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">AI Farm Assistant</div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'assistant' ? 'bg-green-500/20 border border-green-500/30' : 'bg-blue-500/20 border border-blue-500/30'
                }`}>
                  {msg.role === 'assistant' ? <Bot className="w-3 h-3 text-green-400" /> : <User className="w-3 h-3 text-blue-400" />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'assistant' ? 'bg-gray-800/80 text-gray-300' : 'bg-green-500/20 text-green-300 border border-green-500/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-green-400" />
                </div>
                <div className="bg-gray-800/80 px-3 py-2 rounded-xl flex items-center gap-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
            {['soil moisture', 'weather', 'ndvi', 'pest'].map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="text-xs bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 px-2 py-1 rounded-lg transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${
                voiceActive ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-gray-800/50 text-gray-500 border-gray-700/50 hover:text-gray-300'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your farm..."
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 flex items-center justify-center text-green-400 flex-shrink-0 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
