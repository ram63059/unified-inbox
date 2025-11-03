'use client';

import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

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

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === 'OUTBOUND';
  const sentAt = new Date(message.sentAt);

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOutbound ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOutbound
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap wrap-break-words">{message.body}</p>

          {/* Show media attachments if any */}
          {message.mediaUrls && message.mediaUrls.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.mediaUrls.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="rounded max-w-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and sender */}
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isOutbound ? 'text-right' : 'text-left'
          }`}
        >
          {isOutbound && message.user?.name && (
            <span>{message.user.name} • </span>
          )}
          {formatDistanceToNow(sentAt, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}