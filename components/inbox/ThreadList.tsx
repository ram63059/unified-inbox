"use client"

import { MessageSquare, Mail, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Thread {
  contactId: string
  contactName: string
  lastMessage: string
  lastMessageAt: Date | string
  channel: "SMS" | "WHATSAPP" | "EMAIL" | null
  unreadCount: number
}

interface ThreadListProps {
  threads: Thread[]
  selectedThreadId: string | null
  onSelectThread: (contactId: string) => void
}

export function ThreadList({ threads, selectedThreadId, onSelectThread }: ThreadListProps) {
  const getChannelIcon = (channel: Thread["channel"]) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="w-4 h-4 text-slate-400" />
      case "SMS":
      case "WHATSAPP":
      default:
        return <MessageSquare className="w-4 h-4 text-slate-400" />
    }
  }

  const getChannelBadge = (channel: Thread["channel"]) => {
    switch (channel) {
      case "SMS":
        return <span className="text-xs bg-yellow-500 text-slate-900 px-2.5 py-1 rounded-full font-bold">SMS</span>
      case "WHATSAPP":
        return <span className="text-xs bg-green-500 text-white px-2.5 py-1 rounded-full font-bold">WhatsApp</span>
      case "EMAIL":
        return <span className="text-xs bg-cyan-500 text-slate-900 px-2.5 py-1 rounded-full font-bold">Email</span>
      default:
        return null
    }
  }

  const getAvatarGradient = (index: number) => {
    const gradients = [
      "from-amber-400 to-orange-500",
      "from-blue-400 to-cyan-500",
      "from-purple-400 to-pink-500",
      "from-green-400 to-emerald-500",
      "from-red-400 to-rose-500",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">All</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-2 py-2 mb-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversations"
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none flex-1"
          />
        </div>
        <div className="flex gap-2 text-xs">
          <button className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
            Unread
          </button>
          <button className="px-2 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
            Assigned
          </button>
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-slate-500">No conversations yet</div>
        ) : (
          threads.map((thread, index) => (
            <div
              key={thread.contactId}
              onClick={() => onSelectThread(thread.contactId)}
              className={`p-4 border-b border-slate-800 cursor-pointer transition-all ${
                selectedThreadId === thread.contactId
                  ? "bg-slate-800 border-l-2 border-l-cyan-400"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-sm font-bold text-slate-900">{thread.contactName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-white truncate">{thread.contactName}</h3>
                    {thread.unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  {getChannelBadge(thread.channel)}
                </div>
              </div>

              <p className="text-sm text-slate-400 truncate mb-1 ml-13">{thread.lastMessage}</p>

              <span className="text-xs text-slate-500 ml-13">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: false,
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
