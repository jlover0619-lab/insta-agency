export type ViewType = 'month' | 'week' | 'day'

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CalEvent {
  id: string
  title: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  memo?: string
  color: string
  repeat: RepeatType
  repeatUntil?: string    // 반복 종료일 (YYYY-MM-DD), 없으면 무기한
  displayIn?: ViewType[]  // undefined = 모든 뷰에 표시
}

export interface Todo {
  id: string
  title: string
  date: string
  done: boolean
}

export interface CalSettings {
  darkMode: boolean
  dayStartHour: number
  weekStartDay: 0 | 1
  timezone: string
  timeFormat: '12' | '24'
  defaultView: ViewType
  colorLabels: Record<string, string>
  syncViews: boolean  // true = 모든 뷰 공유, false = 뷰별 개별 일정
}

export const DEFAULT_COLOR_LABELS: Record<string, string> = {
  blue: '업무',
  red: '개인',
  green: '건강/운동',
  yellow: '학습',
  purple: '모임/약속',
  orange: '여가',
}

export const DEFAULT_SETTINGS: CalSettings = {
  darkMode: false,
  dayStartHour: 8,
  weekStartDay: 0,
  timezone: 'Asia/Seoul',
  timeFormat: '24',
  defaultView: 'month',
  colorLabels: DEFAULT_COLOR_LABELS,
  syncViews: true,
}
