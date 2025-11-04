import { prisma } from './prisma';

export async function calculateResponseTime(contactId: string, inboundMessageTime: Date) {
  const firstResponse = await prisma.message.findFirst({
    where: {
      contactId,
      direction: 'OUTBOUND',
      createdAt: {
        gt: inboundMessageTime,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!firstResponse) {
    return null;
  }

  const responseTime = (firstResponse.createdAt.getTime() - inboundMessageTime.getTime()) / 1000;
  return responseTime;
}

export async function updateConversationMetrics(contactId: string) {
  const messages = await prisma.message.findMany({
    where: { contactId },
    orderBy: { createdAt: 'asc' },
  });

  if (messages.length === 0) return;

  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const firstOutbound = messages.find((m) => m.direction === 'OUTBOUND');

  const inboundCount = messages.filter((m) => m.direction === 'INBOUND').length;
  const outboundCount = messages.filter((m) => m.direction === 'OUTBOUND').length;

  let responseTime = null;
  if (firstMessage.direction === 'INBOUND' && firstOutbound) {
    responseTime = (firstOutbound.createdAt.getTime() - firstMessage.createdAt.getTime()) / 1000;
  }

  await prisma.conversationMetrics.upsert({
    where: {
      contactId,
    },
    create: {
      contactId,
      firstMessageAt: firstMessage.createdAt,
      lastMessageAt: lastMessage.createdAt,
      firstResponseAt: firstOutbound?.createdAt,
      responseTime,
      totalMessages: messages.length,
      inboundCount,
      outboundCount,
      status: 'ACTIVE',
    },
    update: {
      lastMessageAt: lastMessage.createdAt,
      totalMessages: messages.length,
      inboundCount,
      outboundCount,
      updatedAt: new Date(),
    },
  });
}

export async function updateDailyAnalytics(
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL',
  direction: 'INBOUND' | 'OUTBOUND',
  responseTime?: number | null
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyAnalytics.findUnique({
    where: {
      date_channel: {
        date: today,
        channel,
      },
    },
  });

  if (existing) {
    await prisma.dailyAnalytics.update({
      where: { id: existing.id },
      data: {
        totalMessages: existing.totalMessages + 1,
        inboundMessages: direction === 'INBOUND' ? existing.inboundMessages + 1 : existing.inboundMessages,
        outboundMessages: direction === 'OUTBOUND' ? existing.outboundMessages + 1 : existing.outboundMessages,
        responseCount: responseTime ? existing.responseCount + 1 : existing.responseCount,
        totalResponseTime: responseTime 
          ? (existing.totalResponseTime || 0) + responseTime 
          : existing.totalResponseTime,
        avgResponseTime: responseTime
          ? ((existing.totalResponseTime || 0) + responseTime) / (existing.responseCount + 1)
          : existing.avgResponseTime,
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.dailyAnalytics.create({
      data: {
        date: today,
        channel,
        totalMessages: 1,
        inboundMessages: direction === 'INBOUND' ? 1 : 0,
        outboundMessages: direction === 'OUTBOUND' ? 1 : 0,
        responseCount: responseTime ? 1 : 0,
        totalResponseTime: responseTime || 0,
        avgResponseTime: responseTime || null,
        conversationsStarted: direction === 'INBOUND' ? 1 : 0,
      },
    });
  }
}

export async function getAnalytics(startDate: Date, endDate: Date) {
  const dailyMetrics = await prisma.dailyAnalytics.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const conversations = await prisma.conversationMetrics.findMany({
    where: {
      firstMessageAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      contact: true,
    },
  });

  const totalMessages = dailyMetrics.reduce((sum, m) => sum + m.totalMessages, 0);
  const totalInbound = dailyMetrics.reduce((sum, m) => sum + m.inboundMessages, 0);
  const totalOutbound = dailyMetrics.reduce((sum, m) => sum + m.outboundMessages, 0);
  
  const avgResponseTimes = dailyMetrics
    .filter((m) => m.avgResponseTime !== null)
    .map((m) => m.avgResponseTime!);
  
  const overallAvgResponseTime = avgResponseTimes.length > 0
    ? avgResponseTimes.reduce((sum, t) => sum + t, 0) / avgResponseTimes.length
    : 0;

  const byChannel = dailyMetrics.reduce((acc, metric) => {
    if (!acc[metric.channel]) {
      acc[metric.channel] = {
        total: 0,
        inbound: 0,
        outbound: 0,
      };
    }
    acc[metric.channel].total += metric.totalMessages;
    acc[metric.channel].inbound += metric.inboundMessages;
    acc[metric.channel].outbound += metric.outboundMessages;
    return acc;
  }, {} as Record<string, { total: number; inbound: number; outbound: number }>);

  const converted = conversations.filter((c) => c.status === 'CONVERTED').length;
  const conversionRate = conversations.length > 0 ? (converted / conversations.length) * 100 : 0;

  return {
    overview: {
      totalMessages,
      totalInbound,
      totalOutbound,
      avgResponseTime: overallAvgResponseTime,
      totalConversations: conversations.length,
      activeConversations: conversations.filter((c) => c.status === 'ACTIVE').length,
      resolvedConversations: conversations.filter((c) => c.status === 'RESOLVED').length,
      convertedConversations: converted,
      conversionRate,
    },
    byChannel,
    dailyMetrics,
    topConversations: conversations
      .sort((a, b) => b.totalMessages - a.totalMessages)
      .slice(0, 10),
  };
}

export function formatResponseTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days}d`;
  }
}