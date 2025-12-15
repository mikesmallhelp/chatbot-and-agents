"use client"

import type { MCPServer } from "@/lib/mcp-config"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MCPServerListProps {
  servers: MCPServer[]
  onToggle: (id: string) => void
}

export function MCPServerList({ servers, onToggle }: MCPServerListProps) {
  const enabledCount = servers.filter((s) => s.enabled).length

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">🔌</span>
          MCP Servers
        </CardTitle>
        <CardDescription>
          {enabledCount} / {servers.length} enabled
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              server.enabled ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{server.icon}</span>
              <div>
                <p className={`font-medium ${server.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {server.name}
                </p>
                <p className="text-sm text-muted-foreground">{server.description}</p>
              </div>
            </div>
            <Switch
              checked={server.enabled}
              onCheckedChange={() => onToggle(server.id)}
              aria-label={`Toggle ${server.name} on or off`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
