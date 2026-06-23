import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, X, Eye, EyeOff, Layers,
  Search, Grid3X3, ChevronLeft, ChevronRight,
  Ship, Zap, ScrollText, AlertTriangle, BookOpen, HelpCircle
} from 'lucide-react'

interface CardSheet {
  id: string
  title: string
  subtitle: string
  image: string
  category: string
  cardCount: number
  cardRange: string
  icon: React.ElementType
  color: string
}

const CARD_SHEETS: CardSheet[] = [
  {
    id: 'sheet-01', title: 'Sectors & Characters', subtitle: 'The people and places of New Horizon Island',
    image: '/cards/sheet-01-sector-characters.png', category: 'sectors',
    cardCount: 8, cardRange: 'Cards 1–8', icon: Ship, color: '#4a9eff',
  },
  {
    id: 'sheet-02', title: 'Mission Cards', subtitle: 'Investigation missions for World Council teams',
    image: '/cards/sheet-02-missions.png', category: 'missions',
    cardCount: 8, cardRange: 'Cards 9–16', icon: ScrollText, color: '#ffd166',
  },
  {
    id: 'sheet-03', title: 'Clue Cards', subtitle: 'Evidence and discoveries found across the island',
    image: '/cards/sheet-03-clues.png', category: 'clues',
    cardCount: 8, cardRange: 'Cards 17–24', icon: Search, color: '#4ade80',
  },
  {
    id: 'sheet-04', title: 'Event Cards', subtitle: 'Unexpected events that change the island',
    image: '/cards/sheet-04-events.png', category: 'events',
    cardCount: 8, cardRange: 'Cards 25–32', icon: Zap, color: '#a78bfa',
  },
  {
    id: 'sheet-05', title: 'Reference Cards', subtitle: 'English support and team guidance',
    image: '/cards/sheet-05-reference.png', category: 'reference',
    cardCount: 4, cardRange: 'Cards 33–36', icon: BookOpen, color: '#fbbf24',
  },
]

const CATEGORIES = [
  { key: 'all', label: 'All Cards', icon: Grid3X3 },
  { key: 'sectors', label: 'Sectors', icon: Layers },
  { key: 'missions', label: 'Missions', icon: ScrollText },
  { key: 'clues', label: 'Clues', icon: Search },
  { key: 'events', label: 'Events', icon: AlertTriangle },
  { key: 'reference', label: 'Reference', icon: BookOpen },
]

export default function CardsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedSheet, setSelectedSheet] = useState<number | null>(null)
  const [teacherView, setTeacherView] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const modalRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const filteredSheets = activeCategory === 'all'
    ? CARD_SHEETS
    : CARD_SHEETS.filter(s => s.category === activeCategory)

  const totalCards = CARD_SHEETS.reduce((sum, s) => sum + s.cardCount, 0)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedSheet === null) return
      if (e.key === 'Escape') setSelectedSheet(null)
      if (e.key === 'ArrowLeft') prevSheet()
      if (e.key === 'ArrowRight') nextSheet()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedSheet, filteredSheets])

  const prevSheet = useCallback(() => {
    if (selectedSheet === null) return
    setSelectedSheet(selectedSheet > 0 ? selectedSheet - 1 : filteredSheets.length - 1)
  }, [selectedSheet, filteredSheets])

  const nextSheet = useCallback(() => {
    if (selectedSheet === null) return
    setSelectedSheet(selectedSheet < filteredSheets.length - 1 ? selectedSheet + 1 : 0)
  }, [selectedSheet, filteredSheets])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSheet() : prevSheet()
    }
  }

  const currentSheet = selectedSheet !== null ? filteredSheets[selectedSheet] : null

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel-strong border-b border-[#48d1cc]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-[#a8bfd4] hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#48d1cc]" />
            <h1 className="text-lg md:text-xl font-bold text-white">Investigation Cards</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTeacherView(!teacherView)}
              className="text-[#a8bfd4] hover:text-[#48d1cc] text-xs hidden md:flex"
            >
              {teacherView ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
              {teacherView ? 'Hide Stats' : 'Teacher View'}
            </Button>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Teacher Stats Bar */}
        {teacherView && (
          <div className="mb-6 glass-panel p-4 border border-[#48d1cc]/20 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#48d1cc]">{totalCards}</p>
                <p className="text-xs text-[#a8bfd4]">Total Cards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#ffd166]">{CARD_SHEETS.length}</p>
                <p className="text-xs text-[#a8bfd4]">Card Sheets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#4ade80]">{CATEGORIES.length - 1}</p>
                <p className="text-xs text-[#a8bfd4]">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#a78bfa]">{filteredSheets.length}</p>
                <p className="text-xs text-[#a8bfd4]">Visible Sheets</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? 'bg-[#48d1cc] text-[#0a1628] border-[#48d1cc]'
                    : 'bg-[rgba(255,255,255,0.05)] text-[#a8bfd4] border-[rgba(75,130,180,0.25)] hover:border-[#48d1cc]/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Card Gallery */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-panel h-64 animate-pulse bg-[rgba(255,255,255,0.03)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filteredSheets.map((sheet, index) => {
              const Icon = sheet.icon
              return (
                <button
                  key={sheet.id}
                  onClick={() => setSelectedSheet(index)}
                  className="group glass-panel overflow-hidden text-left transition-all hover:border-[#48d1cc]/50 hover:shadow-lg hover:shadow-[#48d1cc]/5 focus:outline-none focus:ring-2 focus:ring-[#48d1cc]/40"
                >
                  {/* Card Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[rgba(8,22,36,0.9)]">
                    <img
                      src={sheet.image}
                      alt={sheet.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-70" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(10,22,40,0.85)] border border-[#48d1cc]/30 text-[#48d1cc]">
                        {sheet.cardRange}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(72,209,204,0.2)] text-[#48d1cc] border border-[#48d1cc]/30">
                        Tap to enlarge
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: sheet.color }} />
                      <h3 className="text-white font-bold text-sm">{sheet.title}</h3>
                    </div>
                    <p className="text-xs text-[#a8bfd4]">{sheet.subtitle}</p>
                    {teacherView && (
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-[#a8bfd4]/70">
                        <span>{sheet.cardCount} cards</span>
                        <span className="w-px h-3 bg-[#48d1cc]/20" />
                        <span>{sheet.category}</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {filteredSheets.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[#48d1cc]/30" />
            <p className="text-[#a8bfd4]">No cards in this category.</p>
            <p className="text-xs text-[#a8bfd4]/60 mt-1">Select &quot;All Cards&quot; to see everything.</p>
          </div>
        )}
      </main>

      {/* Full-Screen Card Viewer Modal */}
      {currentSheet && selectedSheet !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setSelectedSheet(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 bg-[#0a1628]/95 backdrop-blur-sm" />

          <div
            ref={modalRef}
            className="relative z-10 w-full h-full flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#48d1cc]/10 bg-[rgba(10,22,40,0.9)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSheet(null)}
                  className="p-1.5 rounded-lg text-[#a8bfd4] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-white font-bold text-sm">{currentSheet.title}</h2>
                  <p className="text-[10px] text-[#a8bfd4]">{currentSheet.cardRange} &bull; {currentSheet.cardCount} cards</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#a8bfd4]">
                  {selectedSheet + 1} / {filteredSheets.length}
                </span>
              </div>
            </div>

            {/* Card Image */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <img
                src={currentSheet.image}
                alt={currentSheet.title}
                className="max-w-full max-h-full object-contain rounded-lg border border-[#48d1cc]/10 shadow-2xl"
                draggable={false}
              />
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#48d1cc]/10 bg-[rgba(10,22,40,0.9)]">
              <button
                onClick={prevSheet}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-[#a8bfd4] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-1">
                {filteredSheets.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSheet(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === selectedSheet ? 'bg-[#48d1cc] w-4' : 'bg-[#48d1cc]/30 hover:bg-[#48d1cc]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSheet}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-[#a8bfd4] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all text-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
