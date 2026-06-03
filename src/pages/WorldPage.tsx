import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Ship, Leaf, Cpu, BookOpen, Send, Scroll, Lightbulb,
  Newspaper, Activity
} from 'lucide-react'
import {
  staticWorld, staticSectors, staticTeams, staticSessions,
  staticLogs, staticTemplates,
} from '@/data/staticWorld'

const SECTOR_IMAGES: Record<string, string> = {
  harbour: '/sector-harbour.jpg',
  garden: '/sector-garden.jpg',
  tech: '/sector-tech.jpg',
  culture: '/sector-culture.jpg',
}

const SECTOR_ICONS: Record<string, React.ElementType> = {
  harbour: Ship, garden: Leaf, tech: Cpu, culture: BookOpen,
}

const SECTOR_COLORS: Record<string, string> = {
  harbour: '#4a9eff', garden: '#4ade80', tech: '#a78bfa', culture: '#fbbf24',
}

// Helper: format date nicely
function fmtDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function WorldPage() {
  const { code } = useParams<{ code: string }>()
  const safeCode = code || 'NHI2026'

  // tRPC queries (with static fallback on error/loading)
  const worldQuery = trpc.world.getByCode.useQuery({ code: safeCode })
  const worldId = worldQuery.data?.id || staticWorld.id

  const sectorsQuery = trpc.sector.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )
  const teamsQuery = trpc.team.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )
  const sessionsQuery = trpc.session.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )
  const logsQuery = trpc.log.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )
  const templatesQuery = trpc.template.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )
  const reportsQuery = trpc.report.listByWorld.useQuery(
    { worldId }, { enabled: !!worldQuery.data }
  )

  // tRPC mutations (backend sync — localStorage is primary)
  const submitReportMutation = trpc.report.submit.useMutation({
    onSuccess: () => { reportsQuery.refetch() }
  })

  // Use API data when available, fall back to static
  const world = worldQuery.data || staticWorld
  const sectors = sectorsQuery.data || staticSectors
  const teams = teamsQuery.data || staticTeams
  const sessions = sessionsQuery.data || staticSessions
  const logs = logsQuery.data || staticLogs
  const templates = templatesQuery.data || staticTemplates

  // Reports: merge API data with localStorage for immediate persistence
  const apiReports = reportsQuery.data || []
  const [localReports, setLocalReports] = useState<any[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nhw-reports')
      if (raw) setLocalReports(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])
  const allReports = [...localReports, ...apiReports].sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const currentSession = sessions.find(s => s.sessionId === (world?.currentSession || 1))

  // Local state
  const [selectedSectorId, setSelectedSectorId] = useState<string>('harbour')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('T1')
  const [reportTitle, setReportTitle] = useState('')
  const [reportType, setReportType] = useState('Discovery Report')
  const [reportContent, setReportContent] = useState('')
  const [reportStatus, setReportStatus] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  const selectedSector = sectors.find(s => s.sectorId === selectedSectorId)
  const selectedTeam = teams.find(t => t.teamId === selectedTeamId)

  // Sync sector when team changes
  useEffect(() => {
    const team = teams.find(t => t.teamId === selectedTeamId)
    if (team) setSelectedSectorId(team.sectorId)
  }, [selectedTeamId, teams])

  const handleSubmitReport = () => {
    if (!reportTitle || !reportContent) return

    const newReport = {
      id: Date.now(),
      worldId: world.id,
      sessionId: world.currentSession,
      teamId: selectedTeamId,
      sectorId: selectedSectorId,
      reportType,
      title: reportTitle,
      content: reportContent,
      status: 'Submitted',
      teacherComment: null,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage first (always works, even without backend)
    const existing = JSON.parse(localStorage.getItem('nhw-reports') || '[]')
    const updated = [newReport, ...existing]
    localStorage.setItem('nhw-reports', JSON.stringify(updated))
    setLocalReports(updated)

    // Also try to sync to backend (if available)
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
      // Backend not available — localStorage is enough
    }

    setReportStatus('Report submitted and saved!')
    setReportTitle('')
    setReportContent('')
    setTimeout(() => setReportStatus(''), 3000)
  }

  const isLoading = worldQuery.isLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-gradient">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#48d1cc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a8bfd4]">Loading New Horizon Island...</p>
        </div>
      </div>
    )
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-gradient">
        <div className="glass-panel p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">World Not Found</h2>
          <p className="text-[#a8bfd4]">The world code &quot;{safeCode}&quot; does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-[#48d1cc]/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-white">{world.name}</h1>
            <span className="text-xs text-[#48d1cc] bg-[#48d1cc]/10 px-2 py-1 rounded-full border border-[#48d1cc]/30">
              Session {world.currentSession}
            </span>
          </div>
          <p className="hidden md:block text-sm text-[#a8bfd4] italic">{world.tagline}</p>
          <div className="flex items-center gap-2">
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-44 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#102848]">
                {teams.map(t => (
                  <SelectItem key={t.teamId} value={t.teamId} className="text-white">{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[rgba(16,40,72,0.9)] border border-[#48d1cc]/20 mb-4 h-auto">
            <TabsTrigger value="dashboard" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <Activity className="w-4 h-4 mr-1" /> Dashboard
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
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                  <Scroll className="w-5 h-5" /> Island Sectors
                </h2>
                <div className="space-y-2">
                  {sectors.map(sector => {
                    const Icon = SECTOR_ICONS[sector.sectorId] || Ship
                    const color = SECTOR_COLORS[sector.sectorId] || '#48d1cc'
                    return (
                      <button
                        key={sector.sectorId}
                        onClick={() => setSelectedSectorId(sector.sectorId)}
                        className={`sector-card w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                          selectedSectorId === sector.sectorId
                            ? 'border-[#48d1cc] bg-[rgba(72,209,204,0.12)]'
                            : 'border-[rgba(75,130,180,0.25)] hover:border-[#48d1cc]/50'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
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
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> Mission
                </h2>
                {currentSession ? (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold text-base">{currentSession.title}</h3>
                    <p className="text-sm text-[#a8bfd4] leading-relaxed">{currentSession.worldUpdate}</p>
                    <div className="border-l-2 border-[#ffd166] pl-3 py-1">
                      <p className="text-sm"><span className="text-[#ffd166] font-bold">Problem:</span> <span className="text-[#eef6ff]">{currentSession.mainProblem}</span></p>
                    </div>
                    <div className="border-l-2 border-[#48d1cc] pl-3 py-1">
                      <p className="text-sm"><span className="text-[#48d1cc] font-bold">Your Task:</span> <span className="text-[#eef6ff]">{currentSession.teamTask}</span></p>
                    </div>
                  </div>
                ) : <p className="text-[#a8bfd4]">Loading mission...</p>}
              </div>

              {/* English Help */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">English Help</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates.map(t => (
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
                  {[
                    { label: 'Responsibility', value: selectedSector?.responsibility },
                    { label: 'Locations', value: selectedSector?.locations },
                    { label: 'Citizens', value: selectedSector?.citizens },
                  ].map(item => (
                    <div key={item.label} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                      <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">{item.label}</span>
                      <p className="text-sm text-white mt-1">{item.value}</p>
                    </div>
                  ))}
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 sm:col-span-2">
                    <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Current Problem</span>
                    <p className="text-sm text-[#ffd166] mt-1 font-medium">{selectedSector?.currentProblem}</p>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                    <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Mystery</span>
                    <p className="text-sm text-[#a78bfa] mt-1 font-medium">{selectedSector?.mystery}</p>
                  </div>
                </div>
              </div>

              {/* World Event Log */}
              <div className="glass-panel p-4 md:col-span-2">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">World Event Log ({logs.length})</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.length > 0 ? logs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="border-l-2 border-[#48d1cc] pl-3 py-2 bg-[rgba(255,255,255,0.03)] rounded-r-lg">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[#48d1cc] font-bold">{log.type}</span>
                        <span className="text-xs text-[#a8bfd4]">[{log.sectorId}]</span>
                        <span className="text-xs text-[#a8bfd4]/50 ml-auto">{log.addedBy}</span>
                      </div>
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
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                      <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Team</span>
                      <p className="text-white font-bold">{selectedTeam.name}</p>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                      <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Sector</span>
                      <p className="text-sm text-white">{sectors.find(s => s.sectorId === selectedTeam.sectorId)?.name}</p>
                    </div>
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                      <span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Current Task</span>
                      <p className="text-sm text-[#ffd166]">{selectedTeam.currentTask}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* NEWSROOM TAB */}
          <TabsContent value="newsroom" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Report Editor */}
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

              {/* Submitted Reports */}
              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Team Reports ({allReports.length})</h2>
                <div className="space-y-3 max-h-[550px] overflow-y-auto">
                  {allReports.length > 0 ? allReports.map((report: any) => (
                    <div key={report.id} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-3 border-l-2 border-[#48d1cc]">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs text-[#ffd166] font-bold">{report.reportType}</span>
                        <span className="text-xs text-[#a8bfd4] text-right">{teams.find(t => t.teamId === report.teamId)?.name}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mt-1">{report.title}</h4>
                      <p className="text-sm text-[#a8bfd4] mt-1">{report.content}</p>
                      {report.teacherComment && (
                        <div className="mt-2 p-2 bg-[rgba(74,222,128,0.1)] rounded border border-[#4ade80]/30">
                          <span className="text-xs text-[#4ade80]">Teacher: {report.teacherComment}</span>
                        </div>
                      )}
                      <span className="text-xs text-[#a8bfd4]/40 mt-1 block">{fmtDate(report.createdAt)}</span>
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
