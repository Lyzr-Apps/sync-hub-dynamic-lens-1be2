'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiPlus, FiLink, FiClock, FiTrash2 } from 'react-icons/fi'

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
  visible: boolean
}

function Clipboard3D() {
  return (
    <div className="relative flex items-center justify-center py-4" style={{ perspective: '800px' }}>
      <div
        className="relative w-44 h-60 rounded-2xl shadow-2xl"
        style={{
          transform: 'rotateX(10deg) rotateY(-15deg) rotateZ(2deg)',
          animation: 'float3d 6s ease-in-out infinite',
          background: 'linear-gradient(135deg, hsl(213,32%,52%), hsl(193,43%,67%))',
        }}
      >
        <div
          className="absolute -top-3.5 left-1/2 w-20 h-7 rounded-t-xl"
          style={{
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, hsl(213,32%,42%), hsl(213,32%,48%))',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div className="w-8 h-2 bg-white/20 rounded-full mx-auto mt-2.5" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
        <div className="p-6 pt-10 space-y-3.5">
          <div className="h-2.5 bg-white/35 rounded-full w-3/4" style={{ animation: 'shimmer 2.5s linear infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 100%)' }} />
          <div className="h-2.5 bg-white/25 rounded-full w-full" />
          <div className="h-2.5 bg-white/30 rounded-full w-2/3" />
          <div className="h-2.5 bg-white/20 rounded-full w-5/6" />
          <div className="h-px bg-white/15 my-2" />
          <div className="h-2.5 bg-white/25 rounded-full w-4/5" />
          <div className="h-2.5 bg-white/15 rounded-full w-3/5" />
          <div className="h-2.5 bg-white/20 rounded-full w-full" />
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-full h-full rounded-2xl -z-10"
          style={{
            background: 'linear-gradient(135deg, hsl(213,32%,62%), hsl(193,43%,77%))',
            transform: 'translateZ(-8px) translateX(6px) translateY(6px)',
            opacity: 0.4,
          }}
        />
      </div>

      <div
        className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-md"
        style={{
          background: 'radial-gradient(circle, hsl(193,43%,67%) 0%, transparent 70%)',
          animation: 'floatOrb 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-4 -left-8 w-12 h-12 rounded-full blur-md"
        style={{
          background: 'radial-gradient(circle, hsl(213,32%,52%) 0%, transparent 70%)',
          animation: 'floatOrb 5s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/3 -right-12 w-8 h-8 rounded-full blur-sm"
        style={{
          background: 'radial-gradient(circle, hsl(213,32%,72%) 0%, transparent 70%)',
          animation: 'floatOrb 3.5s ease-in-out infinite 1s',
        }}
      />
      <div
        className="absolute -top-2 -left-14 w-6 h-6 border border-primary/20 rounded-lg"
        style={{
          transform: 'rotateZ(45deg)',
          animation: 'floatOrb 7s ease-in-out infinite 0.5s',
        }}
      />
      <div
        className="absolute bottom-8 -right-16 w-4 h-4 border border-accent/20 rounded-full"
        style={{ animation: 'floatOrb 6s ease-in-out infinite 2s' }}
      />
    </div>
  )
}

export default function HomeSection({
  joinCode,
  setJoinCode,
  onCreateSession,
  onJoinSession,
  recentSessions,
  onClearHistory,
  visible,
}: HomeSectionProps) {
  return (
    <div
      className="min-h-[calc(100vh-49px)] flex flex-col items-center justify-center px-4 py-12"
      style={{
        animation: visible ? 'fadeIn 0.5s ease-out both' : undefined,
      }}
    >
      <div className="text-center mb-6">
        <Clipboard3D />
        <div className="mt-6 mb-3">
          <span
            className="font-semibold text-4xl tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, hsl(213,32%,52%), hsl(193,43%,67%), hsl(213,32%,52%))',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite',
              letterSpacing: '-0.02em',
            }}
          >
            ClipSync
          </span>
        </div>
        <p className="text-muted-foreground text-base max-w-sm mx-auto" style={{ lineHeight: '1.55' }}>
          Cross-device clipboard and file sharing, instantly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
        <Card
          className="relative overflow-hidden border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          style={{ animation: 'slideInRight 0.5s ease-out 0.1s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[inherit]" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiPlus className="w-5 h-5 text-primary" />
              </div>
              New Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.55' }}>
              Create a new sharing session and invite other devices to connect via QR code or session code.
            </p>
            <Button
              onClick={onCreateSession}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20"
              size="lg"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          style={{ animation: 'slideInRight 0.5s ease-out 0.25s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[inherit]" />
          <CardHeader className="pb-3 relative">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiLink className="w-5 h-5 text-primary" />
              </div>
              Join Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <p className="text-sm text-muted-foreground" style={{ lineHeight: '1.55' }}>
              Enter the session code displayed on the host device to connect and start sharing.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter session code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 bg-background/80 border-border transition-all duration-300 focus:shadow-md focus:shadow-primary/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && joinCode.trim()) onJoinSession()
                }}
              />
              <Button
                onClick={onJoinSession}
                disabled={!joinCode.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20"
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {Array.isArray(recentSessions) && recentSessions.length > 0 && (
        <Card
          className="relative overflow-hidden w-full max-w-2xl border border-white/[0.18] bg-card/75 backdrop-blur-[16px] shadow-md hover:shadow-lg transition-all duration-300"
          style={{ animation: 'slideInRight 0.5s ease-out 0.4s both' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[inherit]" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between relative">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FiClock className="w-4 h-4 text-muted-foreground" />
              Recent Sessions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-muted-foreground hover:text-destructive active:scale-[0.95] transition-all duration-300"
            >
              <FiTrash2 className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="relative">
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {recentSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background/60 border border-border/50 hover:bg-background/80 hover:border-border/70 transition-all duration-300"
                    style={{ animation: `slideInRight 0.3s ease-out ${idx * 0.06}s both` }}
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
