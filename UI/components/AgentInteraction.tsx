"use client"

import { useState } from "react"
import VoiceAgentPanel from "./VoiceAgentPanel"
import InterfaceAgentPanel from "./InterfaceAgentPanel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ShoppingVoiceAgentPanel from "./ShoppingVoiceAgentPanel"
import ShoppingInterfaceAgentPanel from "./ShoppingInterfaceAgentPanel"

export interface Message {
  id: string
  speaker: "voice" | "interface" | "user"
  content: string
  timestamp: Date
  type: "transcription" | "response" | "tool-call"
  metadata?: any
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

// Generate unique ID using timestamp and random number
const generateUniqueId = () => {
  return `msg-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`
}

export default function AgentInteraction() {
  // State for Restaurant Agent
  const [messages, setMessages] = useState<Message[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isRecording, setIsRecording] = useState(false)

  // State for Shopping Agent
  const [shoppingMessages, setShoppingMessages] = useState<Message[]>([])
  const [shoppingOrderItems, setShoppingOrderItems] = useState<OrderItem[]>([])
  const [isShoppingRecording, setIsShoppingRecording] = useState(false)

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: generateUniqueId(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addShoppingMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `shopping-${generateUniqueId()}`,
      timestamp: new Date(),
    }
    setShoppingMessages((prev) => [...prev, newMessage])
  }

  const updateOrder = (items: OrderItem[]) => {
    setOrderItems(items)
  }

  const updateShoppingOrder = (items: OrderItem[]) => {
    setShoppingOrderItems(items)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <div className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-muted-foreground">Agents Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Shopping Agent Column */}
          <div className="space-y-8">
            <ShoppingVoiceAgentPanel
              onMessage={addShoppingMessage}
              onOrderUpdate={updateShoppingOrder}
              isRecording={isShoppingRecording}
              setIsRecording={setIsShoppingRecording}
            />
            <ShoppingInterfaceAgentPanel
              messages={shoppingMessages}
              orderItems={shoppingOrderItems}
              onMessage={addShoppingMessage}
              apiEndpoint="http://localhost:8001"
            />
          </div>

          {/* Restaurant Agent Column */}
          <div className="space-y-8">
            <VoiceAgentPanel
              onMessage={addMessage}
              onOrderUpdate={updateOrder}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
            <InterfaceAgentPanel
              messages={messages}
              orderItems={orderItems}
              onMessage={addMessage}
              apiEndpoint="http://localhost:8000"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
