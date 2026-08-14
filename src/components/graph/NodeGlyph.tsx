import type { NodeType } from '@/types'

const base = { fill: 'none', stroke: 'currentColor' } as const

/** Compact geometric glyph per node type — drawn inside a 16x16 box. */
export function NodeGlyph({ type }: { type: NodeType }) {
  switch (type) {
    case 'entry':
      return (
        <g {...base} strokeWidth={1.4}>
          <path d="M3 14 L3 4 L6 4 L6 6 L13 6 L13 14 Z" />
          <path d="M6 14 L6 10 L13 10 L13 14" />
        </g>
      )
    case 'target':
      return (
        <g {...base} strokeWidth={1.4}>
          <circle cx="8" cy="8" r="4.5" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8" />
        </g>
      )
    case 'server':
      return (
        <g {...base} strokeWidth={1.4}>
          <rect x="3" y="3" width="10" height="3.5" rx="0.8" />
          <rect x="3" y="9.5" width="10" height="3.5" rx="0.8" />
          <path d="M5.5 4.7 h.5 M5.5 11.2 h.5" strokeWidth={1.8} />
        </g>
      )
    case 'router':
      return (
        <g {...base} strokeWidth={1.4}>
          <path d="M8 2 L13 8 L8 14 L3 8 Z" />
          <circle cx="8" cy="8" r="2.2" fill="currentColor" stroke="none" />
        </g>
      )
    case 'security':
      return (
        <g {...base} strokeWidth={1.4}>
          <path d="M8 2 L13 4.5 L13 8 C13 11.5 10.8 13.8 8 14.8 C5.2 13.8 3 11.5 3 8 L3 4.5 Z" />
          <path d="M6.5 8.5 L7.6 9.6 L9.7 6.8" />
        </g>
      )
    case 'datacenter':
      return (
        <g {...base} strokeWidth={1.4}>
          <rect x="4" y="2.5" width="8" height="3" rx="0.6" />
          <rect x="2.5" y="6.5" width="11" height="3" rx="0.6" />
          <rect x="4" y="10.5" width="8" height="3" rx="0.6" />
          <path d="M6.2 4 h.5 M6.2 8 h.5 M6.2 12 h.5" strokeWidth={1.6} />
        </g>
      )
    default:
      // workstation — a terminal screen
      return (
        <g {...base} strokeWidth={1.4}>
          <rect x="2.5" y="3" width="11" height="7.5" rx="0.8" />
          <path d="M3.5 5 L6.5 6.75 L3.5 8.5" />
          <path d="M8 9.2 L12.5 9.2" />
          <path d="M6.5 12.5 h3 M8 10.5 L8 12.5" />
        </g>
      )
  }
}