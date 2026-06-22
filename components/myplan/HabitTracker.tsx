'use client'

import { useState, useEffect, useRef } from 'react'

interface Habit {
  id: string
  name: string
  color: string
}

type CheckMap = Record<string, Record<string, boolean>>

const COLORS = [
  { value: 'blue',   bg: 'bg-blue-500',   light: 'bg-blue-100 dark:bg-blue-900/60',   text: 'text-blue-600 dark:text-blue-400' },
  { value: 'green',  bg: 'bg-green-500',  light: 'bg-green-100 dark:bg-green-900/60', text: 'text-green-600 dark:text-green-400' },
  { value: 'red',    bg: 'bg-red-500',    light: 'bg-red-100 dark:bg-red-900/60',     text: 'text-red-600 dark:text-red-400' },
  { value: 'yellow', bg: 'bg-yellow-400', light: 'bg-yellow-100 dark:bg-yellow-900/60', text: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'purple', bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/60', text: 'text-purple-600 dark:text-purple-400' },
  { value: 'orange', bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/60', text: 'text-orange-600 dark:text-orange-400' },
]
const COLOR_BG   = Object.fromEntries(COLORS.map(c => [c.value, c.bg]))
const COLOR_LIGHT = Object.fromEntries(COLORS.map(c => [c.value, c.light]))
const COLOR_TEXT  = Object.fromEntries(COLORS.map(c => [c.value, c.text]))

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}

export default function HabitTracker() {
  const [habits,  setHabits]  = useState<Habit[]>(() => loadLS('habit_habits', []))
  const [checks,  setChecks]  = useState<CheckMap>(() => loadLS('habit_checks', {}))
  const [viewDate, setViewDate] = useState(new Date())
  const [newName,  setNewName]  = useState('')
  const [newColor, setNewColor] = useState('blue')
  const [showAdd,  setShowAdd]  = useState(false)
  const [delConfirm, setDelConfirm] = useState<string | null>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  useEffect(() => { initialized.current = true }, [])
  useEffect(() => { if (initialized.current) localStorage.setItem('habit_habits', JSON.stringify(habits)) }, [habits])
  useEffect(() => { if (initialized.current) localStorage.setItem('habit_checks', JSON.stringify(checks)) }, [checks])
  useEffect(() => { if (showAdd) inputRef.current?.focus() }, [showAdd])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i+1)
    return { num: i+1, str: fmt(d), dow: d.getDay() }
  })
  const today = fmt(new Date())

  const toggle = (hId: string, dateStr: string) =>
    setChecks(prev => ({ ...prev, [hId]: { ...(prev[hId]??{}), [dateStr]: !prev[hId]?.[dateStr] } }))

  const addHabit = () => {
    if (!newName.trim()) return
    setHabits(prev => [...prev, { id: Date.now().toString(), name: newName.trim(), color: newColor }])
    setNewName('')
    setShowAdd(false)
  }

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setChecks(prev => { const n = { ...prev }; delete n[id]; return n })
    setDelConfirm(null)
  }

  const getStats = (habit: Habit) => {
    const hc = checks[habit.id] ?? {}
    const past = days.map(d => d.str).filter(d => d <= today)
    const checked = past.filter(d => hc[d]).length
    const rate = past.length > 0 ? Math.round((checked / past.length) * 100) : 0
    let streak = 0
    for (let i = past.length-1; i >= 0; i--) { if (hc[past[i]]) streak++; else break }
    return { checked, rate, streak, total: past.length }
  }

  const DOW = ['일','월','화','수','목','금','토']

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* 내부 헤더 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1">습관 관리</span>
        <button onClick={() => setViewDate(new Date())}
          className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
          이번 달
        </button>
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth()-1); setViewDate(d) }}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">‹</button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-20 text-center">{year}년 {month+1}월</span>
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth()+1); setViewDate(d) }}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">›</button>
      </div>

      <div className="px-6 py-5">
        {/* 습관 추가 */}
        <div className="mb-5">
          {showAdd ? (
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 shadow-sm">
              <input ref={inputRef} type="text" value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') addHabit(); if (e.key==='Escape') { setShowAdd(false); setNewName('') } }}
                placeholder="습관 이름" className="bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none w-32" />
              <div className="flex gap-1">
                {COLORS.map(c => (
                  <button key={c.value} onClick={() => setNewColor(c.value)}
                    className={`w-5 h-5 rounded-full ${c.bg} transition-all hover:scale-110 ${newColor===c.value ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`} />
                ))}
              </div>
              <button onClick={addHabit} className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">추가</button>
              <button onClick={() => { setShowAdd(false); setNewName('') }} className="text-gray-400 hover:text-gray-600 text-xs px-1">취소</button>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm">
              + 습관 추가
            </button>
          )}
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-base font-medium">아직 습관이 없어요</p>
            <p className="text-sm mt-1">위 버튼을 눌러 첫 번째 습관을 추가해보세요</p>
          </div>
        ) : (
          <>
            {/* 그리드 */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm mb-6">
              <table className="border-collapse" style={{ minWidth: `${180 + daysInMonth*36}px` }}>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-44">습관</th>
                    {days.map(d => (
                      <th key={d.str} className={`border-b border-gray-100 dark:border-gray-700 w-9 px-0 py-2 text-center ${d.str===today?'bg-blue-50 dark:bg-blue-900/30':''}`}>
                        <div className={`text-[10px] font-medium mb-0.5 ${d.dow===0?'text-red-400':d.dow===6?'text-blue-400':'text-gray-400 dark:text-gray-500'}`}>{DOW[d.dow]}</div>
                        <div className={`text-xs font-semibold mx-auto w-6 h-6 flex items-center justify-center rounded-full ${d.str===today?'bg-blue-600 text-white':'text-gray-700 dark:text-gray-300'}`}>{d.num}</div>
                      </th>
                    ))}
                    <th className="border-b border-l border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">달성률</th>
                    <th className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">연속일</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, hi) => {
                    const stats = getStats(habit)
                    return (
                      <tr key={habit.id} className={`group ${hi%2===1?'bg-gray-50/50 dark:bg-gray-800/50':''}`}>
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-4 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${COLOR_BG[habit.color]??'bg-blue-500'}`} />
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{habit.name}</span>
                            </div>
                            {delConfirm === habit.id ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => deleteHabit(habit.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">삭제</button>
                                <button onClick={() => setDelConfirm(null)} className="text-xs text-gray-400 hover:text-gray-600">취소</button>
                              </div>
                            ) : (
                              <button onClick={() => setDelConfirm(habit.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-xs shrink-0 transition-opacity">✕</button>
                            )}
                          </div>
                        </td>
                        {days.map(d => {
                          const checked = checks[habit.id]?.[d.str] ?? false
                          const isFuture = d.str > today
                          return (
                            <td key={d.str} className={`p-0 text-center ${d.str===today?'bg-blue-50/40 dark:bg-blue-900/10':''}`}>
                              <button disabled={isFuture} onClick={() => toggle(habit.id, d.str)}
                                className={`w-9 h-9 flex items-center justify-center mx-auto transition-all
                                  ${checked ? `${COLOR_LIGHT[habit.color]??'bg-blue-100'} hover:opacity-80`
                                    : isFuture ? 'cursor-default'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'}`}>
                                {checked && (
                                  <div className={`w-5 h-5 rounded-md ${COLOR_BG[habit.color]??'bg-blue-500'} flex items-center justify-center`}>
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </button>
                            </td>
                          )
                        })}
                        <td className="border-l border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                          <div className={`text-sm font-bold ${COLOR_TEXT[habit.color]??'text-blue-600'}`}>{stats.rate}%</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{stats.checked}/{stats.total}일</div>
                          <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-16 mx-auto">
                            <div className={`h-full ${COLOR_BG[habit.color]??'bg-blue-500'} rounded-full transition-all`} style={{ width: `${stats.rate}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`text-sm font-bold ${stats.streak>0?COLOR_TEXT[habit.color]??'text-blue-600':'text-gray-300 dark:text-gray-600'}`}>
                            {stats.streak > 0 ? `🔥 ${stats.streak}` : '—'}
                          </span>
                          {stats.streak > 0 && <div className="text-[10px] text-gray-400 mt-0.5">일 연속</div>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {habits.map(habit => {
                const stats = getStats(habit)
                return (
                  <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${COLOR_BG[habit.color]??'bg-blue-500'}`} />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{habit.name}</span>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <span className={`text-2xl font-bold ${COLOR_TEXT[habit.color]??'text-blue-600'}`}>{stats.rate}%</span>
                      {stats.streak > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">🔥 {stats.streak}일</span>}
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${COLOR_BG[habit.color]??'bg-blue-500'} rounded-full transition-all`} style={{ width: `${stats.rate}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{stats.checked}일 완료 / {stats.total}일 기준</p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
