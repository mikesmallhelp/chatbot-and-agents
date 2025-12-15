import { convertToModelMessages, streamText, type UIMessage, stepCountIs, consumeStream } from "ai"
import { createTools } from "@/lib/tool-config"

export const maxDuration = 60

export async function POST(req: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const timestamp = new Date().toISOString()

  console.log("\n" + "=".repeat(80))
  console.log(`[${timestamp}] 🚀 NEW REQUEST: ${requestId}`)
  console.log("=".repeat(80))

  try {
    const { messages, enabledTools }: { messages: UIMessage[]; enabledTools: string[] } = await req.json()

    console.log(`[${requestId}] 📥 Incoming request:`)
    console.log(`  - Messages count: ${messages.length}`)
    console.log(`  - Enabled tools: [${enabledTools.join(", ")}]`)
    const lastMessage = messages[messages.length - 1]
    const lastPart = lastMessage?.parts?.[0]
    const lastMessageText = lastPart && 'type' in lastPart && lastPart.type === "text" && 'text' in lastPart
      ? lastPart.text.substring(0, 100)
      : "N/A"
    console.log(`  - Last message: ${lastMessageText}`)

    const tools = createTools(enabledTools)
    const prompt = convertToModelMessages(messages)

    const model = process.env.AI_GATEWAY_MODEL || "openai/gpt-5-mini"
    console.log(`[${requestId}] 🤖 Calling AI model: ${model}`)
    console.log(`  - Available tools: ${Object.keys(tools).length}`)

    const result = streamText({
      model,
      system: `You are a helpful AI assistant.
You have access to the following tools: ${enabledTools.join(", ")}.
Use these tools when appropriate to respond to the user's requests.
Be friendly and clear in your responses.`,
      messages: prompt,
      tools,
      stopWhen: stepCountIs(5),
      abortSignal: req.signal,
      onFinish: async ({ text, finishReason, usage, toolCalls, toolResults }) => {
        const finishTimestamp = new Date().toISOString()
        console.log(`\n[${finishTimestamp}] ✅ REQUEST COMPLETED: ${requestId}`)
        console.log(`  - Finish reason: ${finishReason}`)
        console.log(`  - Response length: ${text.length} characters`)
        console.log(`  - Token usage:`, usage)

        if (toolCalls && toolCalls.length > 0) {
          console.log(`  - Tool calls: ${toolCalls.length}`)
          toolCalls.forEach((call, index) => {
            console.log(`    ${index + 1}. Tool: ${call.toolName}`)
            // Handle both typed and dynamic tool calls
            const args = 'args' in call ? call.args : 'input' in call ? call.input : undefined
            console.log(`       Args:`, args)
          })
        }

        if (toolResults && toolResults.length > 0) {
          console.log(`  - Tool results: ${toolResults.length}`)
          toolResults.forEach((result, index) => {
            console.log(`    ${index + 1}. Tool: ${result.toolName}`)
            // Handle both typed and dynamic tool results
            const output = 'result' in result ? result.result : 'output' in result ? result.output : undefined
            console.log(`       Result:`, output)
          })
        }

        console.log("=".repeat(80) + "\n")
      },
      onError: (error) => {
        console.error(`\n[${requestId}] ❌ ERROR:`, error)
        console.error("=".repeat(80) + "\n")
      },
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error(`\n[${requestId}] ❌ REQUEST ERROR:`, error)
    console.error("=".repeat(80) + "\n")
    throw error
  }
}
