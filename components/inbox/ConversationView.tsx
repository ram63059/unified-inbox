'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Calendar, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/Button';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
}

interface Message {
  id: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  mediaUrls: string[];
  sentAt: Date | string;
  user?: {
    name: string | null;
  };
}

interface ConversationViewProps {
  contact: Contact;
  onClose?: () => void;
}

export function ConversationView({ contact, onClose }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL'>('SMS');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when contact changes
  useEffect(() => {
    fetchMessages();
  }, [contact.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Determine available channels for this contact
  const availableChannels = [
    contact.phone && 'SMS',
    contact.whatsapp && 'WHATSAPP',
    contact.email && 'EMAIL',
  ].filter(Boolean) as ('SMS' | 'WHATSAPP' | 'EMAIL')[];

  // Set default channel to first available
  useEffect(() => {
    if (availableChannels.length > 0 && !availableChannels.includes(selectedChannel)) {
      setSelectedChannel(availableChannels[0]);
    }
  }, [contact.id, availableChannels, selectedChannel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages?contactId=${contact.id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (selectedChannel === 'EMAIL' && !emailSubject.trim()) {
      alert('Please enter email subject');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          message: newMessage,
          channel: selectedChannel,
          subject: selectedChannel === 'EMAIL' ? emailSubject : undefined,
        }),
      });

      if (response.ok) {
        // Clear input
        setNewMessage('');
        setEmailSubject('');
        
        // Refresh messages
        await fetchMessages();
      } else {
        const error = await response.json();
        alert(`Failed to send: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{contact.name}</h2>
            <div className="flex gap-2 text-sm text-gray-600 mt-1">
              {contact.phone && <span>📱 {contact.phone}</span>}
              {contact.email && <span>✉️ {contact.email}</span>}
            </div>
          </div>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Channel selector */}
        <div className="flex gap-2 mb-3">
          {availableChannels.map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedChannel === channel
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {channel}
            </button>
          ))}
        </div>

        {/* Email subject field (only for email) */}
        {selectedChannel === 'EMAIL' && (
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Message input */}
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your ${selectedChannel.toLowerCase()} message...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={sending}
          />

          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}