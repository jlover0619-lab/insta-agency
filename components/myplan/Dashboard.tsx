'use client'

import { useMemo } from 'react'
import { CalEvent, CalSettings } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}
const COLOR_LIGHT: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/30', red: 'bg-red-50 dark:bg-red-900/30',
  green: 'bg-green-50 dark:bg-green-900/30', yellow: 'bg-yellow-50 dark:bg-yellow-900/30',
  purple: 'bg-purple-50 dark:bg-purple-900/30', orange: 'bg-orange-50 dark:bg-orange-900/30',
}
const COLOR_TEXT: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-400', red: 'text-red-600 dark:text-red-400',
  green: 'text-green-600 dark:text-green-400', yellow: 'text-yellow-600 dark:text-yellow-400',
  purple: 'text-purple-600 dark:text-purple-400', orange: 'text-orange-600 dark:text-orange-400',
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}

interface Props {
  events: CalEvent[]
  settings: CalSettings
  onGoCalendar: () => void
  onGoHabits: () => void
}

const DAY_KR = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function Dashboard({ events, settings, onGoCalendar, onGoHabits }: Props) {
  const now = new Date()
  const todayStr = fmt(now)
  const greeting = now.getHours() < 12 ? '좋은 아침이에요 ☀️' : now.getHours() < 18 ? '좋은 오후예요 😊' : '좋은 저녁이에요 🌙'

  const todayEvents = useMemo(() =>
    events
      .filter(e => shouldShowOnDate(e, todayStr))
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [events, todayStr]
  )

  const habitStats = useMemo(() => {
    const habits: Array<{ id: string; name: string; color: string }> = loadLS('habit_habits', [])
    const checks: Record<string, Record<string, boolean>> = loadLS('habit_checks', {})
    return habits.map(h => {
      const done = checks[h.id]?.[todayStr] ?? false
      return { ...h, done }
    })
  }, [todayStr])

  const doneCount = habitStats.filter(h => h.done).length
  const habitPct = habitStats.length > 0 ? Math.round((doneCount / habitStats.length) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* 인사 + 날짜 */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">{greeting}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {MONTH_KR[now.getMonth()]} {now.getDate()}일 {DAY_KR[now.getDay()]}
          </h1>
        </div>

        {/* 오늘의 일정 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">오늘 일정</h2>
            <button onClick={onGoCalendar} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              캘린더 보기 →
            </button>
          </div>

          {todayEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">오늘 일정이 없어요</p>
              <button onClick={onGoCalendar}
                className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                일정 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEvents.map(ev => (
                <div key={ev.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 ${COLOR_LIGHT[ev.color]??'bg-white dark:bg-gray-800'}`}>
                  <div className={`w-2 h-10 rounded-full shrink-0 ${COLOR_BG[ev.color]??'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${COLOR_TEXT[ev.color]??'text-blue-600'}`}>{ev.title}</p>
                    {ev.startTime && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                      </p>
                    )}
                    {ev.memo && <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{ev.memo}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 오늘의 습관 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">오늘 습관</h2>
            <button onClick={onGoHabits} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              습관 관리 →
            </button>
          </div>

          {habitStats.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">등록된 습관이 없어요</p>
              <button onClick={onGoHabits}
                className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                습관 추가하기
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* 달성률 바 */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">오늘 달성률</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{doneCount}/{habitStats.length}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${habitPct}%` }} />
                </div>
              </div>
              {/* 습관 목록 */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {habitStats.map(h => (
                  <div key={h.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0
                      ${h.done ? COLOR_BG[h.color]??'bg-blue-500' : 'border-2 border-gray-200 dark:border-gray-600'}`}>
                      {h.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${h.done ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {h.name}
                    </span>
                    {h.done && <span className="ml-auto text-xs text-gray-300 dark:text-gray-600">완료</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
