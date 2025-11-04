import { prisma } from '@/lib/prisma';
import { updateDailyAnalytics, updateConversationMetrics, calculateResponseTime } from '@/lib/analytics';

import { NextResponse } from 'next/server';

// POST /api/webhooks/email - Handle incoming emails (Resend webhook)
export async function POST(request: Request) {
  try {
    const event = await request.json();

    // Resend sends different event types
    if (event.type === 'email.received') {
      const { from, subject, html, text } = event.data;

      // Extract email address from "Name <email@domain.com>" format
      const emailMatch = from.match(/<(.+)>/);
      const fromEmail = emailMatch ? emailMatch[1] : from;

      // Find or create contact
      let contact = await prisma.contact.findUnique({
        where: { email: fromEmail },
      });

      if (!contact) {
        // Extract name from "Name <email>" format
        const nameMatch = from.match(/^(.+?)\s*</);
        const name = nameMatch ? nameMatch[1].trim() : fromEmail;

        contact = await prisma.contact.create({
          data: {
            name,
            email: fromEmail,
          },
        });
      }
      const messageTime = new Date(event.data.created_at);

      // Save email as message
      await prisma.message.create({
        data: {
          channel: 'EMAIL',
          direction: 'INBOUND',
          body: html || text || '', // Prefer HTML, fallback to plain text
          subject,
          externalId: event.data.id,
          contactId: contact.id,
          status: 'DELIVERED',
          sentAt: new Date(event.data.created_at),
        },
      });

      // Update contact
      await prisma.contact.update({
        where: { id: contact.id },
        data: { updatedAt: new Date() },
      });

      const responseTime = await calculateResponseTime(contact.id, messageTime);
      await updateDailyAnalytics('EMAIL', 'INBOUND', responseTime);
      await updateConversationMetrics(contact.id);


      return NextResponse.json({ received: true });
    }

    // Handle other event types (email.sent, email.delivered, etc.)
    if (event.type === 'email.delivered') {
      // Update message status
      await prisma.message.updateMany({
        where: { externalId: event.data.email_id },
        data: { status: 'DELIVERED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}