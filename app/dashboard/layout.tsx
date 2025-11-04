import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { MessageSquare, Users, LogOut, BarChart3 } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Unified Inbox</h1>
          <p className="text-sm text-gray-600">{session.user.name || session.user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/inbox"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Inbox</span>
          </Link>

          <Link
            href="/dashboard/contacts"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900"
          >
            <Users className="w-5 h-5" />
            <span>Contacts</span>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}