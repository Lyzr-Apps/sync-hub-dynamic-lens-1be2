'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiClipboard, FiPlus, FiLink, FiClock, FiTrash2 } from 'react-icons/fi'

interface RecentSession {
  code: string
  date: string
  itemCount: number
}

interface HomeSectionProps {
  joinCode: string
  setJoinCode: (code: string) => void
  onCreateSession: () => void
  onJoinSession: () => void
  recentSessions: RecentSession[]
  onClearHistory: () => void
}

export default function HomeSection({
  joinCode,
  setJoinCode,
  onCreateSession,
  onJoinSession,
  recentSessions,
  onClearHistory,
}: HomeSectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FiClipboard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground" style={{ letterSpacing: '-0.01em' }}>
            ClipSync
          </h1>
        </div>
        <p className="text-muted-foreground text-base" style={{ lineHeight: '1.55' }}>
          Cross-device clipboard and file sharing, instantly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
        <Card className="border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FiPlus className="w-5 h-5 text-primary" />
              New Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.55' }}>
              Create a new sharing session and invite other devices to connect via QR code or session code.
            </p>
            <Button
              onClick={onCreateSession}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              size="lg"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FiLink className="w-5 h-5 text-primary" />
              Join Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.55' }}>
              Enter the session code displayed on the host device to connect and start sharing.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 bg-background/80 border-border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && joinCode.trim()) onJoinSession()
                }}
              />
              <Button
                onClick={onJoinSession}
                disabled={!joinCode.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {Array.isArray(recentSessions) && recentSessions.length > 0 && (
        <Card className="w-full max-w-2xl border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-md">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FiClock className="w-4 h-4 text-muted-foreground" />
              Recent Sessions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClearHistory} className="text-muted-foreground hover:text-destructive">
              <FiTrash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {recentSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-background/60 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {session.code}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{session.date}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {session.itemCount} item{session.itemCount !== 1 ? 's' : ''} shared
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
