import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Compass, Sparkles, ArrowRight, BookOpen, Shield, Layers, Map } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [joinError, setJoinError] = useState(false)

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase()
    if (code === 'NHI2026') {
      setJoinError(false)
      navigate(`/world/${code}`)
    } else {
      setJoinError(true)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/island-hero.jpg"
          alt="New Horizon Island"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-[#0a1628]/50 to-[#0a1628]/95" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#48d1cc]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo area */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Compass className="w-8 h-8 text-[#48d1cc] animate-pulse-slow" />
            <span className="text-sm md:text-base text-[#a8bfd4] tracking-widest uppercase">AI Simulation World ECA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 text-glow">
            New Horizons <span className="text-[#48d1cc]">World</span>
          </h1>
          <p className="text-lg md:text-xl text-[#a8bfd4] max-w-xl mx-auto">
            Can your English make an AI world come alive?
          </p>
        </div>

        {/* Five action buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 animate-slide-up justify-center">
          {/* Introduction Button — PRIMARY for Session 1 */}
          <Button
            size="lg"
            onClick={() => navigate('/introduction')}
            className="bg-[#ffd166] hover:bg-[#e5bc5c] text-[#0a1628] font-bold px-6 py-6 text-base rounded-xl transition-all hover:scale-105 shadow-lg shadow-[#ffd166]/20"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Introduction
          </Button>

          {!showJoin ? (
            <Button
              size="lg"
              onClick={() => setShowJoin(true)}
              className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-6 py-6 text-base rounded-xl transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Join a World
            </Button>
          ) : (
            <div className="flex gap-2 animate-fade-in">
              <Input
                placeholder="Ask your teacher for the login code"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value); setJoinError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className={`w-64 bg-[rgba(16,40,72,0.9)] border py-6 text-white placeholder:text-[#a8bfd4]/50 ${joinError ? 'border-red-500/60 ring-1 ring-red-500/30' : 'border-[#48d1cc]/30'}`}
                autoFocus
              />
              <Button onClick={handleJoin} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-4 py-6 rounded-xl">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          <Button
            size="lg"
            onClick={() => navigate('/cards')}
            className="bg-[#a78bfa] hover:bg-[#9578e6] text-[#0a1628] font-bold px-6 py-6 text-base rounded-xl transition-all hover:scale-105"
          >
            <Layers className="w-5 h-5 mr-2" />
            Cards
          </Button>

          <Button
            size="lg"
            onClick={() => navigate('/map')}
            className="bg-[#4ade80] hover:bg-[#3ecf6f] text-[#0a1628] font-bold px-6 py-6 text-base rounded-xl transition-all hover:scale-105"
          >
            <Map className="w-5 h-5 mr-2" />
            Island Map
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/teacher/NHI2026')}
            className="border-[#48d1cc]/50 text-[#48d1cc] hover:bg-[#48d1cc]/10 px-6 py-6 text-base rounded-xl"
          >
            <Shield className="w-5 h-5 mr-2" />
            Teacher
          </Button>
        </div>

        {/* Trailer Video */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="rounded-2xl overflow-hidden border border-[#48d1cc]/20 shadow-lg shadow-[#48d1cc]/5">
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/prw633AINLc"
                title="New Horizon Island Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
          <p className="text-center text-xs text-[#a8bfd4]/50 mt-2">
            Watch the official trailer before you begin your investigation
          </p>
        </div>

        {/* Default hint */}
        <p className="mt-5 text-sm text-[#a8bfd4]/60">
          New to the project? Start with <span className="text-[#ffd166]">Introduction</span>
        </p>
        {joinError && (
          <p className="mt-2 text-sm text-red-400 font-medium animate-pulse">
            Incorrect code. Ask your teacher for the login code.
          </p>
        )}
        <p className="mt-1 text-sm text-[#a8bfd4]/40">
          Students need the teacher login code to enter the world.
        </p>
      </div>
    </div>
  )
}
