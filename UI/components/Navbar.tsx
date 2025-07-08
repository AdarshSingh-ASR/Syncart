"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold">🤖 Syncart</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="/agent-interaction"
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-muted transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
