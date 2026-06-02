import { useState } from 'react'
import { useParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Ship, Leaf, Cpu, BookOpen, Mic, Copy, Check, Send, Scroll, MessageSquare, Lightbulb, Newspaper, Activity } from 'lucide-react'

const SECTOR_IMAGES: Record<string, string> = {
  harbour: '/sector-harbour.jpg',
  garden: '/sector-garden.jpg',
  tech: '/sector-tech.jpg',
  culture: '/sector-culture.jpg',
}

const SECTOR_ICONS: Record<string, React.ElementType> = {
  harbour: Ship,
  garden: Leaf,
  tech: Cpu,
  culture: BookOpen,
}

const SECTOR_COLORS: Record<string, string> = {
  harbour: '#4a9eff',
  garden: '#4ade80',
  tech: '#a78bfa',
  culture: '#fbbf24',
}

export default function WorldPage() {
  const { code } = useParams<{ code: string }>()
  const [selectedSectorId, setSelectedSectorId] = useState<string>('harbour')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('T1')
  const [actionType, setActionType] = useState('Interview an AI citizen')
  const [studentCommand, setStudentCommand] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [reportTitle, setReportTitle] = useState('')
  const [reportType, setReportType] = useState('Discovery Report')
  const [reportContent, setReportContent] = useState('')
  const [reportStatus, setReportStatus] = useState('')
  const [isListening, setIsListening] = useState(false)

  // tRPC queries
  const { data: world } = trpc.world.getByCode.useQuery({ code: code || '' })
  const { data: sectors } = trpc.sector.listByWorld.useQuery(
    { worldId: world?.id || 0 },
    { enabled: !!world }
  )
  const { data: teams } = trpc.team.listByWorld.useQuery(
    { worldId: world?.id || 0 },
    { enabled: !!world }
  )
  const { data: currentSession } = trpc.session.getCurrent.useQuery(
    { worldId: world?.id || 0, sessionId: world?.currentSession || 1 },
    { enabled: !!world }
  )
  const { data: logs } = trpc.log.listByWorld.useQuery(
    { worldId: world?.id || 0 },
    { enabled: !!world }
  )
  const { data: templates } = trpc.template.listByWorld.useQuery(
    { worldId: world?.id || 0 },
    { enabled: !!world }
  )
  const { data: allReports, refetch: refetchReports } = trpc.report.listByWorld.useQuery(
    { worldId: world?.id || 0 },
    { enabled: !!world }
  )

  const submitReport = trpc.report.submit.useMutation({
    onSuccess: () => {
      setReportStatus('Report submitted!')
      setReportTitle('')
      setReportContent('')
      refetchReports()
      setTimeout(() => setReportStatus(''), 3000)
    }
  })

  const selectedSector = sectors?.find(s => s.sectorId === selectedSectorId)
  const selectedTeam = teams?.find(t => t.teamId === selectedTeamId)

  const buildPrompt = () => {
    if (!selectedSector || !selectedTeam) return
    const prompt = `You are an AI citizen or narrator in New Horizon Island.

Student team: ${selectedTeam.name} (${selectedTeam.teamId})
Sector: ${selectedSector.name}
Sector responsibility: ${selectedSector.responsibility}
Current problem: ${selectedSector.currentProblem}
Mystery: ${selectedSector.mystery}

Action: ${actionType}
Student command/question:
${studentCommand || 'Ask about the current problem'}

Reply in clear English suitable for Hong Kong P6 students.
Give useful clues, but do not solve the whole mystery immediately.
Ask one follow-up question at the end.`
    setGeneratedPrompt(prompt)
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReport = () => {
    if (!world || !reportTitle || !reportContent) return
    submitReport.mutate({
      worldId: world.id,
      sessionId: world.currentSession,
      teamId: selectedTeamId,
      sectorId: selectedSectorId,
      reportType,
      title: reportTitle,
      content: reportContent,
    })
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.')
      return
    }
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setStudentCommand(prev => prev ? prev + ' ' + transcript : transcript)
    }
    recognition.start()
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#48d1cc] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a8bfd4]">Loading world...</p>
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
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {world.name}
            </h1>
            <span className="text-xs text-[#48d1cc] bg-[#48d1cc]/10 px-2 py-1 rounded-full border border-[#48d1cc]/30">
              Session {world.currentSession}
            </span>
          </div>
          <p className="hidden md:block text-sm text-[#a8bfd4] italic">{world.tagline}</p>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-40 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#102848] border-[#48d1cc]/30">
              {teams?.map(t => (
                <SelectItem key={t.teamId} value={t.teamId} className="text-white hover:bg-[#48d1cc]/20">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-[rgba(16,40,72,0.9)] border border-[#48d1cc]/20 mb-4">
            <TabsTrigger value="dashboard" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <Activity className="w-4 h-4 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="ai-command" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <MessageSquare className="w-4 h-4 mr-1" /> AI Command
            </TabsTrigger>
            <TabsTrigger value="newsroom" className="text-[#a8bfd4] data-[state=active]:bg-[#48d1cc] data-[state=active]:text-[#0a1628]">
              <Newspaper className="w-4 h-4 mr-1" /> Newsroom
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Island Map */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                  <Scroll className="w-5 h-5" /> Island Sectors
                </h2>
                <div className="space-y-2">
                  {sectors?.map(sector => {
                    const Icon = SECTOR_ICONS[sector.sectorId] || Ship
                    const color = SECTOR_COLORS[sector.sectorId] || '#48d1cc'
                    return (
                      <button
                        key={sector.sectorId}
                        onClick={() => setSelectedSectorId(sector.sectorId)}
                        className={`sector-card w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                          selectedSectorId === sector.sectorId
                            ? 'active bg-[rgba(72,209,204,0.1)]'
                            : 'border-[rgba(75,130,180,0.2)] hover:border-[#48d1cc]/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                        <span className="text-white font-medium">{sector.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Sector Image */}
                {selectedSector && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-[#48d1cc]/20">
                    <img
                      src={SECTOR_IMAGES[selectedSector.sectorId]}
                      alt={selectedSector.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Mission Panel */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> Mission
                </h2>
                {currentSession ? (
                  <div className="space-y-3">
                    <h3 className="text-white font-bold">{currentSession.title}</h3>
                    <p className="text-sm text-[#a8bfd4]">{currentSession.worldUpdate}</p>
                    <div className="border-l-2 border-[#ffd166] pl-3">
                      <p className="text-sm"><span className="text-[#ffd166] font-bold">Problem:</span> <span className="text-[#eef6ff]">{currentSession.mainProblem}</span></p>
                    </div>
                    <div className="border-l-2 border-[#48d1cc] pl-3">
                      <p className="text-sm"><span className="text-[#48d1cc] font-bold">Your Task:</span> <span className="text-[#eef6ff]">{currentSession.teamTask}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#a8bfd4]">Loading mission...</p>
                )}
              </div>

              {/* English Help */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">English Help</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates?.map(t => (
                    <div key={t.templateId} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-3">
                      <span className="text-xs text-[#ffd166] font-bold uppercase">{t.category}</span>
                      <p className="text-sm text-white mt-1">{t.sentenceStarter}</p>
                      <p className="text-xs text-[#a8bfd4] mt-1 italic">{t.example}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector Details - Full width */}
              <div className="glass-panel p-4 md:col-span-3">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">
                  {selectedSector?.name} Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-[#a8bfd4] uppercase">Responsibility</span>
                    <p className="text-sm text-white mt-1">{selectedSector?.responsibility}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#a8bfd4] uppercase">Locations</span>
                    <p className="text-sm text-white mt-1">{selectedSector?.locations}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#a8bfd4] uppercase">Citizens</span>
                    <p className="text-sm text-white mt-1">{selectedSector?.citizens}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-[#a8bfd4] uppercase">Current Problem</span>
                    <p className="text-sm text-[#ffd166] mt-1">{selectedSector?.currentProblem}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#a8bfd4] uppercase">Mystery</span>
                    <p className="text-sm text-[#a78bfa] mt-1">{selectedSector?.mystery}</p>
                  </div>
                </div>
              </div>

              {/* World Event Log */}
              <div className="glass-panel p-4 md:col-span-2">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">World Event Log</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs && logs.length > 0 ? logs.slice(0, 8).map((log, i) => (
                    <div
                      key={log.id}
                      className="border-l-3 border-[#48d1cc] pl-3 py-2 bg-[rgba(255,255,255,0.03)] rounded-r-lg"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="text-xs text-[#48d1cc] font-bold">{log.type}</span>
                      <span className="text-xs text-[#a8bfd4] ml-2">[{log.sectorId}]</span>
                      <p className="text-sm text-white mt-1">{log.entry}</p>
                      <span className="text-xs text-[#a8bfd4]/60">{log.addedBy}</span>
                    </div>
                  )) : (
                    <p className="text-[#a8bfd4] text-sm">No events yet.</p>
                  )}
                </div>
              </div>

              {/* Team Info */}
              <div className="glass-panel p-4 md:col-span-1">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">Your Team</h2>
                {selectedTeam && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#a8bfd4] uppercase">Team</span>
                      <p className="text-white font-bold">{selectedTeam.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#a8bfd4] uppercase">Sector</span>
                      <p className="text-sm text-white">{sectors?.find(s => s.sectorId === selectedTeam.sectorId)?.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#a8bfd4] uppercase">Current Task</span>
                      <p className="text-sm text-[#ffd166]">{selectedTeam.currentTask}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI COMMAND TAB */}
          <TabsContent value="ai-command" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Command Builder */}
              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Command the World</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1">Action</label>
                    <Select value={actionType} onValueChange={setActionType}>
                      <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#102848]">
                        {['Interview an AI citizen', 'Investigate a location', 'Ask for a clue', 'Test an idea', 'Prepare a World Council report'].map(a => (
                          <SelectItem key={a} value={a} className="text-white">{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1">Your Question / Command</label>
                    <div className="relative">
                      <Textarea
                        value={studentCommand}
                        onChange={(e) => setStudentCommand(e.target.value)}
                        placeholder="Example: Ask the Harbour Manager why the boxes arrived at night."
                        className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[100px] pr-10"
                      />
                      <button
                        onClick={startVoice}
                        className={`absolute bottom-3 right-3 p-1.5 rounded-full transition-all ${
                          isListening ? 'bg-red-500 animate-pulse' : 'bg-[#48d1cc]/20 hover:bg-[#48d1cc]/40'
                        }`}
                        title="Voice input"
                      >
                        <Mic className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {isListening && <p className="text-xs text-red-400 mt-1">Listening...</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={buildPrompt} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold">
                      Build AI Prompt
                    </Button>
                    <Button
                      onClick={copyPrompt}
                      disabled={!generatedPrompt}
                      variant="outline"
                      className="border-[#48d1cc]/50 text-[#48d1cc]"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Generated Prompt */}
              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">AI Prompt</h2>
                {generatedPrompt ? (
                  <div className="bg-[rgba(8,22,36,0.9)] rounded-lg p-4 border border-[#48d1cc]/20">
                    <pre className="text-sm text-[#d7e8f8] whitespace-pre-wrap font-mono leading-relaxed">{generatedPrompt}</pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-[#a8bfd4]">
                    <p>Build a prompt to see it here</p>
                  </div>
                )}
                {copied && <p className="text-sm text-[#48d1cc] mt-2">Copied to clipboard!</p>}
              </div>

              {/* English Help Quick Ref */}
              <div className="glass-panel p-4 md:col-span-2">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-3">Quick Sentence Starters</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {templates?.map(t => (
                    <button
                      key={t.templateId}
                      onClick={() => setStudentCommand(t.sentenceStarter + ' ')}
                      className="text-left p-2 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(72,209,204,0.1)] border border-transparent hover:border-[#48d1cc]/30 transition-all"
                    >
                      <span className="text-xs text-[#ffd166] uppercase">{t.category}</span>
                      <p className="text-sm text-white">{t.sentenceStarter}</p>
                    </button>
                  ))}
                </div>
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
                    <label className="text-sm text-[#a8bfd4] block mb-1">Report Title</label>
                    <Input
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Example: Mystery Boxes at the Harbour"
                      className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#102848]">
                        {['Discovery Report', 'News Report', 'World Council Decision', 'Homework Update'].map(t => (
                          <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-[#a8bfd4] block mb-1">Report Content</label>
                    <Textarea
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      placeholder="We discovered... We think... We recommend..."
                      className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[150px]"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReport}
                    className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold"
                  >
                    <Send className="w-4 h-4 mr-2" /> Submit Report
                  </Button>
                  {reportStatus && <p className="text-sm text-[#48d1cc]">{reportStatus}</p>}
                </div>
              </div>

              {/* Submitted Reports */}
              <div className="glass-panel p-4">
                <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Team Reports</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {allReports && allReports.length > 0 ? allReports.map(report => (
                    <div key={report.id} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-3 border-l-2 border-[#48d1cc]">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-[#ffd166] font-bold">{report.reportType}</span>
                        <span className="text-xs text-[#a8bfd4]">{teams?.find(t => t.teamId === report.teamId)?.name}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mt-1">{report.title}</h4>
                      <p className="text-sm text-[#a8bfd4] mt-1 line-clamp-3">{report.content}</p>
                      {report.teacherComment && (
                        <p className="text-xs text-[#4ade80] mt-2 italic">Teacher: {report.teacherComment}</p>
                      )}
                    </div>
                  )) : (
                    <p className="text-[#a8bfd4] text-sm">No reports submitted yet.</p>
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
