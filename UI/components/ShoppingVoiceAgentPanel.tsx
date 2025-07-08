"use client"

import { ShoppingVoiceAgent } from "./ShoppingVoiceAgent"
import type { Message, OrderItem } from "./AgentInteraction"
import "@livekit/components-styles"
import { Mic } from "lucide-react"

interface VoiceAgentPanelProps {
  onMessage: (message: Omit<Message, "id" | "timestamp">) => void
  onOrderUpdate: (items: OrderItem[]) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export default function ShoppingVoiceAgentPanel({
  onMessage,
  onOrderUpdate,
  isRecording,
  setIsRecording,
}: VoiceAgentPanelProps) {
  return (
    <div className="bg-card border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Shopping Assistant</h2>
            <p className="text-sm text-muted-foreground">Speak to buy</p>
          </div>
        </div>
      </div>

      {/* Shopping Voice Agent Component */}
      <div className="mt-4">
        <ShoppingVoiceAgent />
      </div>
    </div>
  )
} 