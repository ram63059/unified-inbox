/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Users,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';
import { formatResponseTime } from '@/lib/analytics';
import { format, subDays } from 'date-fns';

interface AnalyticsData {
  overview: {
    totalMessages: number;
    totalInbound: number;
    totalOutbound: number;
    avgResponseTime: number;
    totalConversations: number;
    activeConversations: number;
    resolvedConversations: number;
    convertedConversations: number;
    conversionRate: number;
  };
  byChannel: Record<string, {
    total: number;
    inbound: number;
    outbound: number;
  }>;
  dailyMetrics: Array<{
    date: Date;
    channel: string;
    totalMessages: number;
    inboundMessages: number;
    outboundMessages: number;
    avgResponseTime: number | null;
  }>;
  topConversations: Array<{
    id: string;
    contact: {
      name: string;
      phone: string | null;
      email: string | null;
    };
    totalMessages: number;
    responseTime: number | null;
    status: string;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);

      const response = await fetch(
        `/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No analytics data available
      </div>
    );
  }

  const { overview, byChannel, dailyMetrics, topConversations } = analytics;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your engagement metrics and performance</p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<MessageSquare className="w-6 h-6 text-blue-500" />}
          title="Total Messages"
          value={overview.totalMessages.toLocaleString()}
          subtitle={`${overview.totalInbound} in, ${overview.totalOutbound} out`}
        />

        <StatCard
          icon={<Clock className="w-6 h-6 text-green-500" />}
          title="Avg Response Time"
          value={formatResponseTime(overview.avgResponseTime)}
          subtitle="Time to first response"
        />

        <StatCard
          icon={<Users className="w-6 h-6 text-purple-500" />}
          title="Conversations"
          value={overview.totalConversations.toLocaleString()}
          subtitle={`${overview.activeConversations} active`}
        />

        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-orange-500" />}
          title="Conversion Rate"
          value={`${overview.conversionRate.toFixed(1)}%`}
          subtitle={`${overview.convertedConversations} converted`}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Channel Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(byChannel).map(([channel, data]) => (
            <ChannelCard
              key={channel}
              channel={channel as 'SMS' | 'WHATSAPP' | 'EMAIL'}
              total={data.total}
              inbound={data.inbound}
              outbound={data.outbound}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Message Volume</h2>
        <MessageVolumeChart data={dailyMetrics} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Response Time Trend</h2>
        <ResponseTimeChart data={dailyMetrics} />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Top Conversations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Messages</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Response Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {topConversations.map((conv) => (
                <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{conv.contact.name}</div>
                    <div className="text-sm text-gray-500">
                      {conv.contact.phone || conv.contact.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">{conv.totalMessages}</td>
                  <td className="py-3 px-4">
                    {conv.responseTime ? formatResponseTime(conv.responseTime) : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={conv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function ChannelCard({ 
  channel, 
  total, 
  inbound, 
  outbound 
}: { 
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL'; 
  total: number; 
  inbound: number; 
  outbound: number; 
}) {
  const channelConfig = {
    SMS: {
      icon: <Phone className="w-5 h-5 text-green-600" />,
      color: 'bg-green-100 text-green-700',
      name: 'SMS'
    },
    WHATSAPP: {
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      color: 'bg-green-100 text-green-700',
      name: 'WhatsApp'
    },
    EMAIL: {
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-100 text-blue-700',
      name: 'Email'
    }
  };

  const config = channelConfig[channel];

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.color}`}>
          {config.icon}
        </div>
        <h3 className="font-semibold text-gray-900">{config.name}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold">{total}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Inbound:</span>
          <span className="text-green-600 font-medium">{inbound}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Outbound:</span>
          <span className="text-blue-600 font-medium">{outbound}</span>
        </div>
      </div>
    </div>
  );
}

function MessageVolumeChart({ data }: { data: AnalyticsData['dailyMetrics'] }) {
  const chartData = data.reduce((acc, metric) => {
    const dateKey = format(new Date(metric.date), 'MMM dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, inbound: 0, outbound: 0 };
    }
    acc[dateKey].inbound += metric.inboundMessages;
    acc[dateKey].outbound += metric.outboundMessages;
    return acc;
  }, {} as Record<string, any>);

  const chartArray = Object.values(chartData);

  if (chartArray.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const maxValue = Math.max(
    ...chartArray.map((d: any) => Math.max(d.inbound, d.outbound))
  );

  return (
    <div className="space-y-4">
      {chartArray.map((item: any, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium w-20">{item.date}</span>
            <div className="flex-1 mx-4 flex gap-1">
              <div
                className="bg-green-500 h-8 rounded"
                style={{ width: `${(item.inbound / maxValue) * 100}%` }}
                title={`Inbound: ${item.inbound}`}
              />
              <div
                className="bg-blue-500 h-8 rounded"
                style={{ width: `${(item.outbound / maxValue) * 100}%` }}
                title={`Outbound: ${item.outbound}`}
              />
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600">↓ {item.inbound}</span>
              <span className="text-blue-600">↑ {item.outbound}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-4 justify-center mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Inbound</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Outbound</span>
        </div>
      </div>
    </div>
  );
}

function ResponseTimeChart({ data }: { data: any[] }) {
  const chartData = data
    .filter((metric) => metric.avgResponseTime !== null)
    .reduce((acc, metric) => {
      const dateKey = format(new Date(metric.date), 'MMM dd');
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, avgTime: 0, count: 0 };
      }
      acc[dateKey].avgTime += metric.avgResponseTime;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, any>);

  const chartArray = Object.values(chartData).map((item: any) => ({
    date: item.date,
    avgTime: item.avgTime / item.count,
  }));

  if (chartArray.length === 0) {
    return <div className="text-center text-gray-500 py-8">No response time data available</div>;
  }

  const maxTime = Math.max(...chartArray.map((d: any) => d.avgTime));

  return (
    <div className="space-y-4">
      {chartArray.map((item: any, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium w-20">{item.date}</span>
            <div className="flex-1 mx-4">
              <div
                className="bg-purple-500 h-6 rounded"
                style={{ width: `${(item.avgTime / maxTime) * 100}%` }}
              />
            </div>
            <span className="text-purple-600 font-medium w-16 text-right">
              {formatResponseTime(item.avgTime)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CONVERTED: 'bg-purple-100 text-purple-700',
    ARCHIVED: 'bg-gray-100 text-gray-700',
  };

  const colorClass = statusConfig[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}