import { prisma } from '@/lib/prisma';
import { updateDailyAnalytics, updateConversationMetrics, calculateResponseTime } from '@/lib/analytics';

// POST /api/webhooks/twilio - Handle incoming SMS/WhatsApp
export async function POST(request: Request) {
  try {
    // Parse Twilio's form data
    const formData = await request.formData();

    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;

    // Determine channel: SMS or WhatsApp
    const channel = from.startsWith('whatsapp:') ? 'WHATSAPP' : 'SMS';
    const cleanPhone = from.replace('whatsapp:', '');

    // Find existing contact or create new one
    let contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { whatsapp: cleanPhone },
        ],
      },
    });

    // Create contact if doesn't exist
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: cleanPhone, // Use phone as temporary name
          [channel === 'SMS' ? 'phone' : 'whatsapp']: cleanPhone,
        },
      });
    }

    // Collect media URLs if any
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string;
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

        const messageTime = new Date();


    // Save message to database
    await prisma.message.create({
      data: {
        channel,
        direction: 'INBOUND',
        body,
        mediaUrls,
        externalId: messageSid,
        contactId: contact.id,
        status: 'DELIVERED',
        sentAt: new Date(),
      },
    });

    // Update contact's last activity
    await prisma.contact.update({
      where: { id: contact.id },
      data: { updatedAt: new Date() },
    });

   const responseTime = await calculateResponseTime(contact.id, messageTime);
    await updateDailyAnalytics(channel, 'INBOUND', responseTime);
    await updateConversationMetrics(contact.id);

    // Respond with empty TwiML (Twilio requires XML response)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}