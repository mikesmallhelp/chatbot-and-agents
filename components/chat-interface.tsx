"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { type MCPServer, defaultMCPServers } from "@/lib/mcp-config"
import { MCPServerList } from "./mcp-server-list"
import { ChatMessage } from "./chat-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Trash2, Settings2, X, Sparkles } from "lucide-react"

export function ChatInterface() {
  const [servers, setServers] = useState<MCPServer[]>(defaultMCPServers)
  const [showSettings, setShowSettings] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const enabledServers = servers.filter((s) => s.enabled).map((s) => s.id)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { enabledServers },
    }),
    onFinish: (message) => {
      console.log("[CLIENT] ✅ Message received:", {
        role: message.role,
        partsCount: message.parts.length,
      })
    },
    onError: (error) => {
      console.error("[CLIENT] ❌ Error:", error)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleToggleServer = (id: string) => {
    setServers((prev) => {
      const updated = prev.map((server) => (server.id === id ? { ...server, enabled: !server.enabled } : server))
      const toggledServer = updated.find((s) => s.id === id)

      console.log(`[CLIENT] 🔌 Server toggled: ${toggledServer?.name} (${toggledServer?.enabled ? "ON" : "OFF"})`)

      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "streaming") return

    console.log("[CLIENT] 📤 Sending message:", {
      text: inputValue.substring(0, 100),
      enabledServers,
    })

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const enabledServersList = servers.filter((s) => s.enabled)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold">MCP Chatbot</h1>
            <p className="text-sm text-muted-foreground">{enabledServersList.length} servers enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleClearChat} aria-label="Clear chat">
            <Trash2 className="size-4" />
          </Button>
          <Button
            variant={showSettings ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            {showSettings ? <X className="size-4" /> : <Settings2 className="size-4" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Panel */}
        {showSettings && (
          <aside className="w-80 shrink-0 overflow-y-auto border-r border-border/50 p-4">
            <MCPServerList servers={servers} onToggle={handleToggleServer} />
          </aside>
        )}

        {/* Chat Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Welcome Message / Active Servers */}
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-semibold">Welcome! 👋</h2>
                <p className="text-muted-foreground">
                  I'm an AI assistant that can help you using the following services:
                </p>
              </div>

              <Card className="w-full max-w-md border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🔌 Enabled MCP Servers</CardTitle>
                </CardHeader>
                <CardContent>
                  {enabledServersList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {enabledServersList.map((server) => (
                        <div
                          key={server.id}
                          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm"
                        >
                          <span>{server.icon}</span>
                          <span>{server.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No servers enabled. Activate servers from settings.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>Try for example:</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {enabledServers.includes("weather") && (
                    <button
                      onClick={() => setInputValue("What's the weather in Helsinki?")}
                      className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      "What's the weather in Helsinki?"
                    </button>
                  )}
                  {enabledServers.includes("calculator") && (
                    <button
                      onClick={() => setInputValue("Calculate 15 * 23 + 42")}
                      className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      "Calculate 15 * 23 + 42"
                    </button>
                  )}
                  {enabledServers.includes("datetime") && (
                    <button
                      onClick={() => setInputValue("What time is it now?")}
                      className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      "What time is it now?"
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                disabled={status === "streaming"}
                className="flex-1"
              />
              <Button type="submit" disabled={!inputValue.trim() || status === "streaming"}>
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
