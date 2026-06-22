'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { CalEvent, CalSettings } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}

interface Props {
  currentDate: Date
  events: CalEvent[]
  settings: CalSettings
  onAddEvent: (date: string, time: string, endTime?: string) => void
  onShowPopup: (id: string, x: number, y: number) => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
  onMoveEvent: (id: string, newDate: string, newStartTime?: string) => void
  onResizeEventTime: (id: string, newStart: string, newEnd: string) => void
}

function getWeekStart(date: Date, startDay: 0 | 1): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = startDay === 1 ? (day === 0 ? -6 : 1 - day) : -day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function minsToTime(mins: number) {
  const h = Math.min(Math.floor(mins / 60), 23)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function toTimeLabel(mins: number, format: '12' | '24') {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (format === '12') {
    const s = h < 12 ? '오전' : '오후'
    return `${s} ${h % 12 || 12}:${String(m).padStart(2, '0')}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const HOUR_H = 64
const DAY_NAMES_SUN = ['일', '월', '화', '수', '목', '금', '토']
const DAY_NAMES_MON = ['월', '화', '수', '목', '금', '토', '일']

export default function WeekView({
  currentDate, events, settings, onAddEvent, onShowPopup, onEditEvent, onDeleteEvent, onMoveEvent, onResizeEventTime
}: Props) {
  const { dayStartHour, weekStartDay, timeFormat } = settings
  const [hoverInfo, setHoverInfo] = useState<{ colIdx: number; mins: number } | null>(null)
  const [dragCreate, setDragCreate] = useState<{ colIdx: number; dateStr: string; startMins: number; endMins: number } | null>(null)
  const [moveState, setMoveState] = useState<{ eventId: string; colIdx: number; startMins: number; endMins: number } | null>(null)
  const [resizeState, setResizeState] = useState<{ eventId: string; edge: 'top' | 'bottom'; startMins: number; endMins: number; colIdx: number } | null>(null)
  const colRefs = useRef<(HTMLDivElement | null)[]>([])
  const didMoveRef = useRef(false)
  // onUp 핸들러에서 항상 최신 state를 읽기 위한 ref
  const moveStateRef = useRef<typeof moveState>(null)
  const resizeStateRef = useRef<typeof resizeState>(null)
  useEffect(() => { moveStateRef.current = moveState }, [moveState])
  useEffect(() => { resizeStateRef.current = resizeState }, [resizeState])

  const weekStart = getWeekStart(currentDate, weekStartDay)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })
  const daysRef = useRef(days)
  useEffect(() => { daysRef.current = days })

  const DAY_NAMES = weekStartDay === 1 ? DAY_NAMES_MON : DAY_NAMES_SUN
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const today = fmt(new Date())

  const clientYToMins = useCallback((clientY: number, colIdx: number) => {
    const el = colRefs.current[colIdx]
    if (!el) return dayStartHour * 60
    const rect = el.getBoundingClientRect()
    const raw = dayStartHour * 60 + ((clientY - rect.top) / HOUR_H) * 60
    return Math.round(Math.max(raw, 0) / 30) * 30
  }, [dayStartHour])

  const getColIdx = useCallback((clientX: number) => {
    for (let i = 0; i < colRefs.current.length; i++) {
      const el = colRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right) return i
    }
    return -1
  }, [])

  const topForMins = (mins: number) => ((mins - dayStartHour * 60) / 60) * HOUR_H
  const topForTime = (t: string) => { const [h, m] = t.split(':').map(Number); return topForMins(h * 60 + m) }

  // 드래그 생성
  useEffect(() => {
    if (!dragCreate) return
    const onMove = (e: MouseEvent) => {
      const mins = clientYToMins(e.clientY, dragCreate.colIdx)
      setDragCreate(prev => prev ? { ...prev, endMins: Math.max(mins, prev.startMins + 30) } : null)
    }
    const onUp = () => {
      if (dragCreate && dragCreate.endMins > dragCreate.startMins)
        onAddEvent(dragCreate.dateStr, minsToTime(dragCreate.startMins), minsToTime(dragCreate.endMins))
      setDragCreate(null)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragCreate?.colIdx, dragCreate?.startMins, clientYToMins, onAddEvent])

  // 이벤트 이동 (이벤트 상단이 커서를 따라가도록)
  useEffect(() => {
    if (!moveState) return
    const dur = moveState.endMins - moveState.startMins
    const onMove = (e: MouseEvent) => {
      didMoveRef.current = true
      const colIdx = getColIdx(e.clientX)
      const activeCol = colIdx >= 0 ? colIdx : moveState.colIdx
      const mins = clientYToMins(e.clientY, activeCol)
      const newStart = Math.max(0, mins)
      setMoveState(prev => prev ? { ...prev, colIdx: activeCol, startMins: newStart, endMins: newStart + dur } : null)
    }
    const onUp = () => {
      const cur = moveStateRef.current
      if (cur && didMoveRef.current) {
        const newDate = fmt(daysRef.current[cur.colIdx])
        onMoveEvent(cur.eventId, newDate, minsToTime(cur.startMins))
      }
      setMoveState(null)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [moveState?.eventId, clientYToMins, getColIdx, onMoveEvent])

  // 이벤트 리사이즈
  useEffect(() => {
    if (!resizeState) return
    const onMove = (e: MouseEvent) => {
      const mins = clientYToMins(e.clientY, resizeState.colIdx)
      setResizeState(prev => {
        if (!prev) return null
        if (prev.edge === 'bottom') return { ...prev, endMins: Math.max(mins, prev.startMins + 30) }
        return { ...prev, startMins: Math.min(mins, prev.endMins - 30) }
      })
    }
    const onUp = () => {
      const cur = resizeStateRef.current
      if (cur)
        onResizeEventTime(cur.eventId, minsToTime(cur.startMins), minsToTime(cur.endMins))
      setResizeState(null)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [resizeState?.eventId, resizeState?.edge, clientYToMins, onResizeEventTime])

  const isDragging = !!(dragCreate || moveState || resizeState)

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      {/* Sticky day headers — 헤더를 스크롤 컨테이너 안에 넣어 열 너비가 항상 일치하도록 */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900">
        <div className="grid border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
          <div className="border-r border-gray-200 dark:border-gray-700" />
          {days.map((d, i) => {
            const dateStr = fmt(d)
            const isToday = dateStr === today
            const dow = d.getDay()
            const isSun = dow === 0; const isSat = dow === 6
            return (
              <div key={i} className="py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 group/header">
                <div className={`text-xs font-medium mb-1 ${isSun ? 'text-red-500 dark:text-yellow-400' : isSat ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {DAY_NAMES[i]}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className={`text-xl font-semibold w-10 h-10 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : isSun ? 'text-red-500 dark:text-yellow-400' : isSat ? 'text-blue-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {d.getDate()}
                  </div>
                  <button
                    onClick={() => onAddEvent(dateStr, `${String(dayStartHour).padStart(2,'0')}:00`)}
                    className="opacity-0 group-hover/header:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-bold transition-opacity"
                    title="일정 추가"
                  >+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Time grid */}
      <div>
        <div className="relative" style={{ height: `${24 * HOUR_H}px` }}>
          {hours.map(h => (
            <div key={h} className="absolute w-full border-t border-gray-200 dark:border-gray-700 pointer-events-none"
              style={{ top: `${(h - dayStartHour) * HOUR_H}px` }}>
              <span className="absolute -top-2.5 left-0 w-14 text-right pr-2 text-xs text-gray-400 dark:text-gray-500 select-none">
                {h === dayStartHour ? '' : toTimeLabel(h * 60, timeFormat)}
              </span>
            </div>
          ))}
          {hours.map(h => (
            <div key={`h${h}`} className="absolute border-t border-gray-100 dark:border-gray-800 pointer-events-none"
              style={{ top: `${(h - dayStartHour) * HOUR_H + HOUR_H / 2}px`, left: '56px', right: 0 }} />
          ))}

          <div className="absolute inset-0" style={{ left: '56px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day, di) => {
              const dateStr = fmt(day)
              const dayEvents = events.filter(e => shouldShowOnDate(e, dateStr) && e.startTime)
              const showHover = !isDragging && hoverInfo?.colIdx === di

              return (
                <div
                  key={di}
                  ref={el => { colRefs.current[di] = el }}
                  className="relative border-r border-gray-200 dark:border-gray-700 last:border-r-0 select-none"
                  style={{ cursor: moveState ? 'grabbing' : resizeState ? 'ns-resize' : 'crosshair' }}
                  onMouseMove={e => {
                    if (isDragging) return
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const mins = Math.round((dayStartHour * 60 + ((e.clientY - rect.top) / HOUR_H) * 60) / 30) * 30
                    setHoverInfo({ colIdx: di, mins })
                  }}
                  onMouseLeave={() => { if (!isDragging) setHoverInfo(null) }}
                  onMouseDown={e => {
                    if ((e.target as HTMLElement).closest('[data-event]')) return
                    e.preventDefault()
                    const mins = clientYToMins(e.clientY, di)
                    setDragCreate({ colIdx: di, dateStr, startMins: mins, endMins: mins + 60 })
                    setHoverInfo(null)
                  }}
                >
                  {/* 호버 가이드라인 */}
                  {showHover && hoverInfo && (
                    <>
                      <div className="absolute left-0 right-0 border-t-2 border-blue-400 pointer-events-none z-20"
                        style={{ top: `${topForMins(hoverInfo.mins)}px` }} />
                      {di === 0 && (
                        <div className="absolute right-full mr-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none z-20 whitespace-nowrap"
                          style={{ top: `${topForMins(hoverInfo.mins) - 10}px` }}>
                          {toTimeLabel(hoverInfo.mins, timeFormat)}
                        </div>
                      )}
                    </>
                  )}

                  {/* 드래그 생성 초록 프리뷰 */}
                  {dragCreate?.colIdx === di && (
                    <div className="absolute left-0.5 right-0.5 bg-green-400/60 border-2 border-green-500 rounded-lg pointer-events-none z-30"
                      style={{
                        top: `${topForMins(dragCreate.startMins)}px`,
                        height: `${Math.max((dragCreate.endMins - dragCreate.startMins) / 60 * HOUR_H, HOUR_H / 2)}px`,
                      }}>
                      <div className="text-xs text-green-900 font-bold px-2 py-1 select-none">
                        {minsToTime(dragCreate.startMins)} – {minsToTime(dragCreate.endMins)}
                      </div>
                    </div>
                  )}

                  {/* 이벤트 블록 */}
                  {dayEvents.map(ev => {
                    const [sh, sm] = (ev.startTime ?? '08:00').split(':').map(Number)
                    const endStr = ev.endTime ?? `${String(Math.min(sh + 1, 23)).padStart(2, '0')}:${String(sm).padStart(2, '0')}`
                    const [eh, em] = endStr.split(':').map(Number)
                    const origStart = sh * 60 + sm
                    const origEnd = eh * 60 + em

                    const isMoving = moveState?.eventId === ev.id
                    const isResizing = resizeState?.eventId === ev.id

                    // 다른 컬럼으로 이동 중이면 원래 컬럼에서 숨김
                    if (isMoving && moveState!.colIdx !== di) return null

                    const displayStart = isResizing ? resizeState!.startMins : isMoving ? moveState!.startMins : origStart
                    const displayEnd = isResizing ? resizeState!.endMins : isMoving ? moveState!.endMins : origEnd
                    const top = topForMins(displayStart)
                    const height = Math.max((displayEnd - displayStart) / 60 * HOUR_H, 24)

                    return (
                      <div
                        key={ev.id}
                        data-event="true"
                        className={`absolute left-0.5 right-0.5 ${COLOR_MAP[ev.color] ?? 'bg-blue-500'} text-white text-xs rounded overflow-hidden z-10 shadow-sm
                          ${isMoving ? 'opacity-60 cursor-grabbing' : 'cursor-grab hover:brightness-90'}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onMouseDown={e => {
                          if ((e.target as HTMLElement).dataset.handle) return
                          e.stopPropagation(); e.preventDefault()
                          didMoveRef.current = false
                          setMoveState({ eventId: ev.id, colIdx: di, startMins: origStart, endMins: origEnd })
                        }}
                        onClick={e => { e.stopPropagation(); if (!didMoveRef.current) onShowPopup(ev.id, e.clientX, e.clientY) }}
                        onContextMenu={e => { e.stopPropagation(); e.preventDefault(); onEditEvent(ev.id) }}
                      >
                        {/* 상단 리사이즈 핸들 */}
                        <div data-handle="top"
                          className="absolute top-0 left-0 right-0 h-2 cursor-n-resize hover:bg-white/30 z-20"
                          onMouseDown={e => {
                            e.stopPropagation(); e.preventDefault()
                            setResizeState({ eventId: ev.id, edge: 'top', startMins: origStart, endMins: origEnd, colIdx: di })
                          }} />
                        {/* 콘텐츠 */}
                        <div className="px-1.5 py-1 pointer-events-none">
                          <div className="font-semibold truncate">{ev.title}</div>
                          {height > 36 && <div className="opacity-80 text-[10px]">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</div>}
                        </div>
                        {/* 하단 리사이즈 핸들 */}
                        <div data-handle="bottom"
                          className="absolute bottom-0 left-0 right-0 h-3 cursor-s-resize hover:bg-white/20 z-20 flex items-center justify-center"
                          onMouseDown={e => {
                            e.stopPropagation(); e.preventDefault()
                            setResizeState({ eventId: ev.id, edge: 'bottom', startMins: origStart, endMins: origEnd, colIdx: di })
                          }}>
                          <div className="w-6 h-0.5 rounded-full bg-white/70 pointer-events-none" />
                        </div>
                      </div>
                    )
                  })}

                  {/* 다른 날에서 이동 중인 이벤트의 고스트 */}
                  {moveState && moveState.colIdx === di && (() => {
                    const ev = events.find(e => e.id === moveState.eventId)
                    if (!ev || dayEvents.some(e => e.id === ev.id)) return null
                    const ghostTop = topForMins(moveState.startMins)
                    const ghostH = Math.max((moveState.endMins - moveState.startMins) / 60 * HOUR_H, 24)
                    return (
                      <div
                        className={`absolute left-0.5 right-0.5 ${COLOR_MAP[ev.color] ?? 'bg-blue-500'} text-white text-xs rounded overflow-hidden opacity-70 pointer-events-none z-20 shadow-md`}
                        style={{ top: `${ghostTop}px`, height: `${ghostH}px` }}>
                        <div className="px-1.5 py-1 font-semibold truncate">{ev.title}</div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
