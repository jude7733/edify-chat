"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type ChatRole = "user" | "assistant"
type ChatMessage = { id: string; role: ChatRole; text: string }

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const placeholder = useMemo(
    () => 'Need help choosing a service? Try: "Which service fits a SaaS analytics project?"',
    [],
  )

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  async function send(text: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const userMsg: ChatMessage = { id, role: "user", text }
    setMessages((m) => [...m, userMsg])
    setPending(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.text })),
            { role: "user", content: text },
          ],
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error || `Request failed with ${res.status}`)
      }

      const data = (await res.json()) as { reply?: string }
      const reply = data?.reply?.trim()
      setMessages((m) => [
        ...m,
        { id: `${id}-assistant`, role: "assistant", text: reply || "Sorry, I couldn’t generate a reply." },
      ])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `${id}-error`,
          role: "assistant",
          text: "We ran into an issue talking to the assistant. Please try again.",
        },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        aria-label="Open chat"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:opacity-90"
      >
        {open ? "Close Chat" : "Chat with us"}
      </Button>

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

        <div ref={scrollRef} id="chat-scroll" className="h-72 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && <div className="text-sm text-muted-foreground">{placeholder}</div>}

          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="mr-2 inline-block rounded border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {m.role === "user" ? "You" : "Assistant"}
              </span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault()
            const input = inputRef.current
            if (!input || !input.value.trim() || pending) return
            const v = input.value
            input.value = ""
            send(v)
          }}
        >
          <Input
            ref={inputRef}
            name="message"
            placeholder="Type your message..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            disabled={pending}
            aria-disabled={pending}
          />
          <Button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </>
  )
}
