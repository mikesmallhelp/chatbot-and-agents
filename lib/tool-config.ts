import { tool, type Tool as AITool } from "ai"
import { z } from "zod"

// Tool configuration
export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  enabled: boolean
}

// Default tools - users can modify these
export const defaultTools: Tool[] = [
  {
    id: "weather",
    name: "Weather",
    description: "Fetches weather information based on location",
    icon: "🌤️",
    enabled: true,
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Performs mathematical calculations",
    icon: "🧮",
    enabled: true,
  },
  {
    id: "web-search",
    name: "Web Search",
    description: "Searches for information on the web",
    icon: "🔍",
    enabled: true,
  },
  {
    id: "datetime",
    name: "Date & Time",
    description: "Shows current time and date",
    icon: "🕐",
    enabled: true,
  },
  {
    id: "translator",
    name: "Translator",
    description: "Translates text to different languages",
    icon: "🌐",
    enabled: false,
  },
  {
    id: "notes",
    name: "Notes",
    description: "Saves and retrieves notes",
    icon: "📝",
    enabled: false,
  },
]

// Tool definitions for each tool
export function createTools(enabledTools: string[]) {
  const allTools: Record<string, AITool> = {
    weather: tool({
      description: "Fetch weather information based on location. Use when the user asks about weather.",
      inputSchema: z.object({
        location: z.string().describe('Location, e.g. "Helsinki" or "New York"'),
      }),
      execute: async ({ location }) => {
        console.log(`[TOOL:weather] 🌤️  Fetching weather for: ${location}`)

        // Simulated weather data
        const conditions = ["sunny", "cloudy", "rainy", "snowy", "windy"]
        const condition = conditions[Math.floor(Math.random() * conditions.length)]
        const temperature = Math.floor(Math.random() * 35) - 10

        const result = {
          location,
          temperature,
          condition,
          humidity: Math.floor(Math.random() * 60) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
        }

        console.log(`[TOOL:weather] ✅ Result:`, result)
        return result
      },
    }),

    calculator: tool({
      description: "Perform mathematical calculations. Use when the user asks to calculate something.",
      inputSchema: z.object({
        expression: z.string().describe('Mathematical expression, e.g. "2 + 2" or "sqrt(16)"'),
      }),
      execute: async ({ expression }) => {
        console.log(`[TOOL:calculator] 🧮 Calculating: ${expression}`)

        try {
          // Safe calculation
          const sanitized = expression.replace(/[^0-9+\-*/().sqrt\s]/g, "")
          const withSqrt = sanitized.replace(/sqrt$$([^)]+)$$/g, "Math.sqrt($1)")
          const result = Function(`"use strict"; return (${withSqrt})`)()

          console.log(`[TOOL:calculator] ✅ Result: ${result}`)
          return { expression, result, success: true }
        } catch {
          console.log(`[TOOL:calculator] ❌ Error: Invalid expression`)
          return { expression, error: "Invalid expression", success: false }
        }
      },
    }),

    "web-search": tool({
      description: "Search for information on the web. Use when the user asks something that requires additional information.",
      inputSchema: z.object({
        query: z.string().describe("Search keyword or phrase"),
      }),
      execute: async ({ query }) => {
        console.log(`[TOOL:web-search] 🔍 Searching for: ${query}`)

        // Simulated web search
        const result = {
          query,
          results: [
            { title: `Results for: ${query}`, snippet: "This is a simulated search result..." },
            { title: `More information: ${query}`, snippet: "Here you can find more information about the topic..." },
          ],
          totalResults: 2,
        }

        console.log(`[TOOL:web-search] ✅ Found ${result.totalResults} results`)
        return result
      },
    }),

    datetime: tool({
      description: "Show current date and time. Use when the user asks about time or date.",
      inputSchema: z.object({
        timezone: z.string().optional().describe('Timezone, e.g. "Europe/Helsinki" or "America/New_York"'),
      }),
      execute: async ({ timezone = "Europe/Helsinki" }) => {
        console.log(`[TOOL:datetime] 🕐 Getting time for timezone: ${timezone}`)

        const now = new Date()
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          dateStyle: "full",
          timeStyle: "long",
        })

        const result = {
          formatted: formatter.format(now),
          iso: now.toISOString(),
          timezone,
        }

        console.log(`[TOOL:datetime] ✅ Time: ${result.formatted}`)
        return result
      },
    }),

    translator: tool({
      description: "Translate text to different languages.",
      inputSchema: z.object({
        text: z.string().describe("Text to translate"),
        targetLanguage: z.string().describe('Target language, e.g. "Spanish" or "French"'),
      }),
      execute: async ({ text, targetLanguage }) => {
        console.log(`[TOOL:translator] 🌐 Translating to ${targetLanguage}: "${text.substring(0, 50)}..."`)

        // Simulated translation
        const result = {
          original: text,
          translated: `[Translation to ${targetLanguage}]: ${text}`,
          targetLanguage,
        }

        console.log(`[TOOL:translator] ✅ Translation completed`)
        return result
      },
    }),

    notes: tool({
      description: "Save or retrieve notes.",
      inputSchema: z.object({
        action: z.enum(["save", "list"]).describe('Action: "save" or "list"'),
        content: z.string().optional().describe("Note content (only when saving)"),
      }),
      execute: async ({ action, content }) => {
        console.log(`[TOOL:notes] 📝 Action: ${action}`)

        if (action === "save" && content) {
          console.log(`[TOOL:notes] ✅ Saved note: "${content.substring(0, 50)}..."`)
          return { action: "saved", content, timestamp: new Date().toISOString() }
        }

        console.log(`[TOOL:notes] ✅ Listed notes`)
        return { action: "list", notes: ["Example note 1", "Example note 2"] }
      },
    }),
  }

  // Return only enabled tools
  const enabledToolsMap: Record<string, AITool> = {}
  for (const toolId of enabledTools) {
    if (allTools[toolId]) {
      enabledToolsMap[toolId] = allTools[toolId]
    }
  }
  return enabledToolsMap
}
