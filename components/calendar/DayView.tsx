'use client'

import { useState } from 'react'
import { CalEvent, Todo, CalSettings } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

const HOUR_HEIGHT = 64

interface Props {
  currentDate: Date
  events: CalEvent[]
  todos: Todo[]
  settings: CalSettings
  onAddEvent: (date: string, time: string) => void
  onShowPopup: (id: string, x: number, y: number) => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
  onMoveEvent: (id: string, newDate: string, newStartTime?: string) => void
  onAddTodo: (todo: { title: string; date: string }) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toTimeLabel(minutes: number, format: '12' | '24') {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (format === '12') {
    const suffix = h < 12 ? '오전' : '오후'
    const h12 = h % 12 || 12
    return `${suffix} ${h12}:${String(m).padStart(2, '0')}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function DayView({
  currentDate, events, todos, settings,
  onAddEvent, onShowPopup, onEditEvent, onDeleteEvent, onMoveEvent, onAddTodo, onToggleTodo, onDeleteTodo,
}: Props) {
  const [input, setInput] = useState('')
  const [hoverMinutes, setHoverMinutes] = useState<number | null>(null)
  const { dayStartHour, timeFormat } = settings

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dateStr = fmt(currentDate)
  const dayEvents = events.filter(e => shouldShowOnDate(e, dateStr) && e.startTime)
  const dayTodos = todos.filter(t => t.date === dateStr)

  const yToMinutes = (y: number) => {
    const raw = (y / HOUR_HEIGHT) * 60 + dayStartHour * 60
    return Math.round(raw / 30) * 30
  }

  const topForTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return ((h - dayStartHour) * 60 + m) / 60 * HOUR_HEIGHT
  }

  const handleAdd = () => {
    if (!input.trim()) return
    onAddTodo({ title: input.trim(), date: dateStr })
    setInput('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('eventId')
    if (!id) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const minutes = yToMinutes(y)
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    onMoveEvent(id, dateStr, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  return (
    <div className="h-full flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Time grid */}
      <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {hours.map(h => (
            <div key={h} className="absolute w-full border-t border-gray-200 dark:border-gray-700 pointer-events-none"
              style={{ top: `${(h - dayStartHour) * HOUR_HEIGHT}px` }}>
              <span className="absolute -top-2.5 left-0 w-14 text-right pr-2 text-xs text-gray-400 dark:text-gray-500 select-none">
                {h === dayStartHour ? '' : toTimeLabel(h * 60, timeFormat)}
              </span>
            </div>
          ))}
          {hours.map(h => (
            <div key={`${h}-half`} className="absolute border-t border-gray-100 dark:border-gray-800 pointer-events-none"
              style={{ top: `${(h - dayStartHour) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`, left: '56px', right: 0 }} />
          ))}

          {/* Hover guide */}
          {hoverMinutes !== null && (
            <>
              <div className="absolute left-14 right-0 border-t-2 border-blue-500 pointer-events-none z-20"
                style={{ top: `${(hoverMinutes - dayStartHour * 60) / 60 * HOUR_HEIGHT}px` }} />
              <div className="absolute left-0 w-14 text-right pr-2 pointer-events-none z-20"
                style={{ top: `${(hoverMinutes - dayStartHour * 60) / 60 * HOUR_HEIGHT - 9}px` }}>
                <span className="text-[10px] bg-blue-500 text-white px-1 rounded">
                  {toTimeLabel(hoverMinutes, timeFormat)}
                </span>
              </div>
            </>
          )}

          {/* Click / drop area */}
          <div
            className="absolute cursor-pointer"
            style={{ left: '56px', right: 0, top: 0, bottom: 0 }}
            onMouseMove={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setHoverMinutes(yToMinutes(e.clientY - rect.top))
            }}
            onMouseLeave={() => setHoverMinutes(null)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={e => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const minutes = yToMinutes(e.clientY - rect.top)
              const h = Math.floor(minutes / 60)
              const m = minutes % 60
              onAddEvent(dateStr, `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
            }}
          >
            {dayEvents.map(ev => {
              const [sh, sm] = (ev.startTime ?? '08:00').split(':').map(Number)
              const endStr = ev.endTime ?? `${String(Math.min(sh + 1, 23)).padStart(2, '0')}:${String(sm).padStart(2, '0')}`
              const [eh, em] = endStr.split(':').map(Number)
              const top = topForTime(ev.startTime ?? '08:00')
              const height = Math.max(((eh * 60 + em) - (sh * 60 + sm)) / 60 * HOUR_HEIGHT, 28)

              return (
                <div
                  key={ev.id}
                  draggable
                  onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData('eventId', ev.id) }}
                  className={`absolute left-1 right-4 ${COLOR_MAP[ev.color] ?? 'bg-blue-500'} text-white rounded-lg px-3 py-1.5 overflow-hidden cursor-grab active:cursor-grabbing z-10 hover:brightness-90 shadow-sm`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={e => { e.stopPropagation(); onShowPopup(ev.id, e.clientX, e.clientY) }}
                  onContextMenu={e => { e.stopPropagation(); e.preventDefault(); onEditEvent(ev.id) }}
                >
                  <div className="font-semibold text-sm truncate">{ev.title}</div>
                  {height > 36 && <div className="text-xs opacity-80">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</div>}
                  {ev.memo && height > 52 && <div className="text-xs opacity-70 truncate">{ev.memo}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Todo panel */}
      <div className="w-72 flex flex-col bg-gray-50 dark:bg-gray-800 shrink-0">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">할 일 목록</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          </p>
        </div>

        <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="새 할 일 추가..."
              className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shrink-0">추가</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {dayTodos.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">할 일이 없어요 ✓</p>
          ) : dayTodos.map(todo => (
            <div key={todo.id} className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-blue-200 dark:hover:border-blue-700">
              <input type="checkbox" checked={todo.done} onChange={() => onToggleTodo(todo.id)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600 shrink-0" />
              <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{todo.title}</span>
              <button onClick={() => onDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-lg leading-none shrink-0">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
