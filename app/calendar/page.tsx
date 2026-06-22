'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import MonthView from '@/components/calendar/MonthView'
import WeekView from '@/components/calendar/WeekView'
import DayView from '@/components/calendar/DayView'
import EventModal from '@/components/calendar/EventModal'
import SettingsModal from '@/components/calendar/SettingsModal'
import StatsView from '@/components/calendar/StatsView'
import MiniCalendar from '@/components/calendar/MiniCalendar'
import SidebarStats from '@/components/calendar/SidebarStats'
import EventPopup from '@/components/calendar/EventPopup'
import HabitTracker from '@/components/myplan/HabitTracker'
import Dashboard from '@/components/myplan/Dashboard'
import { ViewType, CalEvent, Todo, CalSettings, DEFAULT_SETTINGS } from './types'

type Section = 'home' | 'calendar' | 'habits' | 'goals'

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.min(Math.floor(total / 60), 23)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function timeDiffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function getWeekStart(date: Date, startDay: 0 | 1): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = startDay === 1 ? (day === 0 ? -6 : 1 - day) : -day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// localStorage를 직접 초기화해 "저장 후 덮어쓰기" 버그를 방지
function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export default function CalendarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [view, setView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalEvent[]>(() => loadLS('cal_events', []))
  const [todos, setTodos] = useState<Todo[]>(() => loadLS('cal_todos', []))
  const [settings, setSettings] = useState<CalSettings>(() => ({ ...DEFAULT_SETTINGS, ...loadLS('cal_settings', {}) }))
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedEndTime, setSelectedEndTime] = useState('')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('home')
  const [showStats, setShowStats] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [popup, setPopup] = useState<{ eventId: string; x: number; y: number } | null>(null)
  const initialized = useRef(false)

  // 로그인 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      if (!session) router.replace('/login')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 초기화 완료 후에만 localStorage 저장 (첫 render의 빈 배열로 덮어쓰지 않도록)
  useEffect(() => { initialized.current = true }, [])
  useEffect(() => { if (initialized.current) localStorage.setItem('cal_events', JSON.stringify(events)) }, [events])
  useEffect(() => { if (initialized.current) localStorage.setItem('cal_todos', JSON.stringify(todos)) }, [todos])
  useEffect(() => {
    if (initialized.current) localStorage.setItem('cal_settings', JSON.stringify(settings))
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings])

  const updateSettings = (s: CalSettings) => setSettings(s)

  const navigate = (direction: 'prev' | 'next') => {
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1))
    else if (view === 'week') d.setDate(d.getDate() + (direction === 'next' ? 7 : -7))
    else d.setDate(d.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(d)
  }

  const openModal = (date: string, time?: string, endTime?: string) => {
    setSelectedDate(date)
    setSelectedTime(time || '')
    setSelectedEndTime(endTime || '')
    setModalOpen(true)
  }

  const openEditModal = (id: string) => {
    setPopup(null)
    setEditingEventId(id)
    setModalOpen(true)
  }

  const openPopup = (eventId: string, x: number, y: number) => setPopup({ eventId, x, y })
  const closePopup = () => setPopup(null)

  const addEvent = (event: Omit<CalEvent, 'id'>) => {
    if (editingEventId) {
      setEvents(prev => prev.map(e => e.id === editingEventId ? { ...e, ...event } : e))
      setEditingEventId(null)
    } else {
      const displayIn = !settings.syncViews ? [view] : undefined
      setEvents(prev => [...prev, { ...event, id: Date.now().toString(), displayIn }])
    }
    setModalOpen(false)
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setModalOpen(false)
    setEditingEventId(null)
  }

  const moveEvent = (id: string, newDate: string, newStartTime?: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e
      if (newStartTime && e.startTime && e.endTime) {
        const dur = timeDiffMinutes(e.startTime, e.endTime)
        return { ...e, date: newDate, startTime: newStartTime, endTime: addMinutes(newStartTime, dur) }
      }
      return { ...e, date: newDate }
    }))
  }

  const resizeEvent = (id: string, newEndDate: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, endDate: newEndDate } : e))
  }

  const resizeEventTime = (id: string, newStartTime: string, newEndTime: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, startTime: newStartTime, endTime: newEndTime } : e))
  }

  const changeEventColor = (id: string, color: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, color } : e))
  }

  const getEventsForView = (v: ViewType) =>
    settings.syncViews ? events : events.filter(e => !e.displayIn || e.displayIn.includes(v))

  const addTodo = (todo: { title: string; date: string }) =>
    setTodos(prev => [...prev, { ...todo, id: Date.now().toString(), done: false }])
  const toggleTodo = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id))

  const formatHeader = () => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth() + 1
    if (view === 'month') return `${y}년 ${m}월`
    if (view === 'week') {
      const start = getWeekStart(currentDate, settings.weekStartDay)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      return `${start.getMonth() + 1}월 ${start.getDate()}일 — ${end.getMonth() + 1}월 ${end.getDate()}일`
    }
    return `${y}년 ${m}월 ${currentDate.getDate()}일`
  }

  const NAV_TABS: { key: Section; label: string }[] = [
    { key: 'home',     label: '홈' },
    { key: 'goals',    label: '목표 설정' },
    { key: 'calendar', label: '캘린더' },
    { key: 'habits',   label: '습관관리' },
  ]

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 font-sans transition-colors">
      {/* MY PLAN 상단 탭 */}
      <nav className="flex items-center gap-1 px-5 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight mr-3">MY PLAN</span>
        {NAV_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setSection(tab.key); if (tab.key === 'calendar') setShowStats(false) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${section === tab.key
                ? 'bg-blue-600 text-white'
                : tab.key === 'goals'
                  ? 'text-gray-400 dark:text-gray-600 cursor-default'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            disabled={tab.key === 'goals'}>
            {tab.label}{tab.key === 'goals' ? ' (준비 중)' : ''}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => updateSettings({ ...settings, darkMode: !settings.darkMode })}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-base"
          title={settings.darkMode ? '라이트 모드' : '다크 모드'}>
          {settings.darkMode ? '☀️' : '🌙'}
        </button>
        {/* 프로필 + 로그아웃 */}
        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-gray-200 dark:border-gray-700">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="프로필" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <button onClick={signOut}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            로그아웃
          </button>
        </div>
      </nav>

      {/* 홈 대시보드 */}
      {section === 'home' && (
        <Dashboard
          events={events}
          settings={settings}
          onGoCalendar={() => setSection('calendar')}
          onGoHabits={() => setSection('habits')}
        />
      )}

      {/* 습관관리 */}
      {section === 'habits' && <HabitTracker />}

      {/* 캘린더 */}
      {section === 'calendar' && (
        <>
          <header className="flex items-center px-5 py-3 border-b border-gray-200 dark:border-gray-700 gap-4 shrink-0 bg-white dark:bg-gray-900">
            <button onClick={() => setShowSidebar(s => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0 text-lg"
              title="사이드바 열기/닫기">☰</button>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">오늘</button>
              <button onClick={() => navigate('prev')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 text-lg">‹</button>
              <button onClick={() => navigate('next')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 text-lg">›</button>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex-1">{formatHeader()}</h2>
            <button onClick={() => setShowStats(s => !s)}
              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-colors ${showStats ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              title="통계">📊</button>
            <button onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-lg" title="설정">⚙️</button>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden text-sm">
              {(['month', 'week', 'day'] as ViewType[]).map(v => (
                <button key={v} onClick={() => { setShowStats(false); setView(v) }}
                  className={`px-5 py-2 transition-colors ${!showStats && view === v ? 'bg-blue-600 text-white font-medium' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {v === 'month' ? '월' : v === 'week' ? '주' : '일'}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {showSidebar && !showStats && (view === 'week' || view === 'day') && (
              <aside className="w-52 shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
                <MiniCalendar currentDate={currentDate} onSelectDate={setCurrentDate} />
                <SidebarStats events={events} currentDate={currentDate} settings={settings} />
              </aside>
            )}
            <main className="flex-1 overflow-hidden">
              {showStats && <StatsView currentDate={currentDate} events={events} settings={settings} />}
              {!showStats && view === 'month' && (
                <MonthView currentDate={currentDate} events={getEventsForView('month')}
                  onDayClick={(date) => { setCurrentDate(new Date(date)); setView('day') }}
                  onAddEvent={openModal} onShowPopup={openPopup} onEditEvent={openEditModal} onDeleteEvent={deleteEvent}
                  onMoveEvent={moveEvent} onResizeEvent={resizeEvent} />
              )}
              {!showStats && view === 'week' && (
                <WeekView currentDate={currentDate} events={getEventsForView('week')} settings={settings}
                  onAddEvent={openModal} onShowPopup={openPopup} onEditEvent={openEditModal} onDeleteEvent={deleteEvent}
                  onMoveEvent={moveEvent} onResizeEventTime={resizeEventTime} />
              )}
              {!showStats && view === 'day' && (
                <DayView currentDate={currentDate} events={getEventsForView('day')} todos={todos} settings={settings}
                  onAddEvent={openModal} onShowPopup={openPopup} onEditEvent={openEditModal} onDeleteEvent={deleteEvent} onMoveEvent={moveEvent}
                  onAddTodo={addTodo} onToggleTodo={toggleTodo} onDeleteTodo={deleteTodo} />
              )}
            </main>
          </div>
        </>
      )}


      {modalOpen && (
        <EventModal
          date={selectedDate} time={selectedTime} prefillEndTime={selectedEndTime}
          view={view}
          editingEvent={editingEventId ? events.find(e => e.id === editingEventId) : undefined}
          onSave={addEvent}
          onDelete={deleteEvent}
          onClose={() => { setModalOpen(false); setEditingEventId(null) }}
        />
      )}
      {settingsOpen && (
        <SettingsModal settings={settings} onUpdate={updateSettings} onClose={() => setSettingsOpen(false)} />
      )}
      {popup && (() => {
        const ev = events.find(e => e.id === popup.eventId)
        if (!ev) return null
        return (
          <EventPopup
            event={ev}
            anchorX={popup.x} anchorY={popup.y}
            settings={settings}
            onEdit={() => openEditModal(popup.eventId)}
            onDelete={() => { deleteEvent(popup.eventId); closePopup() }}
            onClose={closePopup}
            onColorChange={changeEventColor}
          />
        )
      })()}
    </div>
  )
}
