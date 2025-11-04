import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Link from "next/link"
import { MessageSquare, Users, LogOut, BarChart3, Bell, Settings } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-8">
        {/* Logo/Header */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-900">UC</span>
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-4 flex-1">
          <Link
            href="/dashboard/inbox"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Inbox"
          >
            <MessageSquare className="w-6 h-6" />
          </Link>

          <Link
            href="/dashboard/contacts"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Contacts"
          >
            <Users className="w-6 h-6" />
          </Link>

          <Link
            href="/dashboard/analytics"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Analytics"
          >
            <BarChart3 className="w-6 h-6" />
          </Link>
        </nav>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Bell className="w-6 h-6" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Sign out */}
        <form action="/api/auth/sign-out" method="POST">
          <button
            type="submit"
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-colors text-slate-400 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{session.user.name || session.user.email}</h1>
            <p className="text-sm text-slate-400">Customer • Joined May 2023</p>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-8xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
