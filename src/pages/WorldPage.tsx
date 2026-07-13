import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Ship, Leaf, Cpu, BookOpen, Send, Scroll, Lightbulb,
  Newspaper, Activity, MessageCircle, Mic, User, Bot,
  WifiOff
} from 'lucide-react'
import {
  staticWorld, staticSectors, staticTeams, staticSessions,
  staticLogs, staticTemplates,
} from '@/data/staticWorld'

const SECTOR_IMAGES: Record<string, string> = {
  harbour: '/sector-harbour.jpg', garden: '/sector-garden.jpg',
  tech: '/sector-tech.jpg', culture: '/sector-culture.jpg',
}
const SECTOR_ICONS: Record<string, React.ElementType> = {
  harbour: Ship, garden: Leaf, tech: Cpu, culture: BookOpen,
}
const SECTOR_COLORS: Record<string, string> = {
  harbour: '#4a9eff', garden: '#4ade80', tech: '#a78bfa', culture: '#fbbf24',
}

const CITIZENS: Record<string, { name: string; role: string }[]> = {
  harbour: [
    { name: 'Harbour Manager', role: 'Manages all harbour operations' },
    { name: 'Ferry Pilot', role: 'Operates the island ferry' },
    { name: 'Supply Robot', role: 'Handles cargo and inventory' },
  ],
  garden: [
    { name: 'Botanist', role: 'Studies island plants' },
    { name: 'Water Keeper', role: 'Manages water systems' },
    { name: 'Animal Helper', role: 'Cares for island animals' },
  ],
  tech: [
    { name: 'Engineer', role: 'Maintains island technology' },
    { name: 'Repair Robot', role: 'Fixes broken equipment' },
    { name: 'Signal Officer', role: 'Monitors communications' },
  ],
  culture: [
    { name: 'Archivist', role: 'Keeps island records' },
    { name: 'Young Reporter', role: 'Writes island news' },
    { name: 'Council Guide', role: 'Helps visitors and citizens' },
  ],
}

const CITIZEN_IMAGES: Record<string, string> = {
  'Harbour Manager': '/citizens/carlos-marin.png',
  'Ferry Pilot': '/citizens/mei-lin.png',
  'Supply Robot': '/citizens/supply-robot.png',
  'Botanist': '/citizens/dr-aria-green.png',
  'Water Keeper': '/citizens/kai-ocean.png',
  'Animal Helper': '/citizens/nia-patel.png',
  'Engineer': '/citizens/malik-okafor.png',
  'Repair Robot': '/citizens/zara-kim.png',
  'Signal Officer': '/citizens/ren-sakai.png',
  'Archivist': '/citizens/mira-lee.png',
  'Young Reporter': '/citizens/sofia-cruz.png',
  'Council Guide': '/citizens/leo-walker.png',
}

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Use static data as primary source (works without backend)
function useStaticData() {
  return {
    world: staticWorld,
    sectors: staticSectors,
    teams: staticTeams,
    sessions: staticSessions,
    logs: staticLogs,
    templates: staticTemplates,
  }
}

export default function WorldPage() {
  const { code } = useParams<{ code: string }>()
  const safeCode = code || 'NHI2026'

  // Always load static data immediately
  const staticData = useStaticData()

  // Try to fetch from backend (for cross-device sync when available)
  const worldQuery = trpc.world.getByCode.useQuery({ code: safeCode })
  const reportsQuery = trpc.report.listByWorld.useQuery(
    { worldId: staticData.world.id },
    { enabled: !!worldQuery.data, retry: 1 }
  )
  const logsQuery = trpc.log.listByWorld.useQuery(
    { worldId: staticData.world.id },
    { enabled: !!worldQuery.data, retry: 1 }
  )

  // Merge: use API data if available and non-empty, otherwise static
  const world = worldQuery.data || staticData.world
  const sectors = (worldQuery.data && staticData.sectors.length > 0) ? staticData.sectors : staticData.sectors
  const teams = (worldQuery.data && staticData.teams.length > 0) ? staticData.teams : staticData.teams
  const sessions = (worldQuery.data && staticData.sessions.length > 0) ? staticData.sessions : staticData.sessions
  const logs = logsQuery.isSuccess ? logsQuery.data : staticData.logs
  const templates = staticData.templates

  // Reports: localStorage + API merge (deduplicated by ID)
  const [localReports, setLocalReports] = useState<any[]>([])
  useEffect(() => {
    try { const r = localStorage.getItem('nhw-reports'); if (r) setLocalReports(JSON.parse(r)) } catch {}
  }, [])
  const apiReports = reportsQuery.data || []
  // Merge and deduplicate: prefer API version if same ID exists in both
  const reportMap = new Map<string, any>()
  for (const r of apiReports) { reportMap.set(String(r.id), r) }
  for (const r of localReports) {
    const key = String(r.id)
    if (!reportMap.has(key)) { reportMap.set(key, r) }
  }
  const allReports = Array.from(reportMap.values()).sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const currentSession = sessions.find((s: any) => s.sessionId === (world?.currentSession || 1))

  // UI State
  const [selectedSectorId, setSelectedSectorId] = useState('harbour')
  const [selectedTeamId, setSelectedTeamId] = useState('T1')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Report state
  const [reportTitle, setReportTitle] = useState('')
  const [reportType, setReportType] = useState('Discovery Report')
  const [reportContent, setReportContent] = useState('')
  const [reportStatus, setReportStatus] = useState('')

  // Chat state
  const [selectedCitizen, setSelectedCitizen] = useState('Harbour Manager')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [chatError, setChatError] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load chat history
  useEffect(() => {
    try {
      const key = `nhw-chat-${safeCode}-${selectedCitizen}`
      const saved = localStorage.getItem(key)
      if (saved) setChatMessages(JSON.parse(saved))
      else setChatMessages([])
      setChatError('')
    } catch { setChatMessages([]) }
  }, [selectedCitizen, safeCode])

  // Save chat history
  useEffect(() => {
    if (chatMessages.length > 0) {
      const key = `nhw-chat-${safeCode}-${selectedCitizen}`
      localStorage.setItem(key, JSON.stringify(chatMessages))
    }
  }, [chatMessages, selectedCitizen, safeCode])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  useEffect(() => {
    const team = teams.find((t: any) => t.teamId === selectedTeamId)
    if (team) setSelectedSectorId(team.sectorId)
  }, [selectedTeamId, teams])

  const selectedSector = sectors.find((s: any) => s.sectorId === selectedSectorId)
  const selectedTeam = teams.find((t: any) => t.teamId === selectedTeamId)
  const sectorCitizens = CITIZENS[selectedSectorId] || []

  // Track temp report ID to remove from localStorage after backend save
  const lastTempIdRef = useRef<number | null>(null)

  // Report submission (localStorage + backend)
  const submitReportMutation = trpc.report.submit.useMutation({
    onSuccess: (data) => {
      // Backend save succeeded — remove the temp localStorage copy to prevent duplication
      try {
        const saved = JSON.parse(localStorage.getItem('nhw-reports') || '[]')
        const backendId = String(data?.id)
        const filtered = saved.filter((r: any) => {
          const rid = String(r.id)
          // Remove if it matches the temp ID we just submitted, or if backend returned a real ID
          // that somehow collides (shouldn't happen, but being safe)
          if (lastTempIdRef.current && rid === String(lastTempIdRef.current)) return false
          if (backendId && rid === backendId) return false
          return true
        })
        localStorage.setItem('nhw-reports', JSON.stringify(filtered))
        setLocalReports(filtered)
        lastTempIdRef.current = null
      } catch {
        // Silent fail — localStorage cleanup is non-critical
      }
    },
  })

  const handleSubmitReport = () => {
    if (!reportTitle || !reportContent) return
    const tempId = Date.now()
    lastTempIdRef.current = tempId
    const newReport = {
      id: tempId, worldId: world.id, sessionId: world.currentSession,
      teamId: selectedTeamId, sectorId: selectedSectorId, reportType,
      title: reportTitle, content: reportContent, status: 'Submitted',
      teacherComment: null, createdAt: new Date().toISOString(),
    }
    // Always save to localStorage (works even if backend is down)
    const existing = JSON.parse(localStorage.getItem('nhw-reports') || '[]')
    const updated = [newReport, ...existing]
    localStorage.setItem('nhw-reports', JSON.stringify(updated))
    setLocalReports(updated)

    // Also try to save to backend database
    try {
      submitReportMutation.mutate({
        worldId: world.id,
        sessionId: world.currentSession,
        teamId: selectedTeamId,
        sectorId: selectedSectorId,
        reportType,
        title: reportTitle,
        content: reportContent,
      })
    } catch {
      // Backend save failed, but localStorage has it — silent fail
    }

    setReportStatus('Report submitted and saved!')
    setReportTitle(''); setReportContent('')
    setTimeout(() => setReportStatus(''), 3000)
  }

  // AI Chat via backend tRPC (avoids CORS)
  const chatMutation = trpc.citizenChat.chat.useMutation()

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedSector || isChatLoading) return

    const userMsg: ChatMessage = {
      id: Date.now(), role: 'user', content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)
    setChatError('')

    try {
      const result = await chatMutation.mutateAsync({
        citizenName: selectedCitizen,
        sectorName: selectedSector.name,
        sectorResponsibility: selectedSector.responsibility || '',
        currentProblem: selectedSector.currentProblem || '',
        mystery: selectedSector.mystery || '',
        teamName: selectedTeam?.name || 'World Council Team',
        studentMessage: userMsg.content,
        recentLogs: logs.slice(0, 5).map((l: any) => l.entry).join('\n') || 'The World Council teams have just arrived.',
        sessionTitle: currentSession?.title || 'Investigating the island',
        sessionNumber: world?.currentSession || 1,
        sectorId: selectedSectorId,
      })

      if (result.error) {
        setChatError('The AI citizen is having trouble connecting. Please try again.')
      }

      const botMsg: ChatMessage = {
        id: Date.now() + 1, role: 'assistant',
        content: result.response || "I'm not sure how to answer that. Could you ask me something about the island?",
        timestamp: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, botMsg])
    } catch {
      setChatError('Could not connect to the AI server. Please check your internet connection.')
      const botMsg: ChatMessage = {
        id: Date.now() + 1, role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet and try again.",
        timestamp: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, botMsg])
    } finally {
      setIsChatLoading(false)
    }
  }

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice input not supported. Try Chrome or Safari.'); return }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setChatInput(prev => prev ? prev + ' ' + t : t) }
    rec.onerror = () => setIsListening(false)
    rec.start()
  }

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-[#48d1cc]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-white">{world.name}</h1>
            <span className="text-xs text-[#48d1cc] bg-[#48d1cc]/10 px-2 py-1 rounded-full border border-[#48d1cc]/30">Session {world.currentSession}</span>
          </div>
          <p className="hidden md:block text-sm text-[#a8bfd4] italic">{world.tagline}</p>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-44 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#102848]">
              {teams.map((t: any) => <SelectItem key={t.teamId} value={t.teamId} className="text-white">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[rgba(16,40,72,0.9)] border border-[#48d1cc]/20 mb-4 h-auto flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <Activity className="w-4 h-4 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="citizens" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <MessageCircle className="w-4 h-4 mr-1" /> Talk to Citizens
            </TabsTrigger>
            <TabsTrigger value="newsroom" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <Newspaper className="w-4 h-4 mr-1" /> Newsroom
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sectors */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2"><Scroll className="w-5 h-5" /> Island Sectors</h2>
                <div className="space-y-2">
                  {sectors.map((sector: any) => {
                    const Icon = SECTOR_ICONS[sector.sectorId] || Ship
                    return (
                      <button key={sector.sectorId} onClick={() => setSelectedSectorId(sector.sectorId)}
                        className={`sector-card w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${selectedSectorId === sector.sectorId ? 'border-[#48d1cc] bg-[rgba(72,209,204,0.12)]' : 'border-[rgba(75,130,180,0.25)] hover:border-[#48d1cc]/50'}`}>
                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: SECTOR_COLORS[sector.sectorId] || '#48d1cc' }} />
                        <span className="text-white font-medium text-sm">{sector.name}</span>
                      </button>
                    )
                  })}
                </div>
                {selectedSector && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-[#48d1cc]/20">
                    <img src={SECTOR_IMAGES[selectedSector.sectorId]} alt={selectedSector.name} className="w-full h-36 object-cover" loading="lazy" />
                  </div>
                )}
              </div>

              {/* Mission */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Mission</h2>
                {currentSession ? (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-base">{currentSession.title}</h3>
                    <p className="text-sm text-[#a8bfd4] leading-relaxed">{currentSession.worldUpdate}</p>
                    <div className="border-l-2 border-[#ffd166] pl-3 py-1"><p className="text-sm"><span className="text-[#ffd166] font-bold">Problem:</span> <span className="text-[#eef6ff]">{currentSession.mainProblem}</span></p></div>
                    <div className="border-l-2 border-[#48d1cc] pl-3 py-1"><p className="text-sm"><span className="text-[#48d1cc] font-bold">Your Task:</span> <span className="text-[#eef6ff]">{currentSession.teamTask}</span></p></div>
                  </div>
                ) : <p className="text-[#a8bfd4]">Loading mission...</p>}
              </div>

              {/* English Help */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">English Help</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates.map((t: any) => (
                    <div key={t.templateId} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-3">
                      <span className="text-xs text-[#ffd166] font-bold uppercase tracking-wide">{t.category}</span>
                      <p className="text-sm text-white mt-1">{t.sentenceStarter}</p>
                      <p className="text-xs text-[#a8bfd4] mt-1 italic">&quot;{t.example}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Details */}
              <div className="glass-panel p-4 md:col-span-3">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">{selectedSector?.name} Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Responsibility</span><p className="text-sm text-white mt-1">{selectedSector?.responsibility}</p></div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Locations</span><p className="text-sm text-white mt-1">{selectedSector?.locations}</p></div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Citizens</span><p className="text-sm text-white mt-1">{selectedSector?.citizens}</p></div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 sm:col-span-2"><span className="text-xs text-[#a8bfd4] uppercase">Current Problem</span><p className="text-sm text-[#ffd166] mt-1 font-medium">{selectedSector?.currentProblem}</p></div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Mystery</span><p className="text-sm text-[#a78bfa] mt-1 font-medium">{selectedSector?.mystery}</p></div>
                </div>
              </div>

              {/* World Event Log */}
              <div className="glass-panel p-4 md:col-span-2">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">World Event Log ({logs.length})</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.length > 0 ? logs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="border-l-2 border-[#48d1cc] pl-3 py-2 bg-[rgba(255,255,255,0.03)] rounded-r-lg">
                      <div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-[#48d1cc] font-bold">{log.type}</span><span className="text-xs text-[#a8bfd4]">[{log.sectorId}]</span><span className="text-xs text-[#a8bfd4]/50 ml-auto">{log.addedBy}</span></div>
                      <p className="text-sm text-white mt-1">{log.entry}</p>
                    </div>
                  )) : <p className="text-[#a8bfd4] text-sm">No events yet.</p>}
                </div>
              </div>

              {/* Team Info */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">Your Team</h2>
                {selectedTeam && (
                  <div className="space-y-3">
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Team</span><p className="text-white font-bold">{selectedTeam.name}</p></div>
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Sector</span><p className="text-sm text-white">{sectors.find((s: any) => s.sectorId === selectedTeam.sectorId)?.name}</p></div>
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3"><span className="text-xs text-[#a8bfd4] uppercase">Current Task</span><p className="text-sm text-[#ffd166]">{selectedTeam.currentTask}</p></div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TALK TO CITIZENS TAB */}
          <TabsContent value="citizens" className="animate-fade-in">
            {/* Citizens Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-4 border border-[#48d1cc]/20">
              <img src="/citizens-hero.jpg" alt="The Citizens of New Horizon Island" className="w-full h-44 md:h-56 object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/50 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">Meet the Citizens</h2>
                <p className="text-sm text-[#a8bfd4] drop-shadow">Choose a citizen and start your investigation</p>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="glass-panel p-4 md:p-6">
                {/* Citizen Selector */}
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Talk to a Citizen</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {sectorCitizens.map((citizen: any) => (
                      <button
                        key={citizen.name}
                        onClick={() => { setSelectedCitizen(citizen.name); setChatMessages([]); setChatError('') }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          selectedCitizen === citizen.name
                            ? 'border-[#48d1cc] bg-[rgba(72,209,204,0.12)]'
                            : 'border-[rgba(75,130,180,0.25)] hover:border-[#48d1cc]/50 bg-[rgba(255,255,255,0.03)]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden mb-2 bg-[rgba(8,22,36,0.9)] border border-[#48d1cc]/20">
                          <img
                            src={CITIZEN_IMAGES[citizen.name] || ''}
                            alt={citizen.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                        <p className="text-sm text-white font-medium leading-tight">{citizen.name}</p>
                        <p className="text-xs text-[#a8bfd4] leading-tight mt-0.5">{citizen.role}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Citizen Portrait Card */}
                <div className="glass-panel p-4 mb-4 flex items-center gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-[#48d1cc]/30 flex-shrink-0 bg-[rgba(8,22,36,0.9)]">
                    <img
                      src={CITIZEN_IMAGES[selectedCitizen] || ''}
                      alt={selectedCitizen}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg">{selectedCitizen}</h3>
                    <p className="text-sm text-[#a8bfd4]">
                      {sectorCitizens.find((c: any) => c.name === selectedCitizen)?.role}
                    </p>
                    <p className="text-xs text-[#48d1cc] mt-1">{selectedSector?.name}</p>
                  </div>
                </div>

                {/* Chat Window */}
                <div className="bg-[rgba(8,22,36,0.9)] rounded-xl border border-[#48d1cc]/20 mb-4">
                  {/* Chat Header */}
                  <div className="px-4 py-2 border-b border-[#48d1cc]/10 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#48d1cc]" />
                    <span className="text-sm text-white font-medium">{selectedCitizen}</span>
                    <span className="text-xs text-[#a8bfd4] ml-auto">{selectedSector?.name}</span>
                  </div>

                  {/* Error banner */}
                  {chatError && (
                    <div className="px-4 py-2 bg-[rgba(255,107,107,0.1)] border-b border-[#ff6b6b]/20 flex items-center gap-2">
                      <WifiOff className="w-4 h-4 text-[#ff6b6b]" />
                      <span className="text-xs text-[#ff6b6b]">{chatError}</span>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto min-h-[200px]">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 text-[#a8bfd4]">
                        <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Start a conversation with {selectedCitizen}!</p>
                        <p className="text-xs mt-1 opacity-60">Ask about the mystery in your sector.</p>
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && <Bot className="w-5 h-5 text-[#48d1cc] flex-shrink-0 mt-1" />}
                        <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-[#48d1cc] text-[#0a1628] rounded-br-sm'
                            : 'bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(75,130,180,0.2)] rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        {msg.role === 'user' && <User className="w-5 h-5 text-[#ffd166] flex-shrink-0 mt-1" />}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex gap-2 items-center">
                        <Bot className="w-5 h-5 text-[#48d1cc]" />
                        <div className="bg-[rgba(255,255,255,0.08)] px-3 py-2 rounded-xl border border-[rgba(75,130,180,0.2)]">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-[#48d1cc] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[#48d1cc] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[#48d1cc] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-[#48d1cc]/10 flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder={`Ask ${selectedCitizen} a question...`}
                        className="w-full bg-[rgba(16,40,72,0.9)] border border-[#48d1cc]/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-[#a8bfd4]/50 pr-10"
                      />
                      <button
                        onClick={startVoice}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'text-[#a8bfd4] hover:text-[#48d1cc]'}`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                    <Button onClick={handleSendChat} disabled={isChatLoading || !chatInput.trim()} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick starters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    `Hello ${selectedCitizen}, what do you know about the mystery?`,
                    `Why is there a problem in the ${selectedSector?.name || 'sector'}?`,
                    `Have you seen anything strange lately?`,
                    `What should our team investigate first?`,
                  ].map((starter, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(starter)}
                      className="text-left p-2 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(72,209,204,0.12)] border border-transparent hover:border-[#48d1cc]/30 transition-all text-xs text-[#a8bfd4] hover:text-white"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NEWSROOM TAB */}
          <TabsContent value="newsroom" className="animate-fade-in">
            {/* Newsroom Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-4 border border-[#48d1cc]/20">
              <img src="/newsroom-hero.jpg" alt="World Council Newsroom" className="w-full h-40 md:h-52 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">World Council Newsroom</h2>
                <p className="text-sm text-[#a8bfd4] drop-shadow">Submit your team's findings and read reports from other sectors</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Submit a Report</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1.5">Report Title</label>
                    <Input value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="Example: Mystery Boxes at the Harbour" className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1.5">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#102848]">
                        {['Discovery Report', 'News Report', 'World Council Decision', 'Homework Update'].map(t => (
                          <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1.5">Report Content</label>
                    <Textarea value={reportContent} onChange={e => setReportContent(e.target.value)} placeholder="We discovered... We think... We recommend..." className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[150px]" />
                  </div>
                  <Button onClick={handleSubmitReport} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold w-full md:w-auto">
                    <Send className="w-4 h-4 mr-2" /> Submit Report
                  </Button>
                  {reportStatus && <p className="text-sm text-[#48d1cc] font-medium">{reportStatus}</p>}
                </div>
              </div>

              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Team Reports ({allReports.length})</h2>
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                  {allReports.length > 0 ? allReports.map((report: any) => (
                    <div key={report.id} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-3 border-l-2 border-[#48d1cc]">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs text-[#ffd166] font-bold">{report.reportType}</span>
                        <span className="text-xs text-[#a8bfd4] text-right">{teams.find((t: any) => t.teamId === report.teamId)?.name}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mt-1">{report.title}</h4>
                      <p className="text-sm text-[#a8bfd4] mt-1">{report.content}</p>
                      {report.teacherComment && <div className="mt-2 p-2 bg-[rgba(74,222,128,0.1)] rounded border border-[#4ade80]/30"><span className="text-xs text-[#4ade80]">Teacher: {report.teacherComment}</span></div>}
                    </div>
                  )) : (
                    <div className="text-center py-12 text-[#a8bfd4]">
                      <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No reports submitted yet.</p>
                      <p className="text-xs mt-1 opacity-60">Be the first to submit a report!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
