import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: `You are a career development assistant specializing in resume improvement and skill development. 
    
Your role is to:
- Help users understand their skill gaps
- Provide personalized learning path recommendations
- Answer questions about resume optimization and ATS systems
- Suggest strategies for career advancement
- Recommend courses, certifications, and resources for skill development

Be encouraging, specific, and actionable in your advice. Always provide concrete next steps.`,
    prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
