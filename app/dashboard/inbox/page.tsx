'use client';

import { useState, useEffect } from 'react';
import { ThreadList } from '@/components/inbox/ThreadList';
import { ConversationView } from '@/components/inbox/ConversationView';
import { AnalyticsWidget } from '@/components/inbox/AnalyticsWidget';
import { Loader2 } from 'lucide-react';

interface Thread {
  contactId: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  lastMessage: string;
  lastMessageAt: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | null;
  unreadCount: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      fetchContactDetails(selectedContactId);
    }
  }, [selectedContactId]);

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/threads');
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactDetails = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts`);
      const contacts = await response.json();
      const contact = contacts.find((c: Contact) => c.id === contactId);
      setSelectedContact(contact);
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <AnalyticsWidget />
      
      <div className="flex flex-1 overflow-hidden">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedContactId}
          onSelectThread={(contactId) => setSelectedContactId(contactId)}
        />

        <div className="flex-1">
          {selectedContact ? (
            <ConversationView contact={selectedContact} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}