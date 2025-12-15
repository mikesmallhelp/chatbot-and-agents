"use client"

import type { UIMessage } from "ai"
import { User, Bot, Loader2 } from "lucide-react"

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={`flex max-w-[80%] flex-col gap-2 rounded-2xl px-4 py-3 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {message.parts.map((part, index) => {
          switch (part.type) {
            case "text":
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              )
            case "tool-weather":
            case "tool-calculator":
            case "tool-web-search":
            case "tool-datetime":
            case "tool-translator":
            case "tool-notes":
              return (
                <div key={index} className="rounded-lg bg-background/10 p-2 text-sm">
                  {part.state === "input-streaming" || part.state === "input-available" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : part.state === "output-available" ? (
                    <div className="space-y-1">
                      <span className="font-medium">📊 Result:</span>
                      <pre className="overflow-auto text-xs">{JSON.stringify(part.output, null, 2)}</pre>
                    </div>
                  ) : null}
                </div>
              )
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
