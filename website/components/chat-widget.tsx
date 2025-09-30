"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { cn } from "@/lib/utils"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const formRef = useRef<HTMLFormElement | null>(null)

  useEffect(() => {
    if (!open) return
    const el = document.getElementById("chat-scroll")
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        aria-label="Open chat"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90"
      >
        {open ? "Close Chat" : "Chat with us"}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[92vw] max-w-sm overflow-hidden rounded-xl border bg-background shadow-2xl transition-all",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        role="dialog"
        aria-label="Edify support chat"
      >
        <div className="border-b bg-card px-4 py-3">
          <div className="text-sm font-medium">Edify Assistant</div>
          <div className="text-xs text-muted-foreground">Ask us anything about services or capabilities.</div>
        </div>

        <div id="chat-scroll" className="h-72 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="mr-2 inline-block rounded border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {m.role === "user" ? "You" : "Assistant"}
              </span>
              {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Need help choosing a service? Try: "Which service fits a SaaS analytics project?"
            </div>
          )}
        </div>

        <form
          ref={formRef}
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement
            if (!input?.value.trim()) return
            sendMessage({ text: input.value })
            input.value = ""
          }}
        >
          <input
            name="message"
            placeholder="Type your message..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            disabled={status === "in_progress"}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            disabled={status === "in_progress"}
          >
            Send
          </button>
        </form>
      </div>
    </>
  )
}
