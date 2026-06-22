'use client'

import { useMemo, useState } from 'react'
import { CalEvent, CalSettings } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}
const COLOR_LIGHT: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/40', red: 'bg-red-100 dark:bg-red-900/40',
  green: 'bg-green-100 dark:bg-green-900/40', yellow: 'bg-yellow-100 dark:bg-yellow-900/40',
  purple: 'bg-purple-100 dark:bg-purple-900/40', orange: 'bg-orange-100 dark:bg-orange-900/40',
}
const COLOR_TEXT: Record<string, string> = {
  blue: 'text-blue-700 dark:text-blue-300', red: 'text-red-700 dark:text-red-300',
  green: 'text-green-700 dark:text-green-300', yellow: 'text-yellow-700 dark:text-yellow-300',
  purple: 'text-purple-700 dark:text-purple-300', orange: 'text-orange-700 dark:text-orange-300',
}

const DOW_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const COLORS = ['blue', 'red', 'green', 'yellow', 'purple', 'orange']

type Scope = 'month' | 'week' | 'day'

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function minsToLabel(mins: number): string {
  if (mins < 60) return `${mins}분`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

function getDatesInRange(scope: Scope, current: Date): string[] {
  const dates: string[] = []
  if (scope === 'day') {
    dates.push(fmt(current))
  } else if (scope === 'week') {
    const start = new Date(current)
    start.setDate(start.getDate() - start.getDay())
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      dates.push(fmt(d))
    }
  } else {
    const year = current.getFullYear()
    const month = current.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= days; d++) {
      dates.push(fmt(new Date(year, month, d)))
    }
  }
  return dates
}

interface Props {
  currentDate: Date
  events: CalEvent[]
  settings: CalSettings
}

export default function StatsView({ currentDate, events, settings }: Props) {
  const [scope, setScope] = useState<Scope>('month')
  const colorLabels = settings.colorLabels ?? {}

  const stats = useMemo(() => {
    const dates = getDatesInRange(scope, currentDate)
    const scopeEvents = events.filter(ev => dates.some(d => shouldShowOnDate(ev, d)))

    // 색상별 집계
    const byColor: Record<string, { count: number; totalMins: number }> = {}
    COLORS.forEach(c => { byColor[c] = { count: 0, totalMins: 0 } })

    // 시간대별 집계 (24h)
    const byHour: number[] = Array(24).fill(0)
    const byHourMins: number[] = Array(24).fill(0)

    // 요일별 집계
    const byDow: number[] = Array(7).fill(0)

    for (const ev of scopeEvents) {
      const c = ev.color in byColor ? ev.color : 'blue'
      byColor[c].count++

      if (ev.startTime && ev.endTime) {
        const [sh, sm] = ev.startTime.split(':').map(Number)
        const [eh, em] = ev.endTime.split(':').map(Number)
        const mins = Math.max((eh * 60 + em) - (sh * 60 + sm), 0)
        byColor[c].totalMins += mins
        byHour[sh]++
        byHourMins[sh] += mins
      }

      const d = new Date(ev.date)
      byDow[d.getDay()]++
    }

    const totalEvents = scopeEvents.length
    const totalMins = COLORS.reduce((s, c) => s + byColor[c].totalMins, 0)
    const peakHour = byHour.indexOf(Math.max(...byHour))
    const peakDow = byDow.indexOf(Math.max(...byDow))
    const maxHourCount = Math.max(...byHour, 1)
    const maxDowCount = Math.max(...byDow, 1)
    const maxColorCount = Math.max(...COLORS.map(c => byColor[c].count), 1)

    return { byColor, byHour, byHourMins, byDow, totalEvents, totalMins, peakHour, peakDow, maxHourCount, maxDowCount, maxColorCount }
  }, [events, scope, currentDate, settings])

  const scopeLabel = scope === 'month'
    ? `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`
    : scope === 'week' ? '이번 주' : `${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">📊 통계</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{scopeLabel}</p>
          </div>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
            {(['month', 'week', 'day'] as Scope[]).map(s => (
              <button key={s} onClick={() => setScope(s)}
                className={`px-4 py-2 transition-colors ${scope === s ? 'bg-blue-600 text-white font-medium' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {s === 'month' ? '이달' : s === 'week' ? '이주' : '오늘'}
              </button>
            ))}
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '총 일정', value: `${stats.totalEvents}개`, icon: '📅' },
            { label: '총 일정 시간', value: stats.totalMins > 0 ? minsToLabel(stats.totalMins) : '—', icon: '⏱️' },
            { label: '피크 시간대', value: stats.totalEvents > 0 ? `${stats.peakHour}:00 – ${stats.peakHour + 1}:00` : '—', icon: '🔥' },
          ].map(card => (
            <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{card.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* 색상 카테고리별 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">카테고리별 일정</h3>
          {stats.totalEvents === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">이 기간에 일정이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {COLORS
                .filter(c => stats.byColor[c].count > 0)
                .sort((a, b) => stats.byColor[b].count - stats.byColor[a].count)
                .map(c => {
                  const { count, totalMins } = stats.byColor[c]
                  const pct = Math.round((count / stats.maxColorCount) * 100)
                  const label = colorLabels[c] || c
                  return (
                    <div key={c}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${COLOR_BG[c]}`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {count}개{totalMins > 0 ? ` · ${minsToLabel(totalMins)}` : ''}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${COLOR_BG[c]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* 시간대별 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">시간대별 분포</h3>
          <div className="flex items-end gap-1 h-28">
            {Array.from({ length: 24 }, (_, h) => {
              const count = stats.byHour[h]
              const pct = stats.maxHourCount > 0 ? (count / stats.maxHourCount) * 100 : 0
              const isPeak = h === stats.peakHour && stats.totalEvents > 0
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className={`w-full rounded-t transition-all ${isPeak ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800 group-hover:bg-blue-400'}`}
                    style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }} />
                  {count > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {h}시 {count}개
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            <span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>23시</span>
          </div>
        </div>

        {/* 요일별 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">요일별 분포</h3>
          <div className="grid grid-cols-7 gap-2">
            {DOW_LABELS.map((label, i) => {
              const count = stats.byDow[i]
              const pct = stats.maxDowCount > 0 ? (count / stats.maxDowCount) * 100 : 0
              const isPeak = i === stats.peakDow && stats.totalEvents > 0
              const isSun = i === 0
              const isSat = i === 6
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`text-xs font-medium ${isSun ? 'text-red-500 dark:text-yellow-400' : isSat ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {label}
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-24 flex items-end">
                    <div className={`w-full rounded-lg transition-all ${isPeak ? 'bg-blue-500' : 'bg-blue-200 dark:bg-blue-800'}`}
                      style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }} />
                  </div>
                  <div className={`text-sm font-bold ${isPeak ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 가장 바쁜 날 */}
        {scope === 'month' && (() => {
          const year = currentDate.getFullYear()
          const month = currentDate.getMonth()
          const days = new Date(year, month + 1, 0).getDate()
          const dayCount = Array.from({ length: days }, (_, i) => {
            const d = fmt(new Date(year, month, i + 1))
            return { date: d, day: i + 1, count: events.filter(ev => shouldShowOnDate(ev, d)).length }
          }).sort((a, b) => b.count - a.count).slice(0, 5).filter(d => d.count > 0)

          if (dayCount.length === 0) return null
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">이번 달 가장 바쁜 날 TOP 5</h3>
              <div className="space-y-2">
                {dayCount.map((d, rank) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-5 text-center ${rank === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {rank + 1}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 w-16">
                      {currentDate.getMonth() + 1}월 {d.day}일
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(d.count / dayCount[0].count) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 w-8 text-right">{d.count}개</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
