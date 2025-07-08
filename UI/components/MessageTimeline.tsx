"use client"

import { useState } from "react"
import type { Message } from "./AgentInteraction"

interface MessageTimelineProps {
  messages: Message[]
}

export default function MessageTimeline({ messages }: MessageTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  if (messages.length === 0) return null

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Message Timeline</h3>
          <div className="flex items-center space-x-4">
            <button onClick={() => setDebugMode(!debugMode)} className="text-sm text-gray-600 hover:text-gray-900">
              {debugMode ? "Hide" : "Show"} Debug
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className="flex items-start space-x-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        message.speaker === "voice" ? "bg-purple-500" : "bg-blue-500"
                      }`}
                    ></div>
                    {index < messages.length - 1 && <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.speaker === "voice" ? "Voice Agent" : "Interface Agent"}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Coral Protocol</span>
                      <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>

                    {debugMode && message.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Show payload</summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(message.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
