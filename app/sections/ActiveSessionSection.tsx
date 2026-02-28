'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FiFileText, FiCode, FiFile, FiImage, FiCopy,
  FiDownload, FiMaximize2, FiZap, FiSend, FiUpload,
  FiWifi, FiClock, FiX, FiCheck
} from 'react-icons/fi'

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

interface ActiveSessionSectionProps {
  session: SessionInfo
  items: TransferItem[]
  onShareText: (text: string) => void
  onShareCode: (code: string, language: string) => void
  onShareFile: (file: File) => void
  onDisconnect: () => void
  onSmartAction: (item: TransferItem) => void
  onExpandItem: (item: TransferItem) => void
  elapsedTime: string
}

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS',
  'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Swift',
  'Kotlin', 'SQL', 'Shell', 'JSON', 'YAML', 'Markdown'
]

function typeIcon(type: TransferItemType) {
  switch (type) {
    case 'text': return <FiFileText className="w-4 h-4" />
    case 'code': return <FiCode className="w-4 h-4" />
    case 'file': return <FiFile className="w-4 h-4" />
    case 'image': return <FiImage className="w-4 h-4" />
  }
}

function typeBadgeColor(type: TransferItemType): string {
  switch (type) {
    case 'text': return 'bg-blue-100 text-blue-700'
    case 'code': return 'bg-purple-100 text-purple-700'
    case 'file': return 'bg-amber-100 text-amber-700'
    case 'image': return 'bg-green-100 text-green-700'
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function codeHighlight(code: string, language: string) {
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'async', 'await', 'class', 'new', 'this', 'true', 'false', 'null', 'undefined'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'async', 'await', 'class', 'new', 'this', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'with', 'as', 'try', 'except', 'lambda', 'yield', 'pass'],
  }
  const lang = language.toLowerCase()
  const kws = keywords[lang] || keywords['javascript'] || []
  const lines = code.split('\n')
  return lines.map((line, li) => {
    let highlighted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color:hsl(220,12%,50%)">$1</span>')
    highlighted = highlighted.replace(/(#.*$)/gm, '<span style="color:hsl(220,12%,50%)">$1</span>')
    highlighted = highlighted.replace(/(&quot;[^&]*&quot;|'[^']*'|"[^"]*"|`[^`]*`)/g, '<span style="color:hsl(193,43%,47%)">$1</span>')

    kws.forEach(kw => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g')
      highlighted = highlighted.replace(regex, `<span style="color:hsl(213,32%,52%);font-weight:600">$1</span>`)
    })

    return `<span style="color:hsl(220,12%,50%);user-select:none;margin-right:12px;display:inline-block;width:24px;text-align:right">${li + 1}</span>${highlighted}`
  }).join('\n')
}

export default function ActiveSessionSection({
  session,
  items,
  onShareText,
  onShareCode,
  onShareFile,
  onDisconnect,
  onSmartAction,
  onExpandItem,
  elapsedTime,
}: ActiveSessionSectionProps) {
  const [textInput, setTextInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [selectedLang, setSelectedLang] = useState('JavaScript')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCopy = (item: TransferItem) => {
    const text = item.type === 'file' ? (item.fileName ?? '') : item.content
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShareText = () => {
    if (textInput.trim()) {
      onShareText(textInput.trim())
      setTextInput('')
    }
  }

  const handleShareCode = () => {
    if (codeInput.trim()) {
      onShareCode(codeInput.trim(), selectedLang)
      setCodeInput('')
    }
  }

  const handleShareFile = () => {
    if (selectedFile) {
      setUploading(true)
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setUploading(false)
            onShareFile(selectedFile)
            setSelectedFile(null)
            return 0
          }
          return prev + 20
        })
      }, 200)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) setSelectedFile(file)
  }

  const safeItems = Array.isArray(items) ? items : []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-card/80 backdrop-blur-[16px] border-b border-border/50">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Connected</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs tracking-wider">
            {session?.code ?? ''}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FiClock className="w-3 h-3" />
            <span>{elapsedTime}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 transition-all duration-300"
        >
          <FiX className="w-3.5 h-3.5 mr-1" />
          Disconnect
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[420px] lg:border-r border-border/50 p-4 md:p-6 overflow-y-auto">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="w-full bg-muted/40 rounded-xl mb-4">
              <TabsTrigger value="text" className="flex-1 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FiFileText className="w-3.5 h-3.5 mr-1.5" />Text
              </TabsTrigger>
              <TabsTrigger value="code" className="flex-1 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FiCode className="w-3.5 h-3.5 mr-1.5" />Code
              </TabsTrigger>
              <TabsTrigger value="file" className="flex-1 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FiFile className="w-3.5 h-3.5 mr-1.5" />File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 mt-0">
              <Textarea
                placeholder="Paste or type text to share..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[160px] bg-background/70 border-border resize-none text-sm"
                style={{ lineHeight: '1.55' }}
              />
              <Button
                onClick={handleShareText}
                disabled={!textInput.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Share Text
              </Button>
            </TabsContent>

            <TabsContent value="code" className="space-y-3 mt-0">
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="bg-background/70 border-border">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Paste code here..."
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="min-h-[160px] bg-background/70 border-border font-mono text-sm resize-none"
                style={{ lineHeight: '1.55' }}
              />
              <Button
                onClick={handleShareCode}
                disabled={!codeInput.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Share Code
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-3 mt-0">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[160px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <FiUpload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-foreground font-medium">
                    {selectedFile ? selectedFile.name : 'Drop a file or click to browse'}
                  </p>
                  {selectedFile ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Any file type supported
                    </p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target?.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                />
              </div>
              {uploading && (
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <Button
                onClick={handleShareFile}
                disabled={!selectedFile || uploading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <FiUpload className="w-4 h-4 mr-2" />
                {uploading ? 'Sharing...' : 'Share File'}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-background/40">
          <div className="px-4 md:px-6 py-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FiWifi className="w-4 h-4 text-primary" />
                Transfer Feed
              </h3>
              <span className="text-xs text-muted-foreground">{safeItems.length} item{safeItems.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 md:px-6 py-3">
            {safeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiWifi className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No items shared yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Share text, code, or files using the panel</p>
              </div>
            ) : (
              <div className="space-y-3">
                {safeItems.map((item) => {
                  const isExpanded = expandedId === item.id
                  return (
                    <Card key={item.id} className="border border-border/40 bg-card/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeBadgeColor(item.type)}`}>
                              {typeIcon(item.type)}
                            </span>
                            <span className="text-xs font-medium text-foreground capitalize">{item.type}</span>
                            {item.language && (
                              <Badge variant="secondary" className="text-[10px] font-mono">{item.language}</Badge>
                            )}
                            {item.sender === 'remote' && (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Remote</Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {formatTime(item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp))}
                            </span>
                          </div>
                        </div>

                        {item.type === 'code' ? (
                          <div className="bg-foreground/[0.03] rounded-lg p-3 overflow-x-auto mb-2">
                            <pre
                              className="font-mono text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: codeHighlight(
                                  isExpanded ? item.content : (item.content?.substring(0, 300) ?? ''),
                                  item.language ?? 'javascript'
                                )
                              }}
                            />
                            {(item.content?.length ?? 0) > 300 && !isExpanded && (
                              <p className="text-xs text-muted-foreground mt-1 italic">...truncated</p>
                            )}
                          </div>
                        ) : item.type === 'file' ? (
                          <div className="flex items-center gap-3 bg-foreground/[0.03] rounded-lg p-3 mb-2">
                            <FiFile className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.fileName ?? 'Unknown file'}</p>
                              {item.fileSize != null && (
                                <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground/80 mb-2" style={{ lineHeight: '1.55' }}>
                            {isExpanded ? item.content : (item.content?.substring(0, 200) ?? '')}
                            {(item.content?.length ?? 0) > 200 && !isExpanded && '...'}
                          </p>
                        )}

                        <div className="flex items-center gap-1 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(item)}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === item.id ? (
                              <><FiCheck className="w-3 h-3 mr-1 text-green-600" />Copied</>
                            ) : (
                              <><FiCopy className="w-3 h-3 mr-1" />Copy</>
                            )}
                          </Button>
                          {item.type === 'file' && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                              <FiDownload className="w-3 h-3 mr-1" />Download
                            </Button>
                          )}
                          {(item.content?.length ?? 0) > 200 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <FiMaximize2 className="w-3 h-3 mr-1" />{isExpanded ? 'Less' : 'More'}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSmartAction(item)}
                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <FiZap className="w-3 h-3 mr-1" />Smart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
