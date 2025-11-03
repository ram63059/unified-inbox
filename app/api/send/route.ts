import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { SendSMS, sendWhatsApp } from '@/lib/twilio';
import { sendEmail } from '@/lib/email';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/send - Send a message via SMS, WhatsApp, or Email
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, message, channel, subject } = body;

    // Validate input
    if (!contactId || !message || !channel) {
      return NextResponse.json(
        { error: 'contactId, message, and channel are required' },
        { status: 400 }
      );
    }

    // Get contact details
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Send message based on channel
    let result;
    let recipient = '';

    switch (channel) {
      case 'SMS':
        if (!contact.phone) {
          return NextResponse.json(
            { error: 'Contact has no phone number' },
            { status: 400 }
          );
        }
        recipient = contact.phone;
        result = await SendSMS(contact.phone, message);
        break;

      case 'WHATSAPP':
        if (!contact.whatsapp) {
          return NextResponse.json(
            { error: 'Contact has no WhatsApp number' },
            { status: 400 }
          );
        }
        recipient = contact.whatsapp;
        result = await sendWhatsApp(contact.whatsapp, message);
        break;

      case 'EMAIL':
        if (!contact.email) {
          return NextResponse.json(
            { error: 'Contact has no email address' },
            { status: 400 }
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        recipient = contact.email;
        result = await sendEmail({
          to: contact.email,
          subject: subject || 'Message from Team',
          body: message,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid channel' },
          { status: 400 }
        );
    }

    // Check if sending failed
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Save message to database
    const savedMessage = await prisma.message.create({
      data: {
        channel,
        direction: 'OUTBOUND',
        body: message,
        subject: channel === 'EMAIL' ? subject : null,
        status: 'SENT',
        contactId,
        userId: session.user.id,
        externalId: "sid" in result ? result.sid : "id" in result ? result.id : undefined,
        sentAt: new Date(),
      },
    });

    // Update contact's updatedAt timestamp
    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      messageId: savedMessage.id,
      externalId: "sid" in result ? result.sid : "id" in result ? result.id : undefined,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}