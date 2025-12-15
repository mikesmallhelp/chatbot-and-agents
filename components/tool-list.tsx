"use client"

import type { Tool } from "@/lib/tool-config"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ToolListProps {
  tools: Tool[]
  onToggle: (id: string) => void
}

export function ToolList({ tools, onToggle }: ToolListProps) {
  const enabledCount = tools.filter((s) => s.enabled).length

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">🛠️</span>
          Tools
        </CardTitle>
        <CardDescription>
          {enabledCount} / {tools.length} enabled
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
              tool.enabled ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <p className={`font-medium ${tool.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {tool.name}
                </p>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            </div>
            <Switch
              checked={tool.enabled}
              onCheckedChange={() => onToggle(tool.id)}
              aria-label={`Toggle ${tool.name} on or off`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
