import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, Send, Loader2, PlusCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [adminId, setAdminId] = useState(null);
  const [startingConversation, setStartingConversation] = useState(false);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = userData.id || null;

  // ─── Fetch conversations ──────────────────────────────────────
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await API.get('/messages/conversations');
      setConversations(response.data);
      setFilteredConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Could not load conversations');
    } finally {
      setLoading(false);
    }
  };

  // ─── Get admin user ID ────────────────────────────────────────
  const fetchAdminId = async () => {
    try {
      const response = await API.get('/auth/admin-id');
      setAdminId(response.data.id);
    } catch (err) {
      console.error('Error fetching admin ID:', err);
      setAdminId(1); // fallback to 1
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAdminId();
  }, []);

  // ─── Filter conversations ──────────────────────────────────────
  useEffect(() => {
    const filtered = conversations.filter((conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  // ─── Load messages for selected conversation ──────────────────
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await API.get(`/messages/${selectedConversation.id}`);
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  // ─── Auto‑scroll ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ──────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      await API.post(`/messages/${selectedConversation.id}/send`, {
        content: newMessage.trim(),
      });
      const response = await API.get(`/messages/${selectedConversation.id}`);
      setMessages(response.data);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: newMessage.trim() }
            : c
        )
      );
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Start conversation with admin ──────────────────────────────
  const startConversationWithAdmin = async () => {
    if (!adminId) {
      alert('Admin user not found.');
      return;
    }
    setStartingConversation(true);
    try {
      const response = await API.post('/messages/start', { user_id: adminId });
      const convId = response.data.id;
      await fetchConversations();
      const conv = conversations.find(c => c.id === convId);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        setTimeout(() => {
          const found = conversations.find(c => c.id === convId);
          if (found) setSelectedConversation(found);
        }, 500);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Could not start conversation with admin.');
    } finally {
      setStartingConversation(false);
    }
  };

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-500" />
            Messages
          </h2>
          <p className="text-sm text-gray-500">{conversations.length} conversations</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={startConversationWithAdmin}
            disabled={startingConversation || !adminId}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startingConversation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Contact Admin</span>
          </button>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conversations</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No conversations found.
                <button
                  onClick={startConversationWithAdmin}
                  disabled={startingConversation || !adminId}
                  className="block mx-auto mt-3 text-purple-600 hover:underline text-sm font-medium"
                >
                  Contact Admin
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition flex items-start gap-3 ${
                    selectedConversation?.id === conv.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700 flex-shrink-0">
                    {conv.avatar || conv.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">{conv.name}</h4>
                      <span className="text-xs text-gray-400">
                        {conv.time ? new Date(conv.time).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                  {selectedConversation.avatar || selectedConversation.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{selectedConversation.name}</h3>
                  <p className="text-xs text-gray-500">{selectedConversation.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="w-12 h-12 mb-2" />
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === currentUserId;
                      const showDate = index === 0 || formatDate(msg.created_at) !== formatDate(messages[index - 1]?.created_at);
                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && <div className="text-center text-xs text-gray-400 my-2">{formatDate(msg.created_at)}</div>}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isOwn ? 'bg-purple-500 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                              <p className="text-sm break-words">{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isOwn ? 'text-purple-100' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-lg font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm text-gray-400">Choose a conversation from the list, or click <strong>Contact Admin</strong> to start a new chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}