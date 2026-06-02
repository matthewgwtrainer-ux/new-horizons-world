import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Compass, Ship, Leaf, Cpu, BookOpen, Sparkles, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  const handleJoin = () => {
    if (joinCode.trim()) {
      navigate(`/world/${joinCode.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/island-hero.jpg"
          alt="New Horizon Island"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/40 to-[#0a1628]/90" />
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
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Compass className="w-10 h-10 text-[#48d1cc] animate-pulse-slow" />
            <span className="text-lg text-[#a8bfd4] tracking-widest uppercase">AI Simulation World ECA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 text-glow">
            Kimi's <span className="text-[#48d1cc]">Horizon</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#a8bfd4] max-w-2xl mx-auto">
            Can your English make an AI world come alive?
          </p>
        </div>

        {/* Sector preview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-4xl w-full animate-slide-up">
          {[
            { icon: Ship, label: 'Harbour', color: '#4a9eff' },
            { icon: Leaf, label: 'Garden', color: '#4ade80' },
            { icon: Cpu, label: 'Tech', color: '#a78bfa' },
            { icon: BookOpen, label: 'Culture', color: '#fbbf24' },
          ].map((sector, i) => (
            <div
              key={sector.label}
              className="glass-panel p-4 text-center hover:scale-105 transition-transform cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <sector.icon className="w-8 h-8 mx-auto mb-2" style={{ color: sector.color }} />
              <span className="text-sm text-[#a8bfd4]">{sector.label}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          {!showJoin ? (
            <>
              <Button
                size="lg"
                onClick={() => setShowJoin(true)}
                className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join a World
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/teacher/NHI2026')}
                className="border-[#48d1cc]/50 text-[#48d1cc] hover:bg-[#48d1cc]/10 px-8 py-6 text-lg rounded-xl"
              >
                Teacher Panel
              </Button>
            </>
          ) : (
            <div className="flex gap-3 animate-fade-in">
              <Input
                placeholder="Enter world code (e.g., NHI2026)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className="w-72 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white placeholder:text-[#a8bfd4]/50 text-lg py-6"
                autoFocus
              />
              <Button
                onClick={handleJoin}
                className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-6 py-6 rounded-xl"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Default hint */}
        <p className="mt-6 text-sm text-[#a8bfd4]/60">
          Default world code: <span className="text-[#48d1cc] font-mono">NHI2026</span>
        </p>
      </div>
    </div>
  )
}
