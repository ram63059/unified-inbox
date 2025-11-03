import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/threads - Get list of conversation threads
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all contacts with their latest message
    const contacts = await prisma.contact.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only get the most recent message
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format as threads
    const threads = contacts.map((contact: { 
      id: string;
      name: string;
      phone: string;
      email: string;
      messages: Array<{ 
        body: string;
        createdAt: Date;
        channel: string;
      }>;
      createdAt: Date;
    }) => {
      const lastMessage = contact.messages[0];

      return {
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        lastMessage: lastMessage?.body || 'No messages yet',
        lastMessageAt: lastMessage?.createdAt || contact.createdAt,
        channel: lastMessage?.channel || null,
        unreadCount: 0, // TODO: Implement read/unread tracking
      };
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}