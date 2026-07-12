'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { t } from '@/lib/i18n/translations'
import type { MediaResult } from '@/lib/exercises/media'

const w = t.workout

const RATING_EMOJIS = ['😫', '😕', '😐', '💪', '🔥']
const RATING_LABELS = ['שברתי אותי', 'קשה', 'בסדר', 'חזק', 'אש!!']

const WEEK_MULTIPLIERS = [1.0, 1.05, 1.10, 0.9]
const WEEK_LABELS = ['בניית בסיס', 'הוספת עומס', 'עומס שיא', 'שחזור']

function weekWeight(base: number | null, week: number): number {
  if (!base || base === 0) return 0
  const m = WEEK_MULTIPLIERS[Math.min(week - 1, 3)]
  return Math.round((base * m) / 2.5) * 2.5
}

type Exercise = {
  id: string
  name: string
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  target_weight_kg: number | null
  rest_seconds: number
  coaching_cue: string | null
}

type SetLog = { reps: number; weight: number; done: boolean }

type RestTimer = { seconds: number; total: number; exerciseName: string }

export default function ActiveWorkout({
  exercises,
  dayLabel,
  media,
  programId,
  dayOfWeek,
  weekNumber = 1,
}: {
  exercises: Exercise[]
  dayLabel: string
  media: MediaResult[]
  programId: string
  dayOfWeek: string
  weekNumber?: number
}) {
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() =>
    Object.fromEntries(
      exercises.map(ex => [
        ex.id,
        Array.from({ length: ex.target_sets }, () => ({
          reps: ex.target_reps_max,
          weight: weekWeight(ex.target_weight_kg, weekNumber),
          done: false,
        })),
      ])
    )
  )
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState<'active' | 'rating' | 'complete'>('active')
  const [saving, setSaving] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [openDemo, setOpenDemo] = useState<string | null>(null)
  const [restTimer, setRestTimer] = useState<RestTimer | null>(null)

  // Workout timer
  useEffect(() => {
    if (phase !== 'active') return
    const start = Date.now()
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [phase])

  // Rest timer countdown
  useEffect(() => {
    if (!restTimer) return
    if (restTimer.seconds === 0) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
      const t = setTimeout(() => setRestTimer(null), 3000)
      return () => clearTimeout(t)
    }
    const t = setTimeout(
      () => setRestTimer(prev => prev ? { ...prev, seconds: prev.seconds - 1 } : null),
      1000
    )
    return () => clearTimeout(t)
  }, [restTimer])

  const totalSets = exercises.reduce((s, ex) => s + ex.target_sets, 0)
  const completedSets = Object.values(logs).flat().filter(s => s.done).length
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  function toggleSet(exerciseId: string, i: number) {
    const wasNotDone = !logs[exerciseId]?.[i]?.done
    setLogs(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((s, j) => j === i ? { ...s, done: !s.done } : s),
    }))
    if (wasNotDone) {
      const ex = exercises.find(e => e.id === exerciseId)
      if (ex && ex.rest_seconds > 0) {
        setRestTimer({ seconds: ex.rest_seconds, total: ex.rest_seconds, exerciseName: ex.name })
      }
    } else {
      setRestTimer(null)
    }
  }

  function updateSet(exerciseId: string, i: number, field: 'reps' | 'weight', value: string) {
    const num = parseFloat(value) || 0
    setLogs(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((s, j) => j === i ? { ...s, [field]: num } : s),
    }))
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  async function finishWorkout(rating: number | null) {
    setSaving(true)
    // Collect completed set logs
    const setLogs: { exerciseName: string; setNumber: number; weightKg: number | null; reps: number }[] = []
    exercises.forEach(ex => {
      ;(logs[ex.id] ?? []).forEach((s, i) => {
        if (s.done) {
          setLogs.push({
            exerciseName: ex.name,
            setNumber: i + 1,
            weightKg: s.weight > 0 ? s.weight : null,
            reps: s.reps,
          })
        }
      })
    })
    try {
      await fetch('/api/complete-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          dayOfWeek,
          dayLabel,
          durationSeconds: elapsed,
          rating,
          setsCompleted: completedSets,
          setLogs,
        }),
      })
    } catch { /* silently fail */ }
    setSaving(false)
    setPhase('complete')
  }

  if (phase === 'rating') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-1">{dayLabel}</h2>
          <p className="text-orange-400 font-semibold mb-10">
            {fmt(elapsed)} · {completedSets} {w.setsProgress}
          </p>
          <p className="text-white font-semibold text-lg mb-6">{w.ratingTitle}</p>
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(r => (
              <button
                key={r}
                onClick={() => { setSelectedRating(r); finishWorkout(r) }}
                disabled={saving}
                className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl border border-zinc-700 hover:border-orange-500 hover:bg-orange-500/10 transition-colors min-w-[56px] disabled:opacity-40"
              >
                <span className="text-2xl">{RATING_EMOJIS[r - 1]}</span>
                <span className="text-zinc-400 text-[10px] leading-tight">{RATING_LABELS[r - 1]}</span>
              </button>
            ))}
          </div>
          {saving ? (
            <p className="text-zinc-500 text-sm">{w.saving}</p>
          ) : (
            <button
              onClick={() => finishWorkout(null)}
              className="text-zinc-500 hover:text-zinc-300 text-sm underline underline-offset-2 transition-colors"
            >
              {w.skipRating}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6">💪</div>
          <h2 className="text-3xl font-bold text-white mb-2">{w.workoutComplete}</h2>
          <p className="text-zinc-400 mb-1">{dayLabel}</p>
          <p className="text-orange-400 font-semibold text-lg mb-3">
            {fmt(elapsed)} · {completedSets} {w.setsProgress}
          </p>
          {selectedRating && (
            <p className="text-zinc-500 text-sm mb-8">
              {RATING_EMOJIS[selectedRating - 1]} {RATING_LABELS[selectedRating - 1]}
            </p>
          )}
          {!selectedRating && <div className="mb-8" />}
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors"
          >
            {w.backToDashboard}
          </Link>
        </div>
      </div>
    )
  }

  const restPct = restTimer && restTimer.total > 0
    ? (restTimer.seconds / restTimer.total) * 100
    : 0
  const restDone = restTimer?.seconds === 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-zinc-500 text-xs">{w.activeLabel}</p>
            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30 font-medium">
              שבוע {weekNumber} — {WEEK_LABELS[weekNumber - 1]}
            </span>
          </div>
          <h1 className="text-lg font-bold text-white leading-tight">{dayLabel}</h1>
        </div>
        <span className="text-orange-400 font-mono text-2xl font-bold tabular-nums">{fmt(elapsed)}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1">
        <div
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-zinc-600 text-xs text-center mb-6">{completedSets}/{totalSets} {w.setsProgress}</p>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((ex, idx) => {
          const exLogs = logs[ex.id] ?? []
          const allDone = exLogs.length > 0 && exLogs.every(s => s.done)
          const exMedia = media[idx]
          const isOpen = openDemo === ex.id

          return (
            <div
              key={ex.id}
              className={`rounded-2xl border transition-colors ${
                allDone ? 'bg-green-950/20 border-green-800/50' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Exercise header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className={`font-semibold text-sm ${allDone ? 'text-green-400' : 'text-white'}`}>
                  {ex.name}
                </h3>
                <div className="flex items-center gap-2">
                  {allDone && (
                    <span className="text-xs text-green-400 font-medium">{w.completedBadge}</span>
                  )}
                  <button
                    onClick={() => setOpenDemo(isOpen ? null : ex.id)}
                    className="text-xs text-zinc-500 hover:text-orange-400 border border-zinc-700 hover:border-orange-500/50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {isOpen ? 'הסתר ▲' : 'הדגמה ▼'}
                  </button>
                </div>
              </div>

              {/* Collapsible demo panel */}
              {isOpen && (
                <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-zinc-700">
                  {exMedia.type === 'image' ? (
                    <img
                      src={exMedia.url}
                      alt={ex.name}
                      className="w-full object-contain bg-zinc-800 max-h-52"
                    />
                  ) : (
                    <div className="bg-zinc-800 flex flex-col items-center justify-center gap-3 py-6 px-4">
                      <span className="text-3xl">🎬</span>
                      <p className="text-zinc-400 text-xs text-center">אין GIF זמין לתרגיל זה</p>
                      <a
                        href={exMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        Watch tutorial on YouTube ↗
                      </a>
                      <p className="text-zinc-600 text-xs">נפתח בטאב חדש — האימון נשמר</p>
                    </div>
                  )}
                </div>
              )}

              {/* Column headers */}
              <div className="grid grid-cols-4 gap-2 px-5 pb-2">
                <span className="text-zinc-600 text-xs">{w.setCol}</span>
                <span className="text-zinc-600 text-xs text-center">{w.kgCol}</span>
                <span className="text-zinc-600 text-xs text-center">{w.repsCol}</span>
                <span className="text-zinc-600 text-xs text-center">{w.doneCol}</span>
              </div>

              {/* Set rows */}
              <div className="px-5 pb-4 space-y-2">
                {exLogs.map((s, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-4 gap-2 items-center rounded-xl py-1.5 px-1 transition-colors ${
                      s.done ? 'bg-green-950/30' : ''
                    }`}
                  >
                    <span className={`text-sm font-bold ${s.done ? 'text-green-400' : 'text-zinc-400'}`}>
                      {i + 1}
                    </span>
                    <input
                      type="number"
                      value={s.weight || ''}
                      onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                      placeholder="0"
                      className="w-full text-center py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      value={s.reps || ''}
                      onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                      placeholder="0"
                      className="w-full text-center py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => toggleSet(ex.id, i)}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        s.done
                          ? 'bg-green-600 text-white scale-95'
                          : 'bg-zinc-800 text-zinc-500 hover:bg-orange-500 hover:text-white'
                      }`}
                    >
                      {s.done ? '✓' : '○'}
                    </button>
                  </div>
                ))}
              </div>

              {ex.coaching_cue && (
                <p className="text-zinc-500 text-xs px-5 pb-5 leading-relaxed border-t border-zinc-800 pt-3">
                  {ex.coaching_cue}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setPhase('rating')}
        className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors text-base mt-6 mb-24"
      >
        {w.finishBtn}
      </button>

      {/* Floating rest timer */}
      {restTimer !== null && (
        <div className={`fixed bottom-6 left-4 right-4 max-w-sm mx-auto z-50 rounded-2xl border px-5 py-4 shadow-2xl flex items-center gap-4 transition-all duration-300 ${
          restDone
            ? 'bg-green-950/95 border-green-700 backdrop-blur-sm'
            : 'bg-zinc-900/95 border-zinc-700 backdrop-blur-sm'
        }`}>
          {/* Circular countdown */}
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3f3f46" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={restDone ? '#22c55e' : restTimer.seconds <= 5 ? '#f97316' : '#6b7280'}
                strokeWidth="3"
                pathLength="100"
                strokeDasharray={`${restPct} 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {restTimer.seconds}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${restDone ? 'text-green-400' : 'text-white'}`}>
              {restDone ? w.restReady : w.restTime}
            </p>
            <p className="text-zinc-500 text-xs truncate">
              {restDone ? restTimer.exerciseName : `${restTimer.seconds} ${w.restSeconds}`}
            </p>
          </div>

          <button
            onClick={() => setRestTimer(null)}
            className="text-zinc-600 hover:text-zinc-400 text-2xl font-light leading-none"
            aria-label="סגור"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
