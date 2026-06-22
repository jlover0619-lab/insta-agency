'use client'

import { useState, useEffect } from 'react'
import { CalEvent } from '@/app/calendar/types'
import { shouldShowOnDate } from '@/app/calendar/eventUtils'

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}
const COLOR_LIGHT: Record<string, string> = {
  blue: 'bg-blue-200', red: 'bg-red-200', green: 'bg-green-200',
  yellow: 'bg-yellow-200', purple: 'bg-purple-200', orange: 'bg-orange-200',
}

interface Props {
  currentDate: Date
  events: CalEvent[]
  onDayClick: (date: string) => void
  onAddEvent: (date: string) => void
  onShowPopup: (id: string, x: number, y: number) => void
  onEditEvent: (id: string) => void
  onDeleteEvent: (id: string) => void
  onMoveEvent: (id: string, newDate: string) => void
  onResizeEvent: (id: string, newEndDate: string) => void
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 멀티데이 이벤트 슬롯 배치 (겹치지 않도록)
function assignSlots(items: { startCol: number; endCol: number }[]): number[] {
  const slots: number[] = []
  for (let i = 0; i < items.length; i++) {
    let slot = 0
    while (slots.some((s, j) => s === slot && items[j].endCol >= items[i].startCol && items[j].startCol <= items[i].endCol)) {
      slot++
    }
    slots.push(slot)
  }
  return slots
}

const MULTIDAY_BAR_H = 22  // px per multi-day slot
const DATE_ROW_H = 32       // p-1(4px 상단 패딩) + 날짜 숫자 행(28px)

export default function MonthView({ currentDate, events, onDayClick, onAddEvent, onShowPopup, onEditEvent, onDeleteEvent, onMoveEvent, onResizeEvent }: Props) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const [resizeState, setResizeState] = useState<{ id: string; endDate: string } | null>(null)

  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { date: Date; current: boolean }[] = []
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true })
  while (cells.length < 42)
    cells.push({ date: new Date(year, month + 1, cells.length - firstDow - daysInMonth + 1), current: false })

  const rows = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  const today = fmt(new Date())

  useEffect(() => {
    if (!resizeState) return
    const onUp = () => { onResizeEvent(resizeState.id, resizeState.endDate); setResizeState(null) }
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [resizeState])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('eventId')
    if (id) onMoveEvent(id, dateStr)
  }

  return (
    <div className="h-full flex flex-col select-none">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 shrink-0">
        {DAY_NAMES.map((name, i) => (
          <div key={name} className={`py-2 text-center text-sm font-medium
            ${i === 0 ? 'text-red-500 dark:text-yellow-400' : i === 6 ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {name}
          </div>
        ))}
      </div>

      {/* 6개 주 행 */}
      <div className="flex-1 flex flex-col min-h-0">
        {rows.map((weekCells, wi) => {
          const rowStart = fmt(weekCells[0].date)
          const rowEnd = fmt(weekCells[6].date)

          // 이 행에 걸쳐 있는 멀티데이 이벤트
          const multiDayItems = events
            .filter(ev => ev.endDate && ev.endDate > ev.date && ev.date <= rowEnd && ev.endDate >= rowStart)
            .map(ev => {
              const startCol = ev.date < rowStart
                ? 0
                : weekCells.findIndex(c => fmt(c.date) === ev.date)
              const endCol = ev.endDate! > rowEnd
                ? 6
                : weekCells.findIndex(c => fmt(c.date) === ev.endDate)
              return {
                ev,
                startCol: Math.max(startCol, 0),
                endCol: endCol < 0 ? 6 : endCol,
              }
            })

          const slots = assignSlots(multiDayItems)

          return (
            <div key={wi} className="flex-1 relative min-h-0 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {/* 날짜 셀 격자 */}
              <div className="grid grid-cols-7 h-full">
                {weekCells.map((cell, di) => {
                  const dateStr = fmt(cell.date)
                  const dow = cell.date.getDay()
                  const isToday = dateStr === today
                  const isCurrent = cell.current

                  // 단일 날짜 이벤트만 (멀티데이 제외)
                  const singleEvs = events.filter(e =>
                    shouldShowOnDate(e, dateStr) && !(e.endDate && e.endDate > e.date)
                  )

                  // 이 셀 위에 걸쳐있는 바들만 계산 → 셀별 스페이서
                  const barsOverCell = multiDayItems.filter(({ startCol, endCol }) => di >= startCol && di <= endCol)
                  const cellMaxSlot = barsOverCell.length > 0
                    ? Math.max(...barsOverCell.map(item => slots[multiDayItems.indexOf(item)])) + 1
                    : 0
                  const cellSpacerH = cellMaxSlot * MULTIDAY_BAR_H

                  return (
                    <div
                      key={di}
                      className={`border-r border-gray-200 dark:border-gray-700 last:border-r-0 p-1 overflow-hidden flex flex-col group
                        ${!isCurrent ? 'bg-gray-50/60 dark:bg-gray-800/40' : 'bg-white dark:bg-gray-900'}
                        ${resizeState ? 'cursor-col-resize' : 'cursor-pointer'}
                        hover:bg-blue-50/30 dark:hover:bg-blue-900/10`}
                      onClick={() => { if (!resizeState) onDayClick(dateStr) }}
                      onMouseEnter={() => {
                        if (!resizeState) return
                        const ev = events.find(e => e.id === resizeState.id)
                        if (ev && dateStr >= ev.date) setResizeState(prev => prev ? { ...prev, endDate: dateStr } : null)
                      }}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, dateStr)}
                    >
                      {/* 날짜 숫자 */}
                      <div className="flex items-center justify-between shrink-0" style={{ height: DATE_ROW_H - 4 }}>
                        <span className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium
                          ${isToday ? 'bg-blue-600 text-white' : !isCurrent ? 'text-gray-400 dark:text-gray-600'
                            : dow === 0 ? 'text-red-500 dark:text-yellow-400'
                            : dow === 6 ? 'text-blue-500'
                            : 'text-gray-800 dark:text-gray-200'}`}>
                          {cell.date.getDate()}
                        </span>
                        <button
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 text-xl leading-none pr-1"
                          onClick={e => { e.stopPropagation(); onAddEvent(dateStr) }}>+</button>
                      </div>

                      {/* 이 셀 위 바만큼 스페이서 (바 없는 셀은 0) */}
                      <div className="shrink-0" style={{ height: cellSpacerH }} />

                      {/* 단일 이벤트 */}
                      <div className="space-y-0.5 overflow-hidden flex-1 min-h-0">
                        {singleEvs.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData('eventId', ev.id) }}
                            className={`flex items-center text-white text-xs px-1.5 py-0.5 rounded truncate
                              ${COLOR_MAP[ev.color] ?? 'bg-blue-500'} cursor-grab active:cursor-grabbing`}
                            onClick={e => { e.stopPropagation(); onShowPopup(ev.id, e.clientX, e.clientY) }}
                            onContextMenu={e => { e.stopPropagation(); e.preventDefault(); onEditEvent(ev.id) }}
                          >
                            {ev.startTime && <span className="mr-1 opacity-80 shrink-0">{ev.startTime}</span>}
                            {ev.title}
                          </div>
                        ))}
                        {singleEvs.length > 3 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 pl-1">+{singleEvs.length - 3}개 더</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 멀티데이 이벤트 바 (절대 위치로 행 전체에 오버레이) */}
              {multiDayItems.map(({ ev, startCol, endCol }, i) => {
                const slot = slots[i]
                const isResizing = resizeState?.id === ev.id
                const colW = 100 / 7
                const isStart = ev.date >= rowStart
                const isEnd = ev.endDate! <= rowEnd

                return (
                  <div
                    key={ev.id}
                    draggable
                    onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData('eventId', ev.id) }}
                    className={`absolute flex items-center text-white text-xs font-medium px-2 overflow-hidden
                      ${isResizing ? COLOR_LIGHT[ev.color] ?? 'bg-blue-200' : COLOR_MAP[ev.color] ?? 'bg-blue-500'}
                      ${isStart ? 'rounded-l' : ''} ${isEnd ? 'rounded-r' : ''}
                      cursor-grab active:cursor-grabbing`}
                    style={{
                      top: DATE_ROW_H + slot * MULTIDAY_BAR_H + 1,
                      left: `calc(${startCol / 7 * 100}% + 1px)`,
                      width: `calc(${(endCol - startCol + 1) / 7 * 100}% - 2px)`,
                      height: MULTIDAY_BAR_H - 4,
                    }}
                    onClick={e => { e.stopPropagation(); onShowPopup(ev.id, e.clientX, e.clientY) }}
                    onContextMenu={e => { e.stopPropagation(); e.preventDefault(); onEditEvent(ev.id) }}
                  >
                    <span className="truncate">{ev.title}</span>

                    {/* 오른쪽 끝 리사이즈 핸들 */}
                    {isEnd && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-white/30 z-10"
                        onMouseDown={e => {
                          e.stopPropagation(); e.preventDefault()
                          setResizeState({ id: ev.id, endDate: ev.endDate ?? ev.date })
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
