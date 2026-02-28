'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FiX, FiCopy, FiCheck } from 'react-icons/fi'

interface QRModalProps {
  sessionCode: string
  onClose: () => void
}

function QRGrid({ code }: { code: string }) {
  const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const size = 21
  const cells: boolean[][] = []
  for (let r = 0; r < size; r++) {
    cells[r] = []
    for (let c = 0; c < size; c++) {
      const isCornerFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7)
      const isCornerBorder =
        isCornerFinder &&
        (r === 0 || r === 6 || c === 0 || c === 6 ||
          r === size - 7 || r === size - 1 || c === size - 7 || c === size - 1)
      const isCornerInner =
        isCornerFinder &&
        r >= 2 && r <= 4 && c >= 2 && c <= 4
      const isCornerInnerTop =
        (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3)
      const isCornerInnerBottom =
        (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4)

      if (isCornerBorder || isCornerInner || isCornerInnerTop || isCornerInnerBottom) {
        cells[r][c] = true
      } else if (isCornerFinder) {
        cells[r][c] = false
      } else {
        const hash = ((seed * (r + 1) * 31 + (c + 1) * 17) % 100)
        cells[r][c] = hash < 45
      }
    }
  }

  const cellSize = 10
  const totalSize = size * cellSize

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className="mx-auto"
      style={{ maxWidth: '240px', maxHeight: '240px', width: '100%', height: 'auto' }}
    >
      <rect width={totalSize} height={totalSize} fill="white" rx="4" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="hsl(220, 16%, 22%)"
              rx="1"
            />
          ) : null
        )
      )}
    </svg>
  )
}

export default function QRModal({ sessionCode, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'fadeIn 0.3s ease-out both' }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm mx-4 bg-card/95 backdrop-blur-[20px] border border-white/[0.18] rounded-2xl shadow-2xl p-8 overflow-hidden"
        style={{ animation: 'bounceIn 0.5s ease-out both' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-[inherit]" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-10"
        >
          <FiX className="w-4 h-4 text-foreground" />
        </button>

        <h2 className="text-xl font-semibold text-center mb-6 text-foreground relative">Scan to Connect</h2>

        <div className="bg-white rounded-xl p-4 mb-6 shadow-inner relative" style={{ animation: 'fadeIn 0.4s ease-out 0.2s both' }}>
          <QRGrid code={sessionCode} />
        </div>

        <div className="text-center space-y-4 relative">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Session Code</p>
            <Badge
              variant="secondary"
              className="text-lg font-mono px-4 py-1.5 tracking-widest"
              style={{ animation: 'fadeIn 0.4s ease-out 0.3s both' }}
            >
              {sessionCode}
            </Badge>
          </div>

          <Button
            variant="outline"
            onClick={handleCopy}
            className="w-full border-border hover:bg-muted/50 active:scale-[0.97] transition-all duration-300 hover:shadow-md"
          >
            {copied ? (
              <><FiCheck className="w-4 h-4 mr-2 text-green-600" />Copied!</>
            ) : (
              <><FiCopy className="w-4 h-4 mr-2" />Copy Code</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Share this code with your other device to connect
          </p>
        </div>
      </div>
    </div>
  )
}
