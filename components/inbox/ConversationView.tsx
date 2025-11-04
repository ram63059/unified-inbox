"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { Button } from "@/components/ui/Button"

interface Contact {
  id: string
  name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
}

interface Message {
  id: string
  body: string
  direction: "INBOUND" | "OUTBOUND"
  channel: "SMS" | "WHATSAPP" | "EMAIL"
  mediaUrls: string[]
  sentAt: Date | string
  user?: {
    name: string | null
  }
}

interface ConversationViewProps {
  contact: Contact
  onClose?: () => void
}

export function ConversationView({ contact, onClose }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "WHATSAPP" | "EMAIL">("SMS")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
  }, [contact.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const availableChannels = [contact.phone && "SMS", contact.whatsapp && "WHATSAPP", contact.email && "EMAIL"].filter(
    Boolean,
  ) as ("SMS" | "WHATSAPP" | "EMAIL")[]

  useEffect(() => {
    if (availableChannels.length > 0 && !availableChannels.includes(selectedChannel)) {
      setSelectedChannel(availableChannels[0])
    }
  }, [contact.id, availableChannels, selectedChannel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages?contactId=${contact.id}`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return
    if (selectedChannel === "EMAIL" && !emailSubject.trim()) {
      alert("Please enter email subject")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          message: newMessage,
          channel: selectedChannel,
          subject: selectedChannel === "EMAIL" ? emailSubject : undefined,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        setEmailSubject("")
        await fetchMessages()
      } else {
        const error = await response.json()
        alert(`Failed to send: ${error.error}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{contact.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{contact.name}</h2>
              <p className="text-sm text-slate-400">Customer • Joined May 2023 • Last seen 2m ago</p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 text-sm border-t border-slate-800 pt-2">
          <button className="text-cyan-400 font-medium pb-1 border-b-2 border-cyan-400 transition-colors">
            Conversation
          </button>
          <button className="text-slate-400 hover:text-white pb-1 transition-colors">Notes</button>
          <button className="text-slate-400 hover:text-white pb-1 transition-colors">Activity</button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-slate-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        {/* Channel selector */}
        <div className="flex gap-2 mb-3">
          {availableChannels.map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedChannel === channel
                  ? channel === "SMS"
                    ? "bg-yellow-500 text-slate-900"
                    : channel === "WHATSAPP"
                      ? "bg-green-500 text-white"
                      : "bg-cyan-500 text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {channel}
            </button>
          ))}
        </div>

        {/* Email subject field */}
        {selectedChannel === "EMAIL" && (
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-3 py-2 border border-slate-700 rounded-lg mb-2 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        )}

        {/* Message input */}
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your ${selectedChannel.toLowerCase()} message...`}
            className="flex-1 px-3 py-2 border border-slate-700 rounded-lg resize-none bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            rows={3}
            disabled={sending}
          />

          <Button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>

        <div className="text-xs text-slate-500 mt-2">Press Enter to send, Shift+Enter for new line</div>
      </div>
    </div>
  )
}
