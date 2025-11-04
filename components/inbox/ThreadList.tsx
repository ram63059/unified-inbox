'use client';

import { MessageSquare, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  contactId: string;
  contactName: string;
  lastMessage: string;
  lastMessageAt: Date | string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | null;
  unreadCount: number;
}

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (contactId: string) => void;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
}: ThreadListProps) {
  // Get icon based on channel
  const getChannelIcon = (channel: Thread['channel']) => {
    switch (channel) {
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-gray-500" />;
      case 'SMS':
      case 'WHATSAPP':
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get channel badge color
  const getChannelBadge = (channel: Thread['channel']) => {
    switch (channel) {
      case 'SMS':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">SMS</span>;
      case 'WHATSAPP':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">WhatsApp</span>;
      case 'EMAIL':
        return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Email</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.contactId}
              onClick={() => onSelectThread(thread.contactId)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedThreadId === thread.contactId
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-1">
                  {getChannelIcon(thread.channel)}
                  <h3 className="font-semibold text-sm truncate">
                    {thread.contactName}
                  </h3>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                {getChannelBadge(thread.channel)}
              </div>

              <p className="text-sm text-gray-600 truncate mb-1">
                {thread.lastMessage}
              </p>

              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}