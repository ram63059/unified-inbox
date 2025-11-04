'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  _count: {
    messages: number;
    notes: number;
  };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding contact
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchContacts();
      return;
    }

    try {
      const response = await fetch(`/api/contacts?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewContact({ name: '', phone: '', email: '', whatsapp: '' });
        fetchContacts();
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Contacts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No contacts found
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-3">{contact.name}</h3>

              <div className="space-y-2 text-sm text-gray-600">
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}

                {contact.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-RetryRContinue4 h-4" />
<span>{contact.whatsapp}</span>
</div>
)}
</div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
            <span>{contact._count.messages} messages</span>
            <span>{contact._count.notes} notes</span>
          </div>
        </div>
      ))
    )}
  </div>

  {/* Add Contact Modal */}
  {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>

        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Name *"
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            required
            placeholder="John Doe"
          />

          <Input
            label="Phone"
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            placeholder="+1234567890"
          />

          <Input
            label="Email"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            placeholder="john@example.com"
          />

          <Input
            label="WhatsApp"
            type="tel"
            value={newContact.whatsapp}
            onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
            placeholder="+1234567890"
          />

          <div className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewContact({ name: '', phone: '', email: '', whatsapp: '' });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Contact</Button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>
);
}