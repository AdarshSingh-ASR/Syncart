"use client"

import { useState, useEffect, useRef } from "react"
import type { Message, OrderItem } from "./AgentInteraction"
import { Send, Bot, User, Code } from "lucide-react"

interface ShoppingInterfaceAgentPanelProps {
  messages: Message[]
  orderItems: OrderItem[]
  onMessage: (message: Omit<Message, "id" | "timestamp">) => void
  apiEndpoint: string
}

interface ToolStatus {
  tool_name: string
  status: string
  details: Record<string, any>
}

export default function ShoppingInterfaceAgentPanel({
  messages,
  orderItems,
  onMessage,
  apiEndpoint,
}: ShoppingInterfaceAgentPanelProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState<ToolStatus>({ tool_name: "", status: "idle", details: {} })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Poll for agent questions
  useEffect(() => {
    let isPolling = true

    const pollForQuestions = async () => {
      while (isPolling) {
        try {
          const response = await fetch(`${apiEndpoint}/agent/question`)

          if (response.status === 200) {
            const data = await response.json()
            onMessage({
              speaker: "interface",
              content: data.question,
              type: "response",
            })
          } else if (response.status !== 204) {
            // console.error("Error polling for questions:", response.statusText)
          }
        } catch (error) {
          // console.error("Error polling for questions:", error)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    pollForQuestions()
    return () => {
      isPolling = false
    }
  }, [onMessage, apiEndpoint])

  // Poll for tool status
  useEffect(() => {
    let isPolling = true

    const pollForToolStatus = async () => {
      while (isPolling) {
        try {
          const response = await fetch(`${apiEndpoint}/agent/tool-status`)

          if (response.ok) {
            const data = await response.json()
            setToolStatus(data)
          }
        } catch (error) {
          // console.error("Error polling for tool status:", error)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    pollForToolStatus()
    return () => {
      isPolling = false
    }
  }, [apiEndpoint])

  const sendToAPI = async (text: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${apiEndpoint}/agent/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending message to API:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = inputMessage.trim()

      onMessage({
        speaker: "user",
        content: userMessage,
        type: "response",
      })

      setInputMessage("")

      try {
        await sendToAPI(userMessage)
      } catch (error) {
        onMessage({
          speaker: "interface",
          content: "Error: Could not send response to the agent. Please try again.",
          type: "response",
        })
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-card border rounded-lg p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Shopping Interface Agent</h2>
            <p className="text-sm text-muted-foreground">Text-based agent for shopping</p>
          </div>
        </div>
        {/* Tool Status */}
        {toolStatus.status !== "idle" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code className="w-4 h-4" />
                <span>Executing: {toolStatus.tool_name}</span>
            </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 mb-6 overflow-y-auto min-h-[200px] max-h-[400px] pr-2">
        <div className="space-y-6">
          {messages
            .filter((m) => m.speaker === "interface" || m.speaker === "user")
            .map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.speaker === 'user' ? 'justify-end' : ''}`}
              >
                {message.speaker === 'interface' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    message.speaker === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.speaker === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div>
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 