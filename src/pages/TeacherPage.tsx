import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Lock, Unlock, ArrowLeft, Plus, FileText, Scroll } from 'lucide-react'

export default function TeacherPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [passcode, setPasscode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [logType, setLogType] = useState('World Update')
  const [logEntry, setLogEntry] = useState('')
  const [logSector, setLogSector] = useState('all')
  const [activeTab, setActiveTab] = useState('logs')

  const { data: world } = trpc.world.getByCode.useQuery({ code: code || '' })
  const { data: sectors } = trpc.sector.listByWorld.useQuery(
    { worldId: world?.id || 0 }, { enabled: !!world && unlocked }
  )
  const { data: logs, refetch: refetchLogs } = trpc.log.listByWorld.useQuery(
    { worldId: world?.id || 0 }, { enabled: !!world && unlocked }
  )
  const { data: reports } = trpc.report.listByWorld.useQuery(
    { worldId: world?.id || 0 }, { enabled: !!world && unlocked }
  )
  const { data: teams } = trpc.team.listByWorld.useQuery(
    { worldId: world?.id || 0 }, { enabled: !!world && unlocked }
  )

  const verifyTeacher = trpc.world.verifyTeacher.useMutation({
    onSuccess: (data) => {
      if (data.ok) {
        setUnlocked(true)
      } else {
        alert('Wrong passcode!')
      }
    }
  })

  const addLog = trpc.log.add.useMutation({
    onSuccess: () => {
      setLogEntry('')
      refetchLogs()
    }
  })

  const updateSession = trpc.world.updateSession.useMutation({
    onSuccess: () => {
      window.location.reload()
    }
  })

  const handleUnlock = () => {
    if (code && passcode) {
      verifyTeacher.mutate({ code, passcode })
    }
  }

  const handleAddLog = () => {
    if (!world || !logEntry) return
    addLog.mutate({
      worldId: world.id,
      sessionId: world.currentSession,
      sectorId: logSector,
      type: logType,
      entry: logEntry,
      addedBy: 'Teacher',
      visibility: 'Public',
    })
  }

  const handleChangeSession = (sessionId: number) => {
    if (!code) return
    updateSession.mutate({ code, sessionId })
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#a8bfd4]">Loading...</p>
      </div>
    )
  }

  // Lock screen
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-gradient">
        <div className="glass-panel p-8 max-w-md w-full mx-4 text-center">
          <Lock className="w-12 h-12 text-[#48d1cc] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Teacher Panel</h2>
          <p className="text-[#a8bfd4] mb-6">{world.name}</p>
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter teacher passcode"
            className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white text-center mb-4"
          />
          <Button
            onClick={handleUnlock}
            className="w-full bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold"
          >
            Unlock
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mt-4 text-[#a8bfd4]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Header */}
      <header className="glass-panel-strong border-b border-[#48d1cc]/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Unlock className="w-5 h-5 text-[#48d1cc]" />
            <h1 className="text-xl font-bold text-white">Teacher Panel</h1>
            <span className="text-xs text-[#ffd166] bg-[#ffd166]/10 px-2 py-1 rounded-full">
              {world.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#a8bfd4]">Session:</span>
            <Select
              value={String(world.currentSession)}
              onValueChange={(v) => handleChangeSession(Number(v))}
            >
              <SelectTrigger className="w-24 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#102848]">
                {[1,2,3,4,5,6,7,8].map(s => (
                  <SelectItem key={s} value={String(s)} className="text-white">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => navigate('/')} className="text-[#a8bfd4]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {[
            { id: 'logs', label: 'World Logs', icon: Scroll },
            { id: 'reports', label: 'Student Reports', icon: FileText },
            { id: 'add-log', label: 'Add Log Entry', icon: Plus },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id
                ? 'bg-[#48d1cc] text-[#0a1628]'
                : 'border-[#48d1cc]/30 text-[#a8bfd4]'
              }
            >
              <tab.icon className="w-4 h-4 mr-1" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="glass-panel p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#48d1cc] mb-4">World Event Log</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs?.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-[rgba(255,255,255,0.04)] rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    log.type === 'World Update' ? 'bg-[#48d1cc]' :
                    log.type === 'Discovery' ? 'bg-[#4ade80]' :
                    log.type === 'Decision' ? 'bg-[#ffd166]' :
                    log.type === 'Consequence' ? 'bg-[#a78bfa]' : 'bg-[#a8bfd4]'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#48d1cc]">{log.type}</span>
                      <span className="text-xs text-[#a8bfd4]">[{log.sectorId}]</span>
                      <span className="text-xs text-[#a8bfd4]/60 ml-auto">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-white mt-1">{log.entry}</p>
                    <span className="text-xs text-[#a8bfd4]/60">by {log.addedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="glass-panel p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Student Reports</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {reports?.map(report => (
                <div key={report.id} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-[#ffd166] font-bold">{report.reportType}</span>
                      <h3 className="text-white font-bold">{report.title}</h3>
                    </div>
                    <span className="text-xs text-[#a8bfd4]">
                      {teams?.find(t => t.teamId === report.teamId)?.name}
                    </span>
                  </div>
                  <p className="text-sm text-[#a8bfd4] mt-2">{report.content}</p>
                  {report.teacherComment && (
                    <div className="mt-2 p-2 bg-[rgba(74,222,128,0.1)] rounded border border-[#4ade80]/30">
                      <span className="text-xs text-[#4ade80]">Comment: {report.teacherComment}</span>
                    </div>
                  )}
                  <span className="text-xs text-[#a8bfd4]/60 mt-2 block">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Log Tab */}
        {activeTab === 'add-log' && (
          <div className="glass-panel p-4 animate-fade-in max-w-2xl">
            <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Add World Log Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1">Log Type</label>
                <Select value={logType} onValueChange={setLogType}>
                  <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#102848]">
                    {['World Update', 'Discovery', 'Decision', 'Consequence', 'Teacher Note'].map(t => (
                      <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1">Sector</label>
                <Select value={logSector} onValueChange={setLogSector}>
                  <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#102848]">
                    <SelectItem value="all" className="text-white">All Sectors</SelectItem>
                    {sectors?.map(s => (
                      <SelectItem key={s.sectorId} value={s.sectorId} className="text-white">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1">Entry</label>
                <Textarea
                  value={logEntry}
                  onChange={(e) => setLogEntry(e.target.value)}
                  placeholder="Example: The Signal Tower flashed three times after the Tech Team asked their question."
                  className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleAddLog}
                className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add to World Log
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
