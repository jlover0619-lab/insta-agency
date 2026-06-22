'use client'

import { useState } from 'react'
import { CalEvent, ViewType, RepeatType } from '@/app/calendar/types'

const COLORS = [
  { value: 'blue', label: '파랑', cls: 'bg-blue-500' },
  { value: 'red', label: '빨강', cls: 'bg-red-500' },
  { value: 'green', label: '초록', cls: 'bg-green-500' },
  { value: 'yellow', label: '노랑', cls: 'bg-yellow-400' },
  { value: 'purple', label: '보라', cls: 'bg-purple-500' },
  { value: 'orange', label: '주황', cls: 'bg-orange-500' },
]

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'none', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
]

function addHour(time: string) {
  const [h, m] = time.split(':').map(Number)
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

interface Props {
  // 생성 모드용
  date?: string
  time?: string
  prefillEndTime?: string
  view: ViewType
  // 수정 모드용 (있으면 수정, 없으면 생성)
  editingEvent?: CalEvent
  onSave: (event: Omit<CalEvent, 'id'>) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export default function EventModal({ date, time, prefillEndTime, view, editingEvent, onSave, onDelete, onClose }: Props) {
  const isEdit = !!editingEvent

  const defaultStart = editingEvent?.startTime ?? time ?? '09:00'
  const defaultEnd = editingEvent?.endTime ?? prefillEndTime ?? (time ? addHour(time) : '10:00')

  const [title, setTitle] = useState(editingEvent?.title ?? '')
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [memo, setMemo] = useState(editingEvent?.memo ?? '')
  const [color, setColor] = useState(editingEvent?.color ?? 'blue')
  const [repeat, setRepeat] = useState<RepeatType>(editingEvent?.repeat ?? 'none')
  const [repeatUntil, setRepeatUntil] = useState(editingEvent?.repeatUntil ?? '')

  const eventDate = editingEvent?.date ?? date ?? ''
  const showTime = view !== 'month' || !!editingEvent?.startTime

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      date: eventDate,
      endDate: editingEvent?.endDate,
      startTime: showTime ? startTime : undefined,
      endTime: showTime ? endTime : undefined,
      memo: memo.trim() || undefined,
      color,
      repeat,
      repeatUntil: repeat !== 'none' && repeatUntil ? repeatUntil : undefined,
    })
  }

  const handleDelete = () => {
    if (!editingEvent || !onDelete) return
    if (confirm(`"${editingEvent.title}" 일정을 삭제할까요?`)) {
      onDelete(editingEvent.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xs p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {isEdit ? '✏️ 일정 수정' : '새 일정'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        <div className="space-y-2.5">
          {/* 제목 */}
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="제목 *" autoFocus
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />

          {/* 날짜 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">{eventDate}</div>

          {/* 시간 */}
          {showTime && (
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
            </div>
          )}

          {/* 반복 + 색상 한 줄 */}
          <div className="flex items-center gap-2">
            <select value={repeat} onChange={e => { setRepeat(e.target.value as RepeatType); if (e.target.value === 'none') setRepeatUntil('') }}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
              {REPEAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex gap-1.5 shrink-0">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)} title={c.label}
                  className={`w-6 h-6 rounded-full ${c.cls} transition-all hover:scale-110 ${color === c.value ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`} />
              ))}
            </div>
          </div>

          {/* 반복 종료일 (반복 설정 시에만 표시) */}
          {repeat !== 'none' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">반복 종료</label>
              <input
                type="date"
                value={repeatUntil}
                min={eventDate}
                onChange={e => setRepeatUntil(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              {repeatUntil && (
                <button onClick={() => setRepeatUntil('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm shrink-0">✕</button>
              )}
            </div>
          )}

          {/* 메모 */}
          <textarea value={memo} onChange={e => setMemo(e.target.value)}
            placeholder="메모 (선택)" rows={1}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none" />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 mt-3">
          {isEdit && (
            <button onClick={handleDelete}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
              삭제
            </button>
          )}
          <button onClick={onClose}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">
            취소
          </button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium">
            {isEdit ? '수정 완료' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
