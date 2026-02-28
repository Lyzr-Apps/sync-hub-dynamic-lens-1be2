'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FiSidebar, FiX, FiSearch, FiFileText, FiCode,
  FiFile, FiImage, FiLoader
} from 'react-icons/fi'

type TransferItemType = 'text' | 'code' | 'file' | 'image'
type FilterType = 'all' | TransferItemType

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

interface SessionHistorySidebarProps {
  isOpen: boolean
  onToggle: () => void
  items: TransferItem[]
  onSearch: (query: string) => void
  searchLoading: boolean
  searchResult: string
  onItemClick: (item: TransferItem) => void
}

function typeIcon(type: TransferItemType) {
  switch (type) {
    case 'text': return <FiFileText className="w-3.5 h-3.5" />
    case 'code': return <FiCode className="w-3.5 h-3.5" />
    case 'file': return <FiFile className="w-3.5 h-3.5" />
    case 'image': return <FiImage className="w-3.5 h-3.5" />
  }
}

function formatTime(d: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return d.toLocaleDateString()
}

export default function SessionHistorySidebar({
  isOpen,
  onToggle,
  items,
  onSearch,
  searchLoading,
  searchResult,
  onItemClick,
}: SessionHistorySidebarProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = Array.isArray(items)
    ? items.filter(item => filter === 'all' || item.type === filter)
    : []

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-30 w-10 h-10 rounded-xl bg-card/90 backdrop-blur-[16px] border border-white/[0.18] shadow-lg flex items-center justify-center hover:bg-card transition-colors"
      >
        <FiSidebar className="w-5 h-5 text-foreground" />
      </button>
    )
  }

  return (
    <div className="fixed top-0 right-0 z-30 h-full w-80 bg-card/95 backdrop-blur-[16px] border-l border-white/[0.18] shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground text-sm">Transfer History</h3>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3 border-b border-border/30">
        <div className="flex gap-1.5">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            className="flex-1 h-8 text-sm bg-background/70 border-border"
          />
          <Button size="sm" variant="ghost" onClick={handleSearch} disabled={searchLoading} className="h-8 w-8 p-0">
            {searchLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSearch className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex gap-1 flex-wrap">
          {(['all', 'text', 'code', 'file', 'image'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {searchResult && (
        <div className="px-4 py-3 bg-primary/5 border-b border-border/30">
          <p className="text-xs font-medium text-primary mb-1">Search Result</p>
          <p className="text-xs text-foreground whitespace-pre-wrap">{searchResult}</p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-2">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No items yet</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="w-full text-left p-3 rounded-xl bg-background/60 border border-border/40 hover:bg-background/80 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground">{typeIcon(item.type)}</span>
                  <Badge variant="outline" className="text-[10px] rounded-full border-border/60">
                    {item.type}
                  </Badge>
                  {item.language && (
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {item.language}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatTime(item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp))}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 truncate">
                  {item.type === 'file' ? (item.fileName ?? 'File') : (item.content?.substring(0, 80) ?? '')}
                </p>
                {item.sender === 'remote' && (
                  <span className="text-[10px] text-primary mt-1 inline-block">From paired device</span>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
