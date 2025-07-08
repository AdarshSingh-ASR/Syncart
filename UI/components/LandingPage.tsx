import Navbar from "./Navbar"
import Footer from "./Footer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              The Future of E-Commerce is Conversational
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Experience a seamless, AI-driven shopping assistant that understands your needs. Built with Coral, Groq, and LiveKit for a truly interactive experience.
            </p>
            <Link href="/agent-interaction">
              <button className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-md text-lg hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring">
                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Powered by a Modern Stack</h2>
              <p className="text-lg text-muted-foreground mt-3">Integrated with the best-in-class AI and communication technologies.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-8 bg-background rounded-lg border">
                <div className="text-3xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold mb-2">Real-time Voice</h3>
                <p className="text-muted-foreground">Natural and responsive voice interactions powered by LiveKit for hands-free control.</p>
              </div>
              <div className="p-8 bg-background rounded-lg border">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold mb-2">Fast AI Responses</h3>
                <p className="text-muted-foreground">Lightning-fast and intelligent conversations driven by the Groq LPU Inference Engine.</p>
              </div>
              <div className="p-8 bg-background rounded-lg border">
                <div className="text-3xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">Secure Agent Protocol</h3>
                <p className="text-muted-foreground">Reliable and secure communication between AI agents, managed by Coral Protocol.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
