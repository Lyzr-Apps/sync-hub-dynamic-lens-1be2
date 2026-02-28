'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiZap, FiX, FiLoader } from 'react-icons/fi'

interface AgentResponse {
  action_type?: string
  title?: string
  content?: string
  detected_language?: string
  tags?: string[]
}

interface SmartActionsPanelProps {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  response: AgentResponse | null
  error: string
  onAction: (action: string) => void
  itemContent: string
  itemType: string
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function actionLabel(action: string): string {
  switch (action) {
    case 'summarize': return 'Summarize'
    case 'describe': return 'Describe'
    case 'format_code': return 'Format Code'
    case 'search': return 'Search'
    case 'organize': return 'Organize'
    default: return action || 'Action'
  }
}

function actionColor(action: string): string {
  switch (action) {
    case 'summarize': return 'bg-blue-100 text-blue-700'
    case 'describe': return 'bg-green-100 text-green-700'
    case 'format_code': return 'bg-purple-100 text-purple-700'
    case 'search': return 'bg-amber-100 text-amber-700'
    case 'organize': return 'bg-teal-100 text-teal-700'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function SmartActionsPanel({
  isOpen,
  onClose,
  loading,
  response,
  error,
  onAction,
  itemContent,
  itemType,
}: SmartActionsPanelProps) {
  if (!isOpen) return null

  const showCodeActions = itemType === 'code'
  const showTextActions = itemType === 'text' || itemType === 'file' || itemType === 'image'

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 mb-4 md:mb-0 bg-card/95 backdrop-blur-[16px] border border-white/[0.18] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FiZap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Smart Actions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {showTextActions && (
              <>
                <Button size="sm" variant="outline" onClick={() => onAction('summarize')} disabled={loading} className="rounded-full border-border">
                  Summarize
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction('describe')} disabled={loading} className="rounded-full border-border">
                  Describe
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction('organize')} disabled={loading} className="rounded-full border-border">
                  Organize
                </Button>
              </>
            )}
            {showCodeActions && (
              <>
                <Button size="sm" variant="outline" onClick={() => onAction('format_code')} disabled={loading} className="rounded-full border-border">
                  Format Code
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction('summarize')} disabled={loading} className="rounded-full border-border">
                  Summarize
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction('describe')} disabled={loading} className="rounded-full border-border">
                  Describe
                </Button>
              </>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <FiLoader className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Processing with AI...</span>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {response && !loading && (
            <Card className="border border-border/50 bg-background/60">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${actionColor(response.action_type ?? '')}`}>
                    {actionLabel(response.action_type ?? '')}
                  </span>
                  {response.detected_language ? (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {response.detected_language}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-base font-semibold mt-1">
                  {response.title ?? 'Result'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ScrollArea className="max-h-64">
                  <div className="text-foreground">
                    {renderMarkdown(response.content ?? '')}
                  </div>
                </ScrollArea>
                {Array.isArray(response.tags) && response.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
                    {response.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs rounded-full border-border/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!response && !loading && !error && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Choose an action above to process this item with AI
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
