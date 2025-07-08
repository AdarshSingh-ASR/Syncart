"use client"

import { useEffect, useState } from "react"

interface WaveformProps {
  isActive: boolean
}

export default function Waveform({ isActive }: WaveformProps) {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0))
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isActive || !isClient) {
      setBars(Array(20).fill(0))
      return
    }

    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => Math.random() * 100))
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, isClient])

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex items-end justify-center space-x-1 h-20">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`w-2 bg-gradient-to-t transition-all duration-100 ${
              isActive ? "from-purple-400 to-blue-500" : "from-gray-300 to-gray-400"
            }`}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        ))}
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">{isActive ? "Listening..." : "Audio Waveform"}</p>
    </div>
  )
}
