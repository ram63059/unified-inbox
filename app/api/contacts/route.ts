import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/contacts - Fetch all contacts
export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameter from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Fetch contacts from database
    const contacts = await prisma.contact.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get last message only
        },
        _count: {
          select: { messages: true, notes: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, whatsapp } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate contact
    const existing = await prisma.contact.findFirst({
      where: {
        OR: [
          phone ? { phone } : {},
          email ? { email } : {},
          whatsapp ? { whatsapp } : {},
        ].filter((obj) => Object.keys(obj).length > 0),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Contact already exists with this phone/email' },
        { status: 409 }
      );
    }

    // Create new contact
    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email,
        whatsapp,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}