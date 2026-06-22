'use client'

import { useEffect, useRef } from 'react'
import { CalEvent, CalSettings } from '@/app/calendar/types'

const COLOR_BG: Record<string, string> = {
  blue: 'bg-blue-500', red: 'bg-red-500', green: 'bg-green-500',
  yellow: 'bg-yellow-400', purple: 'bg-purple-500', orange: 'bg-orange-500',
}
const REPEAT_LABEL: Record<string, string> = {
  daily: '매일 반복', weekly: '매주 반복', monthly: '매월 반복', yearly: '매년 반복',
}
const COLORS = [
  { value: 'blue', cls: 'bg-blue-500' },
  { value: 'red', cls: 'bg-red-500' },
  { value: 'green', cls: 'bg-green-500' },
  { value: 'yellow', cls: 'bg-yellow-400' },
  { value: 'purple', cls: 'bg-purple-500' },
  { value: 'orange', cls: 'bg-orange-500' },
]

interface Props {
  event: CalEvent
  anchorX: number
  anchorY: number
  settings: CalSettings
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  onColorChange: (id: string, color: string) => void
}

export default function EventPopup({ event, anchorX, anchorY, settings, onEdit, onDelete, onClose, onColorChange }: Props) {
  const popupRef = useRef<HTMLDivElement>(null)

  // 화면 밖으로 나가지 않도록 위치 보정
  const W = 260
  const left = anchorX + W + 12 > window.innerWidth ? anchorX - W - 4 : anchorX + 8
  const top = Math.min(anchorY, window.innerHeight - 280)

  const colorLabel = settings.colorLabels?.[event.color] || event.color

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* 배경 클릭 시 닫기 */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={popupRef}
        className="fixed z-50 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ left, top }}
        onClick={e => e.stopPropagation()}
      >
        {/* 컬러 헤더 */}
        <div className={`${COLOR_BG[event.color] ?? 'bg-blue-500'} px-4 py-3`}>
          <div className="flex items-start gap-2">
            <h3 className="text-white font-semibold text-sm flex-1 leading-snug">{event.title}</h3>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={onEdit}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white/90 hover:text-white text-sm"
                title="수정"
              >✏️</button>
              <button
                onClick={() => { if (confirm(`"${event.title}" 일정을 삭제할까요?`)) onDelete() }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white/90 hover:text-white text-sm"
                title="삭제"
              >🗑️</button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 text-white/90 hover:text-white font-bold"
                title="닫기"
              >✕</button>
            </div>
          </div>
        </div>

        {/* 상세 내용 */}
        <div className="px-4 py-3 space-y-2.5">
          {/* 날짜 */}
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-base shrink-0">📅</span>
            <span>
              {event.date}
              {event.endDate && event.endDate !== event.date ? ` – ${event.endDate}` : ''}
            </span>
          </div>

          {/* 시간 */}
          {event.startTime && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-base shrink-0">🕐</span>
              <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
            </div>
          )}

          {/* 반복 */}
          {event.repeat !== 'none' && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-base shrink-0">🔁</span>
              <span>
                {REPEAT_LABEL[event.repeat] ?? event.repeat}
                {event.repeatUntil ? ` · ${event.repeatUntil}까지` : ' · 무기한'}
              </span>
            </div>
          )}

          {/* 메모 */}
          {event.memo && (
            <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-base shrink-0 mt-0.5">📝</span>
              <span className="text-xs leading-relaxed whitespace-pre-wrap">{event.memo}</span>
            </div>
          )}

          {/* 색상 선택 */}
          <div className="flex items-center gap-2">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => onColorChange(event.id, c.value)}
                title={settings.colorLabels?.[c.value] || c.value}
                className={`w-5 h-5 rounded-full ${c.cls} transition-all hover:scale-110
                  ${event.color === c.value ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
              />
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{colorLabel}</span>
          </div>
        </div>
      </div>
    </>
  )
}
