'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { formatResponseTime } from '@/lib/analytics';

export function AnalyticsWidget() {
  const [stats, setStats] = useState({
    todayMessages: 0,
    avgResponseTime: 0,
    activeConversations: 0,
  });

  useEffect(() => {
    fetchTodayStats();
    const interval = setInterval(fetchTodayStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodayStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await fetch(
        `/api/analytics?startDate=${today.toISOString()}&endDate=${new Date().toISOString()}`
      );
      const data = await response.json();
      
      setStats({
        todayMessages: data.overview.totalMessages,
        avgResponseTime: data.overview.avgResponseTime,
        activeConversations: data.overview.activeConversations,
      });
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-around max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Today Messages</p>
            <p className="text-lg font-bold">{stats.todayMessages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Avg Response</p>
            <p className="text-lg font-bold">
              {formatResponseTime(stats.avgResponseTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm text-gray-600">Active Chats</p>
            <p className="text-lg font-bold">{stats.activeConversations}</p>
          </div>
        </div>
      </div>
    </div>
  );
}