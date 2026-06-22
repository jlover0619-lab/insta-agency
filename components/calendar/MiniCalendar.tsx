'use client'

import { useState, useEffect } from 'react'

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  currentDate: Date
  onSelectDate: (date: Date) => void
}

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default function MiniCalendar({ currentDate, onSelectDate }: Props) {
  const [viewDate, setViewDate] = useState(new Date(currentDate))

  // 현재 날짜가 바뀌면 뷰도 같이 이동
  useEffect(() => {
    setViewDate(new Date(currentDate))
  }, [currentDate.getFullYear(), currentDate.getMonth()])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = fmt(new Date())
  const selectedStr = fmt(currentDate)

  const prev = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })
  const next = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })

  return (
    <div className="px-3 py-4 select-none">
      {/* 월 탐색 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">‹</button>
        <button
          onClick={() => setViewDate(new Date())}
          className="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
        >
          {year}년 {month + 1}월
        </button>
        <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">›</button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className={`text-center text-[10px] font-medium py-0.5
            ${i === 0 ? 'text-red-500 dark:text-yellow-400' : i === 6 ? 'text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedStr
          const dow = (firstDow + day - 1) % 7

          return (
            <button
              key={i}
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`text-[11px] h-7 w-full flex items-center justify-center rounded-full transition-colors
                ${isToday
                  ? 'bg-blue-600 text-white font-bold'
                  : isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                  : dow === 0
                  ? 'text-red-500 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : dow === 6
                  ? 'text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
