import { CalEvent } from './types'

/** 특정 날짜에 이 이벤트가 표시돼야 하는지 판단 (반복 + 멀티데이 지원) */
export function shouldShowOnDate(ev: CalEvent, dateStr: string): boolean {
  const isSameDay = ev.date === dateStr

  // 멀티데이 이벤트: date ~ endDate 사이의 날짜면 표시
  if (ev.endDate && ev.endDate > ev.date) {
    if (dateStr >= ev.date && dateStr <= ev.endDate) return true
  } else if (isSameDay) {
    return true
  }

  if (ev.repeat === 'none') return false

  // 반복 종료일 이후면 표시 안 함
  if (ev.repeatUntil && dateStr > ev.repeatUntil) return false

  const start = localDate(ev.date)
  const target = localDate(dateStr)
  if (target <= start) return false

  switch (ev.repeat) {
    case 'daily':
      return true
    case 'weekly': {
      const diffDays = Math.round((target.getTime() - start.getTime()) / 86_400_000)
      return diffDays % 7 === 0
    }
    case 'monthly':
      return target.getDate() === start.getDate()
    case 'yearly':
      return target.getDate() === start.getDate() && target.getMonth() === start.getMonth()
    default:
      return false
  }
}

function localDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 반복 레이블 */
export const REPEAT_LABELS: Record<string, string> = {
  none: '반복 없음',
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
}
