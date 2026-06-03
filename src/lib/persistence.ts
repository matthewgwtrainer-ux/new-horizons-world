// Persistence layer: localStorage backup for multi-week classroom use
// When backend is available, this acts as a cache. When offline, it's the primary store.

import type { StaticLog, StaticReport, StaticWorld } from '@/data/staticWorld'
import { staticWorld, staticLogs, staticReports } from '@/data/staticWorld'

const STORAGE_KEY = 'kimis-horizon-world'

export interface PersistedState {
  world: StaticWorld
  logs: StaticLog[]
  reports: StaticReport[]
  currentSession: number
  lastVisited: string
}

function getDefaultState(): PersistedState {
  return {
    world: staticWorld,
    logs: [...staticLogs],
    reports: [...staticReports],
    currentSession: staticWorld.currentSession,
    lastVisited: new Date().toISOString(),
  }
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as PersistedState
    // Ensure all required fields exist (backward compatibility)
    return {
      ...getDefaultState(),
      ...parsed,
      // Always restore logs/reports from storage if they exist
      logs: parsed.logs || staticLogs,
      reports: parsed.reports || staticReports,
    }
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastVisited: new Date().toISOString(),
    }))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

export function addReport(report: Omit<StaticReport, 'id' | 'createdAt'>): StaticReport {
  const state = loadState()
  const newReport: StaticReport = {
    ...report,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }
  state.reports = [newReport, ...state.reports]
  saveState(state)
  return newReport
}

export function addLog(log: Omit<StaticLog, 'id' | 'createdAt'>): StaticLog {
  const state = loadState()
  const newLog: StaticLog = {
    ...log,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  }
  state.logs = [newLog, ...state.logs]
  saveState(state)
  return newLog
}

export function updateSession(sessionId: number): void {
  const state = loadState()
  state.currentSession = sessionId
  state.world.currentSession = sessionId
  saveState(state)
}

export function getReports(): StaticReport[] {
  return loadState().reports
}

export function getLogs(): StaticLog[] {
  return loadState().logs
}

export function getCurrentSession(): number {
  return loadState().currentSession
}

export function resetWorld(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Export all data as JSON (for teacher backup)
export function exportData(): string {
  return JSON.stringify(loadState(), null, 2)
}

// Import data from JSON (for teacher restore)
export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    return true
  } catch {
    return false
  }
}
