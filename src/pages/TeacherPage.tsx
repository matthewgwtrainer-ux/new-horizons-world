import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Lock, Unlock, ArrowLeft, Plus, FileText, Scroll,
  Download, Upload, RotateCcw, Home, GraduationCap
} from 'lucide-react'
import {
  staticWorld, staticSectors, staticTeams, staticSessions,
  staticLogs, staticReports,
} from '@/data/staticWorld'
import { exportData, importData } from '@/lib/persistence'

export default function TeacherPage() {
  const navigate = useNavigate()
  const [passcode, setPasscode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [logType, setLogType] = useState('World Update')
  const [logEntry, setLogEntry] = useState('')
  const [logSector, setLogSector] = useState('all')
  const [activeTab, setActiveTab] = useState('logs')
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [resetStatus, setResetStatus] = useState('')

  // tRPC queries
  const worldQuery = trpc.world.getByCode.useQuery({ code: 'NHI2026' })
  const worldId = worldQuery.data?.id || staticWorld.id

  const sectorsQuery = trpc.sector.listByWorld.useQuery({ worldId }, { enabled: !!worldQuery.data })
  const teamsQuery = trpc.team.listByWorld.useQuery({ worldId }, { enabled: !!worldQuery.data })
  const sessionsQuery = trpc.session.listByWorld.useQuery({ worldId }, { enabled: !!worldQuery.data })
  const logsQuery = trpc.log.listByWorld.useQuery({ worldId }, { enabled: !!worldQuery.data })
  const reportsQuery = trpc.report.listByWorld.useQuery({ worldId }, { enabled: !!worldQuery.data })

  // tRPC mutations
  const addLogMutation = trpc.log.add.useMutation({
    onSuccess: () => { logsQuery.refetch(); setLogEntry('') }
  })
  const updateSessionMutation = trpc.world.updateSession.useMutation({
    onSuccess: () => { worldQuery.refetch() }
  })
  const clearLogsMutation = trpc.log.clearByWorld.useMutation({
    onSuccess: () => { logsQuery.refetch() }
  })
  const clearReportsMutation = trpc.report.clearByWorld.useMutation({
    onSuccess: () => { reportsQuery.refetch() }
  })

  // Use API data when available, fall back to static
  const world = worldQuery.data || staticWorld
  const sectors = sectorsQuery.data || staticSectors
  const teams = teamsQuery.data || staticTeams
  const sessions = sessionsQuery.data || staticSessions
  const logs = logsQuery.data || staticLogs
  const reports = reportsQuery.data || staticReports

  const currentSession = sessions.find(s => s.sessionId === (world?.currentSession || 1))

  const handleUnlock = () => {
    if (passcode === world.teacherPasscode) {
      setUnlocked(true)
    } else {
      alert('Wrong passcode!')
    }
  }

  const handleAddLog = () => {
    if (!logEntry) return
    addLogMutation.mutate({
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
    updateSessionMutation.mutate({ code: world.code, sessionId })
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `new-horizons-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const ok = importData(importText)
    if (ok) {
      setImportStatus('Import successful!')
      setTimeout(() => { setImportStatus(''); setShowImport(false); setImportText('') }, 2000)
    } else {
      setImportStatus('Invalid data format. Please check your JSON.')
    }
  }

  // Lock screen
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center ocean-gradient px-4">
        <div className="glass-panel p-8 max-w-md w-full text-center animate-fade-in">
          <Lock className="w-12 h-12 text-[#48d1cc] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Teacher Panel</h2>
          <p className="text-[#a8bfd4] mb-6">{world.name}</p>
          <Input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleUnlock()} placeholder="Enter teacher passcode" className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white text-center mb-4" />
          <Button onClick={handleUnlock} className="w-full bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold">Unlock</Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4 text-[#a8bfd4]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Landing
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
            <span className="text-xs text-[#ffd166] bg-[#ffd166]/10 px-2 py-1 rounded-full">{world.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation links */}
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-[#a8bfd4] hover:text-white text-xs">
              <Home className="w-3.5 h-3.5 mr-1" /> Home
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/world/NHI2026')} className="text-[#48d1cc] hover:text-[#48d1cc] text-xs">
              <GraduationCap className="w-3.5 h-3.5 mr-1" /> Student View
            </Button>
            <span className="text-sm text-[#a8bfd4] hidden sm:inline ml-2">Session:</span>
            <Select value={String(world.currentSession)} onValueChange={v => handleChangeSession(Number(v))}>
              <SelectTrigger className="w-48 bg-[rgba(16,40,72,0.9)] border-[#48d1cc]/30 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#102848]">
                {sessions.map(s => (
                  <SelectItem key={s.sessionId} value={String(s.sessionId)} className="text-white">
                    {s.sessionId}: {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Session Banner */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="glass-panel p-3 mb-4 border-l-4 border-[#48d1cc]">
          <p className="text-sm text-[#a8bfd4]">Currently active:</p>
          <p className="text-white font-bold">{currentSession?.title}</p>
          <p className="text-xs text-[#a8bfd4] mt-1">{currentSession?.worldUpdate}</p>
        </div>
      </div>

      {/* Tabs */}
      <main className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'logs', label: `World Logs (${logs.length})`, icon: Scroll },
            { id: 'reports', label: `Student Reports (${reports.length})`, icon: FileText },
            { id: 'add-log', label: 'Add Log Entry', icon: Plus },
            { id: 'backup', label: 'Backup / Restore', icon: Download },
          ].map(tab => (
            <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'outline'} onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'bg-[#48d1cc] text-[#0a1628]' : 'border-[#48d1cc]/30 text-[#a8bfd4]'}
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
              {logs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-[rgba(255,255,255,0.04)] rounded-lg">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
                    log.type === 'World Update' ? 'bg-[#48d1cc]' : log.type === 'Discovery' ? 'bg-[#4ade80]' :
                    log.type === 'Decision' ? 'bg-[#ffd166]' : log.type === 'Consequence' ? 'bg-[#a78bfa]' : 'bg-[#a8bfd4]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#48d1cc]">{log.type}</span>
                      <span className="text-xs text-[#a8bfd4]">[{log.sectorId}]</span>
                    </div>
                    <p className="text-sm text-white mt-1">{log.entry}</p>
                    <span className="text-xs text-[#a8bfd4]/60">by {log.addedBy}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-[#a8bfd4] text-sm">No logs yet.</p>}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="glass-panel p-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Student Reports</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {reports.length > 0 ? reports.map((report: any) => (
                <div key={report.id} className="bg-[rgba(255,255,255,0.04)] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-[#ffd166] font-bold">{report.reportType}</span>
                      <h3 className="text-white font-bold">{report.title}</h3>
                    </div>
                    <span className="text-xs text-[#a8bfd4] text-right">{teams.find(t => t.teamId === report.teamId)?.name}</span>
                  </div>
                  <p className="text-sm text-[#a8bfd4] mt-2">{report.content}</p>
                  {report.teacherComment && (
                    <div className="mt-2 p-2 bg-[rgba(74,222,128,0.1)] rounded border border-[#4ade80]/30">
                      <span className="text-xs text-[#4ade80]">Teacher: {report.teacherComment}</span>
                    </div>
                  )}
                </div>
              )) : <p className="text-[#a8bfd4] text-sm">No reports submitted yet.</p>}
            </div>
          </div>
        )}

        {/* Add Log Tab */}
        {activeTab === 'add-log' && (
          <div className="glass-panel p-4 animate-fade-in max-w-2xl">
            <h2 className="text-lg font-bold text-[#48d1cc] mb-4">Add World Log Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1.5">Log Type</label>
                <Select value={logType} onValueChange={setLogType}>
                  <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#102848]">
                    {['World Update', 'Discovery', 'Decision', 'Consequence', 'Teacher Note'].map(t => (
                      <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1.5">Sector</label>
                <Select value={logSector} onValueChange={setLogSector}>
                  <SelectTrigger className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#102848]">
                    <SelectItem value="all" className="text-white">All Sectors</SelectItem>
                    {sectors.map(s => (
                      <SelectItem key={s.sectorId} value={s.sectorId} className="text-white">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#a8bfd4] block mb-1.5">Entry</label>
                <Textarea value={logEntry} onChange={e => setLogEntry(e.target.value)} placeholder="Example: The Signal Tower flashed three times after the Tech Team asked their question." className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[100px]" />
              </div>
              <Button onClick={handleAddLog} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold">
                <Plus className="w-4 h-4 mr-2" /> Add to World Log
              </Button>
            </div>
          </div>
        )}

        {/* Backup/Restore Tab */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="glass-panel p-4">
              <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                <Download className="w-5 h-5" /> Export World Data
              </h2>
              <p className="text-sm text-[#a8bfd4] mb-4">Download a JSON backup of all reports, logs, and world state.</p>
              <Button onClick={handleExport} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold">
                <Download className="w-4 h-4 mr-2" /> Download Backup JSON
              </Button>
            </div>

            <div className="glass-panel p-4">
              <h2 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Import World Data
              </h2>
              {!showImport ? (
                <>
                  <p className="text-sm text-[#a8bfd4] mb-4">Restore a previously exported backup.</p>
                  <Button onClick={() => setShowImport(true)} variant="outline" className="border-[#48d1cc]/50 text-[#48d1cc]">
                    <Upload className="w-4 h-4 mr-2" /> Import from JSON
                  </Button>
                </>
              ) : (
                <>
                  <Textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste your JSON backup data here..." className="bg-[rgba(8,22,36,0.9)] border-[#48d1cc]/20 text-white min-h-[150px] mb-3" />
                  <div className="flex gap-2">
                    <Button onClick={handleImport} className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold">
                      <Upload className="w-4 h-4 mr-2" /> Import
                    </Button>
                    <Button onClick={() => { setShowImport(false); setImportText(''); setImportStatus('') }} variant="outline" className="border-[#48d1cc]/30 text-[#a8bfd4]">
                      Cancel
                    </Button>
                  </div>
                  {importStatus && <p className={`text-sm mt-2 ${importStatus.includes('successful') ? 'text-[#4ade80]' : 'text-[#ff6b6b]'}`}>{importStatus}</p>}
                </>
              )}
            </div>

            <div className="glass-panel p-4 md:col-span-2">
              <h2 className="text-lg font-bold text-[#ff6b6b] mb-3 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" /> Reset World
              </h2>
              <p className="text-sm text-[#a8bfd4] mb-4">This will delete ALL student reports and log entries from the server database and clear all local browser data.</p>
              <Button
                disabled={clearLogsMutation.isPending || clearReportsMutation.isPending}
                onClick={async () => {
                  if (!confirm('Are you sure? This will permanently delete ALL student work from the server!')) return
                  setResetStatus('Clearing logs...')
                  try {
                    console.log('[Reset] Clearing logs for worldId:', worldId)
                    const logResult = await clearLogsMutation.mutateAsync({ worldId })
                    console.log('[Reset] Logs cleared:', logResult)
                    setResetStatus('Logs cleared. Clearing reports...')

                    const reportResult = await clearReportsMutation.mutateAsync({ worldId })
                    console.log('[Reset] Reports cleared:', reportResult)
                    setResetStatus('All data cleared! Reloading...')

                    localStorage.clear()
                    setTimeout(() => window.location.reload(), 800)
                  } catch (err: any) {
                    const msg = err?.message || String(err)
                    console.error('[Reset] Error:', err)
                    setResetStatus('Error: ' + msg)
                  }
                }}
                className="bg-[#ff6b6b] hover:bg-[#e55a5a] text-white font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {clearLogsMutation.isPending || clearReportsMutation.isPending ? 'Clearing...' : 'Reset Everything'}
              </Button>
              {resetStatus && (
                <p className={`text-sm mt-3 ${resetStatus.includes('Error') ? 'text-[#ff6b6b]' : 'text-[#4ade80]'}`}>
                  {resetStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
