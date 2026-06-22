'use client'

import { CalSettings, ViewType } from '@/app/calendar/types'

const COLOR_DOTS: { key: string; cls: string }[] = [
  { key: 'blue', cls: 'bg-blue-500' },
  { key: 'red', cls: 'bg-red-500' },
  { key: 'green', cls: 'bg-green-500' },
  { key: 'yellow', cls: 'bg-yellow-400' },
  { key: 'purple', cls: 'bg-purple-500' },
  { key: 'orange', cls: 'bg-orange-500' },
]

const TIMEZONES = [
  { value: 'Asia/Seoul', label: '서울 (KST, UTC+9)' },
  { value: 'Asia/Tokyo', label: '도쿄 (JST, UTC+9)' },
  { value: 'Asia/Shanghai', label: '상하이 (CST, UTC+8)' },
  { value: 'Asia/Singapore', label: '싱가포르 (SGT, UTC+8)' },
  { value: 'Europe/London', label: '런던 (GMT/BST)' },
  { value: 'Europe/Paris', label: '파리 (CET, UTC+1)' },
  { value: 'America/New_York', label: '뉴욕 (EST, UTC-5)' },
  { value: 'America/Los_Angeles', label: '로스앤젤레스 (PST, UTC-8)' },
  { value: 'America/Chicago', label: '시카고 (CST, UTC-6)' },
  { value: 'Australia/Sydney', label: '시드니 (AEDT, UTC+11)' },
  { value: 'UTC', label: 'UTC (세계 표준시)' },
]

interface Props {
  settings: CalSettings
  onUpdate: (s: CalSettings) => void
  onClose: () => void
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</div>
        {desc && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</div>}
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsModal({ settings, onUpdate, onClose }: Props) {
  const set = <K extends keyof CalSettings>(key: K, val: CalSettings[K]) =>
    onUpdate({ ...settings, [key]: val })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">⚙️ 설정</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto px-6 py-2">
          {/* === 화면 === */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-4 mb-1">화면</p>

          <Row label="다크 모드" desc="어두운 테마로 전환합니다">
            <button
              onClick={() => set('darkMode', !settings.darkMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </Row>

          <Row label="기본 화면" desc="캘린더를 처음 열 때 보여줄 뷰">
            <select
              value={settings.defaultView}
              onChange={e => set('defaultView', e.target.value as ViewType)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">월간 뷰</option>
              <option value="week">주간 뷰</option>
              <option value="day">일간 뷰</option>
            </select>
          </Row>

          {/* === 시간 === */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-1">시간</p>

          <Row label="하루 시작 시간" desc="주간·일간 뷰의 최상단 시간">
            <select
              value={settings.dayStartHour}
              onChange={e => set('dayStartHour', Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
          </Row>

          <Row label="시간 형식" desc="12시간 / 24시간제">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
              {(['24', '12'] as const).map(f => (
                <button key={f} onClick={() => set('timeFormat', f)}
                  className={`px-3 py-1.5 transition-colors ${settings.timeFormat === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  {f === '24' ? '24시간' : '오전/오후'}
                </button>
              ))}
            </div>
          </Row>

          <Row label="주 시작 요일" desc="달력의 첫 번째 열">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
              <button onClick={() => set('weekStartDay', 0)}
                className={`px-3 py-1.5 transition-colors ${settings.weekStartDay === 0 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                일요일
              </button>
              <button onClick={() => set('weekStartDay', 1)}
                className={`px-3 py-1.5 transition-colors ${settings.weekStartDay === 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                월요일
              </button>
            </div>
          </Row>

          {/* === 색상 카테고리 === */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-1">색상 카테고리</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">각 색상이 의미하는 카테고리 이름을 설정하세요</p>

          <div className="space-y-2">
            {COLOR_DOTS.map(({ key, cls }) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full shrink-0 ${cls}`} />
                <input
                  type="text"
                  value={settings.colorLabels?.[key] ?? ''}
                  onChange={e => set('colorLabels', { ...settings.colorLabels, [key]: e.target.value })}
                  placeholder="카테고리 이름"
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* === 뷰 연동 === */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-1">뷰 연동</p>

          <Row label="월/주 뷰 연동" desc="끄면 월간·주간에서 만든 일정이 각 뷰에서만 표시됩니다 (주/일은 항상 연동)">
            <button
              onClick={() => set('syncViews', !settings.syncViews)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.syncViews ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.syncViews ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </Row>

          {/* === 지역 === */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-1">지역</p>

          <Row label="시간대 (타임존)" desc="일정이 표시될 시간대">
            <select
              value={settings.timezone}
              onChange={e => set('timezone', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[220px]"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </Row>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium">
            완료
          </button>
        </div>
      </div>
    </div>
  )
}
