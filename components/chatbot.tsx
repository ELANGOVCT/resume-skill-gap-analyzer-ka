"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, X, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const careerKnowledgeBase = [
  {
    keywords: ["resume", "improve", "better", "optimize", "ats"],
    response: `Here are key tips to improve your resume:

1. Use action verbs and quantify achievements
2. Tailor your resume to each job description
3. Include relevant keywords from the job posting
4. Keep formatting clean and ATS-friendly
5. Highlight measurable results and impact

Would you like specific advice on any of these areas?`,
  },
  {
    keywords: ["skill", "learn", "course", "training", "study"],
    response: `Great question about learning new skills! Here's my recommendation:

1. Start with high-priority skills from your gap analysis
2. Use a mix of resources: online courses, documentation, hands-on projects
3. Build portfolio projects to demonstrate proficiency
4. Consider certifications for in-demand skills
5. Practice consistently - even 30 minutes daily helps

What specific skill are you most interested in learning?`,
  },
  {
    keywords: ["python", "javascript", "java", "programming", "coding"],
    response: `Programming skills are highly valued! Here's how to learn effectively:

1. Start with fundamentals: syntax, data structures, algorithms
2. Practice on platforms like LeetCode, HackerRank, or CodeWars
3. Build real projects that solve actual problems
4. Read and contribute to open-source code
5. Join coding communities for support

Recommended resources:
- freeCodeCamp (free)
- Codecademy
- The Odin Project
- Official documentation`,
  },
  {
    keywords: ["interview", "preparation", "job search", "apply"],
    response: `Interview preparation tips:

1. Research the company thoroughly
2. Practice common technical and behavioral questions
3. Prepare STAR method responses for behavioral questions
4. Have questions ready to ask the interviewer
5. Do mock interviews with friends or online platforms

For job searching:
- Customize each application
- Network on LinkedIn
- Apply early in the posting cycle
- Follow up professionally`,
  },
  {
    keywords: ["experience", "entry level", "junior", "beginner"],
    response: `Breaking into the field without experience:

1. Build a strong portfolio with 3-5 solid projects
2. Contribute to open-source projects
3. Do freelance work or internships
4. Create a technical blog to showcase knowledge
5. Network actively on LinkedIn and at events
6. Consider bootcamps or mentorship programs

Remember: Everyone starts somewhere. Focus on demonstrating your ability to learn and solve problems!`,
  },
  {
    keywords: ["salary", "negotiate", "compensation", "pay"],
    response: `Career and compensation advice:

1. Research market rates on Glassdoor, Levels.fyi, or Payscale
2. Know your worth based on skills and location
3. Practice negotiation conversations
4. Consider total compensation (benefits, equity, etc.)
5. Be professional and data-driven in discussions

Timing matters - negotiate after receiving an offer, not during interviews.`,
  },
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const findBestResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    for (const item of careerKnowledgeBase) {
      if (item.keywords.some((keyword) => lowerInput.includes(keyword))) {
        return item.response
      }
    }

    return `Thanks for your question! I can help you with:

- Resume improvement and optimization
- Learning new skills and courses
- Programming and technical skills
- Interview preparation
- Career advice for beginners
- Salary and compensation guidance

What would you like to know more about?`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: findBestResponse(input),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 shadow-lg transition-all",
          isOpen && "hidden",
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col shadow-2xl">
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Career Assistant
              </CardTitle>
              <CardDescription>Ask me about skill development</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  <div>
                    <Bot className="mx-auto mb-2 h-8 w-8 text-primary/50" />
                    <p>Hi! I'm your career assistant.</p>
                    <p className="mt-2">Ask me about improving your resume or learning new skills!</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "user" ? "bg-primary" : "bg-muted",
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div
                      className={cn(
                        "whitespace-pre-line rounded-lg px-3 py-2 text-sm",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-[60px]">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
