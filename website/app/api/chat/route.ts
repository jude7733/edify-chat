export const maxDuration = 30

type IncomingMessage = {
  role: "user" | "assistant"
  text?: string
  content?: string
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: IncomingMessage[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages array is required" }, { status: 400 })
    }

    const FASTAPI_URL = process.env.FASTAPI_CHAT_URL
    if (!FASTAPI_URL) {
      return Response.json(
        {
          error:
            "FASTAPI_CHAT_URL is not set.",
        },
        { status: 500 },
      )
    }

    const payload = {
      messages: messages.map((m) => ({
        role: m.role,
        content: typeof m.text === "string" ? m.text : (m.content ?? ""),
      })),
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const apiKey = process.env.FASTAPI_API_KEY
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const fastapiRes = await fetch(FASTAPI_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: req.signal,
    })

    let replyText: string | null = null

    const contentType = fastapiRes.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const data = await fastapiRes.json().catch(() => ({}))
      replyText =
        data?.reply ?? data?.message ?? data?.choices?.[0]?.message?.content ?? (typeof data === "string" ? data : null)
    } else {
      // Fallback to text
      replyText = await fastapiRes.text().catch(() => null)
    }

    if (!fastapiRes.ok) {
      return Response.json(
        { error: "FastAPI error", status: fastapiRes.status, body: replyText ?? "Unknown error" },
        { status: 502 },
      )
    }

    if (!replyText) {
      return Response.json({ error: "No reply from FastAPI" }, { status: 502 })
    }

    return Response.json({ reply: replyText })
  } catch (err: unknown) {
    return Response.json({ error: (err as Error)?.message ?? "Unknown error" }, { status: 500 })
  }
}
