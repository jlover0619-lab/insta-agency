'use client'

import { useMemo } from 'react'
import { CalEvent, CalSettings } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekDates(date: Date, startDay: 0 | 1): string[] {
  const d = new Date(date)
  const dow = d.getDay()
  const diff = startDay === 1 ? (dow === 0 ? -6 : 1 - dow) : -dow
  d.setDate(d.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d); x.setDate(x.getDate() + i); return fmt(x)
  })
}

function minsToLabel(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
}

interface Props {
  events: CalEvent[]
  currentDate: Date
  settings: CalSettings
}

export default function SidebarStats({ events, currentDate, settings }: Props) {
  const stats = useMemo(() => {
    const dates = getWeekDates(currentDate, settings.weekStartDay)
    const byColor: Record<string, { mins: number; count: number }> = {}

    for (const ev of events) {
      for (const date of dates) {
        if (!shouldShowOnDate(ev, date)) continue
        const c = ev.color
        if (!byColor[c]) byColor[c] = { mins: 0, count: 0 }
        byColor[c].count++
        if (ev.startTime && ev.endTime) {
          const [sh, sm] = ev.startTime.split(':').map(Number)
          const [eh, em] = ev.endTime.split(':').map(Number)
          const m = (eh * 60 + em) - (sh * 60 + sm)
          if (m > 0) byColor[c].mins += m
        }
      }
    }

    return Object.entries(byColor).sort(([, a], [, b]) => b.mins - a.mins || b.count - a.count)
  }, [events, currentDate, settings.weekStartDay])

  const totalMins = stats.reduce((s, [, v]) => s + v.mins, 0)

  if (stats.length === 0) return null

  return (
    <div className="px-3 pt-3 pb-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        이번 주 투자 시간
      </p>
      <div className="space-y-2.5">
        {stats.map(([color, { mins, count }]) => {
          const label = settings.colorLabels?.[color] || color
          const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0
          return (
            <div key={color}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${COLOR_BG[color] ?? 'bg-blue-500'}`} />
                  <span className="text-[11px] text-gray-700 dark:text-gray-300 truncate">{label}</span>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0 ml-1">
                  {mins > 0 ? minsToLabel(mins) : `${count}건`}
                </span>
              </div>
              {mins > 0 && (
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${COLOR_BG[color] ?? 'bg-blue-500'} rounded-full transition-all`}
                    style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })}
        {totalMins > 0 && (
          <div className="pt-1 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
            <span>총</span>
            <span>{minsToLabel(totalMins)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
