'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FiClipboard, FiActivity } from 'react-icons/fi'
import { callAIAgent } from '@/lib/aiAgent'

import HomeSection from './sections/HomeSection'
import ActiveSessionSection from './sections/ActiveSessionSection'
import QRModal from './sections/QRModal'
import SmartActionsPanel from './sections/SmartActionsPanel'
import SessionHistorySidebar from './sections/SessionHistorySidebar'

const AGENT_ID = '69a282af8e6d0e51fd5cd42b'

type AppView = 'home' | 'session'
type TransferItemType = 'text' | 'code' | 'file' | 'image'

interface TransferItem {
  id: string
  type: TransferItemType
  content: string
  fileName?: string
  fileSize?: number
  language?: string
  timestamp: Date
  sender: 'local' | 'remote'
}

interface SessionInfo {
  code: string
  startedAt: Date
  deviceName: string
}

interface RecentSession {
  code: string
  date: string
  itemCount: number
}

interface AgentResponse {
  action_type?: string
  title?: string
  content?: string
  detected_language?: string
  tags?: string[]
}

const THEME_VARS = {
  '--background': '220 27% 98%',
  '--foreground': '220 16% 22%',
  '--card': '220 27% 96%',
  '--card-foreground': '220 16% 22%',
  '--popover': '220 27% 94%',
  '--popover-foreground': '220 16% 22%',
  '--primary': '213 32% 52%',
  '--primary-foreground': '220 27% 98%',
  '--secondary': '220 20% 92%',
  '--secondary-foreground': '220 16% 25%',
  '--accent': '193 43% 67%',
  '--accent-foreground': '220 16% 15%',
  '--destructive': '354 42% 56%',
  '--destructive-foreground': '220 27% 98%',
  '--muted': '220 16% 90%',
  '--muted-foreground': '220 12% 50%',
  '--border': '220 16% 88%',
  '--input': '220 16% 82%',
  '--ring': '213 32% 52%',
  '--radius': '0.875rem',
} as React.CSSProperties

const SAMPLE_ITEMS: TransferItem[] = [
  {
    id: 's1',
    type: 'text',
    content: 'Meeting notes: Discussed Q4 roadmap priorities. Key decisions — focus on mobile experience, defer analytics dashboard to Q1. Action items: Sarah to draft PRD by Friday, Mike to schedule design review.',
    timestamp: new Date(Date.now() - 120000),
    sender: 'local',
  },
  {
    id: 's2',
    type: 'code',
    content: 'async function fetchData(url: string) {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error("Network error");\n  return response.json();\n}',
    language: 'TypeScript',
    timestamp: new Date(Date.now() - 300000),
    sender: 'remote',
  },
  {
    id: 's3',
    type: 'file',
    content: '',
    fileName: 'presentation-final.pdf',
    fileSize: 2457600,
    timestamp: new Date(Date.now() - 600000),
    sender: 'local',
  },
  {
    id: 's4',
    type: 'text',
    content: 'https://figma.com/file/abc123/design-system — latest component library link for the team.',
    timestamp: new Date(Date.now() - 900000),
    sender: 'remote',
  },
]

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [view, setView] = useState<AppView>('home')
  const [showSample, setShowSample] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [items, setItems] = useState<TransferItem[]>([])
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('00:00')
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])

  const [smartOpen, setSmartOpen] = useState(false)
  const [smartItem, setSmartItem] = useState<TransferItem | null>(null)
  const [smartLoading, setSmartLoading] = useState(false)
  const [smartResponse, setSmartResponse] = useState<AgentResponse | null>(null)
  const [smartError, setSmartError] = useState('')

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState('')

  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('clipsync_recent')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setRecentSessions(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (view === 'session' && session) {
      timerRef.current = setInterval(() => {
        const now = new Date()
        const startTime = session.startedAt instanceof Date ? session.startedAt : new Date(session.startedAt)
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        const mins = Math.floor(diff / 60).toString().padStart(2, '0')
        const secs = (diff % 60).toString().padStart(2, '0')
        setElapsedTime(`${mins}:${secs}`)
      }, 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [view, session])

  useEffect(() => {
    if (showSample && view === 'home') {
      setRecentSessions([
        { code: 'XK7M4P', date: 'Today, 2:30 PM', itemCount: 7 },
        { code: 'BN3Q9R', date: 'Yesterday', itemCount: 12 },
        { code: 'TG5W2H', date: 'Feb 25', itemCount: 3 },
      ])
    } else if (!showSample && view === 'home') {
      try {
        const stored = localStorage.getItem('clipsync_recent')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) setRecentSessions(parsed)
          else setRecentSessions([])
        } else {
          setRecentSessions([])
        }
      } catch {
        setRecentSessions([])
      }
    }
  }, [showSample, view])

  const startSession = useCallback(() => {
    const code = generateSessionCode()
    setQrCode(code)
    setShowQR(true)
    const newSession: SessionInfo = {
      code,
      startedAt: new Date(),
      deviceName: 'This Device',
    }
    setSession(newSession)
    setItems(showSample ? [...SAMPLE_ITEMS] : [])
    setView('session')
  }, [showSample])

  const joinSession = useCallback(() => {
    if (!joinCode.trim()) return
    const newSession: SessionInfo = {
      code: joinCode.trim().toUpperCase(),
      startedAt: new Date(),
      deviceName: 'This Device',
    }
    setSession(newSession)
    setItems(showSample ? [...SAMPLE_ITEMS] : [])
    setView('session')
    setJoinCode('')
    setTimeout(() => {
      setItems(prev => [{
        id: `r-${Date.now()}`,
        type: 'text',
        content: 'Connected! Ready to share.',
        timestamp: new Date(),
        sender: 'remote',
      }, ...prev])
    }, 1500)
  }, [joinCode, showSample])

  const disconnect = useCallback(() => {
    if (session) {
      const newRecent: RecentSession = {
        code: session.code,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        itemCount: items.length,
      }
      const updated = [newRecent, ...recentSessions].slice(0, 10)
      setRecentSessions(updated)
      try { localStorage.setItem('clipsync_recent', JSON.stringify(updated)) } catch {}
    }
    setView('home')
    setSession(null)
    setItems([])
    setElapsedTime('00:00')
    if (timerRef.current) clearInterval(timerRef.current)
    setSidebarOpen(false)
    setSmartOpen(false)
  }, [session, items, recentSessions])

  const shareText = useCallback((text: string) => {
    const newItem: TransferItem = {
      id: `l-${Date.now()}`,
      type: 'text',
      content: text,
      timestamp: new Date(),
      sender: 'local',
    }
    setItems(prev => [newItem, ...prev])
  }, [])

  const shareCode = useCallback((code: string, language: string) => {
    const newItem: TransferItem = {
      id: `l-${Date.now()}`,
      type: 'code',
      content: code,
      language,
      timestamp: new Date(),
      sender: 'local',
    }
    setItems(prev => [newItem, ...prev])
  }, [])

  const shareFile = useCallback((file: File) => {
    const newItem: TransferItem = {
      id: `l-${Date.now()}`,
      type: 'file',
      content: '',
      fileName: file.name,
      fileSize: file.size,
      timestamp: new Date(),
      sender: 'local',
    }
    setItems(prev => [newItem, ...prev])
  }, [])

  const handleSmartAction = useCallback((item: TransferItem) => {
    setSmartItem(item)
    setSmartOpen(true)
    setSmartResponse(null)
    setSmartError('')
  }, [])

  const executeSmartAction = useCallback(async (action: string) => {
    if (!smartItem) return
    setSmartLoading(true)
    setSmartError('')
    setSmartResponse(null)
    setActiveAgentId(AGENT_ID)

    let message = ''
    switch (action) {
      case 'summarize':
        message = `Summarize the following text:\n\n${smartItem.content}`
        break
      case 'describe':
        message = `Describe the following content:\n\n${smartItem.content}`
        break
      case 'format_code':
        message = `Format and detect the language of this code snippet:\n\n${smartItem.content}`
        break
      case 'organize':
        message = `Organize and categorize the following content:\n\n${smartItem.content}`
        break
      default:
        message = `${action} the following:\n\n${smartItem.content}`
    }

    try {
      const result = await callAIAgent(message, AGENT_ID)
      if (result?.success) {
        const data = result?.response?.result
        setSmartResponse({
          action_type: data?.action_type ?? action,
          title: data?.title ?? 'Result',
          content: data?.content ?? '',
          detected_language: data?.detected_language ?? '',
          tags: Array.isArray(data?.tags) ? data.tags : [],
        })
      } else {
        setSmartError(result?.error ?? 'Failed to process. Please try again.')
      }
    } catch {
      setSmartError('An unexpected error occurred. Please try again.')
    } finally {
      setSmartLoading(false)
      setActiveAgentId(null)
    }
  }, [smartItem])

  const handleSearch = useCallback(async (query: string) => {
    setSearchLoading(true)
    setSearchResult('')
    setActiveAgentId(AGENT_ID)

    const itemsSummary = items.map(i =>
      `- [${i.type}] ${i.type === 'file' ? (i.fileName ?? 'file') : (i.content?.substring(0, 100) ?? '')}`
    ).join('\n')

    const message = `Search through these transfer items for: "${query}"\n\nItems:\n${itemsSummary}`

    try {
      const result = await callAIAgent(message, AGENT_ID)
      if (result?.success) {
        const data = result?.response?.result
        setSearchResult(data?.content ?? 'No matching items found.')
      } else {
        setSearchResult('Search failed. Please try again.')
      }
    } catch {
      setSearchResult('Search error. Please try again.')
    } finally {
      setSearchLoading(false)
      setActiveAgentId(null)
    }
  }, [items])

  const clearHistory = useCallback(() => {
    setRecentSessions([])
    try { localStorage.removeItem('clipsync_recent') } catch {}
  }, [])

  return (
    <ErrorBoundary>
      <div
        style={THEME_VARS}
        className="min-h-screen bg-background text-foreground font-sans"
      >
        <div
          className="min-h-screen"
          style={{
            background: 'linear-gradient(135deg, hsl(220,30%,97%) 0%, hsl(210,25%,95%) 35%, hsl(200,20%,96%) 70%, hsl(230,25%,97%) 100%)',
          }}
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/30 bg-card/50 backdrop-blur-[16px]">
            <div className="flex items-center gap-2">
              <FiClipboard className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground tracking-tight" style={{ letterSpacing: '-0.01em' }}>ClipSync</span>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
              <Switch
                id="sample-toggle"
                checked={showSample}
                onCheckedChange={(checked) => {
                  setShowSample(checked)
                  if (checked && view === 'session') {
                    setItems(prev => prev.length === 0 ? [...SAMPLE_ITEMS] : prev)
                  }
                }}
              />
            </div>
          </div>

          {view === 'home' ? (
            <HomeSection
              joinCode={joinCode}
              setJoinCode={setJoinCode}
              onCreateSession={startSession}
              onJoinSession={joinSession}
              recentSessions={recentSessions}
              onClearHistory={clearHistory}
            />
          ) : session ? (
            <div className="h-[calc(100vh-49px)] flex flex-col">
              <ActiveSessionSection
                session={session}
                items={items}
                onShareText={shareText}
                onShareCode={shareCode}
                onShareFile={shareFile}
                onDisconnect={disconnect}
                onSmartAction={handleSmartAction}
                onExpandItem={() => {}}
                elapsedTime={elapsedTime}
              />
            </div>
          ) : null}

          {showQR && qrCode && (
            <QRModal
              sessionCode={qrCode}
              onClose={() => setShowQR(false)}
            />
          )}

          <SmartActionsPanel
            isOpen={smartOpen}
            onClose={() => {
              setSmartOpen(false)
              setSmartResponse(null)
              setSmartError('')
            }}
            loading={smartLoading}
            response={smartResponse}
            error={smartError}
            onAction={executeSmartAction}
            itemContent={smartItem?.content ?? ''}
            itemType={smartItem?.type ?? 'text'}
          />

          {view === 'session' && (
            <SessionHistorySidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(prev => !prev)}
              items={items}
              onSearch={handleSearch}
              searchLoading={searchLoading}
              searchResult={searchResult}
              onItemClick={handleSmartAction}
            />
          )}

          <div className="fixed bottom-4 left-4 z-20">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-[16px] border border-white/[0.18] shadow-lg text-xs">
              <FiActivity className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Clipboard Assistant</span>
              {activeAgentId ? (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground animate-pulse">Processing</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground">Ready</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
