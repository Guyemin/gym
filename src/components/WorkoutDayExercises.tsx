'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n/translations'

const w = t.workout

// Predefined alternatives by muscle group keyword
const ALTERNATIVES: Record<string, string[]> = {
  'Bench Press':       ['Dumbbell Bench Press', 'Push-Ups', 'Cable Fly', 'Dips'],
  'Incline Press':     ['Incline Dumbbell Press', 'Incline Push-Ups', 'Cable Incline Fly'],
  'Fly':               ['Cable Fly', 'Pec Deck', 'Dumbbell Fly', 'Push-Ups'],
  'Pull-Up':           ['Lat Pulldown', 'Cable Row', 'Assisted Pull-Up'],
  'Chin-Up':           ['Lat Pulldown', 'Cable Row', 'Pull-Up'],
  'Row':               ['Dumbbell Row', 'Cable Row', 'Machine Row', 'Face Pulls'],
  'Lat Pulldown':      ['Pull-Ups', 'Cable Row', 'Dumbbell Row'],
  'Deadlift':          ['Romanian Deadlift', 'Good Morning', 'Kettlebell Swing'],
  'Squat':             ['Leg Press', 'Goblet Squat', 'Bulgarian Split Squat', 'Lunges'],
  'Leg Press':         ['Goblet Squat', 'Lunges', 'Bulgarian Split Squat'],
  'Lunge':             ['Split Squat', 'Step-Ups', 'Reverse Lunge', 'Leg Press'],
  'Leg Curl':          ['Romanian Deadlift', 'Glute Bridge', 'Nordic Curl'],
  'Leg Extension':     ['Step-Ups', 'Wall Sit', 'Bodyweight Squat'],
  'Shoulder Press':    ['Dumbbell Shoulder Press', 'Arnold Press', 'Pike Push-Ups'],
  'Lateral Raise':     ['Cable Lateral Raise', 'Dumbbell Lateral Raise', 'Machine Lateral'],
  'Curl':              ['Hammer Curl', 'Cable Curl', 'Preacher Curl', 'Incline Curl'],
  'Tricep':            ['Cable Pushdown', 'Dips', 'Close Grip Push-Ups', 'Skull Crusher'],
  'Plank':             ['Dead Bug', 'Ab Wheel', 'Hollow Hold', 'Bird Dog'],
  'Crunch':            ['Hanging Leg Raise', 'Cable Crunch', 'Leg Raises'],
  'Glute Bridge':      ['Hip Thrust', 'Single-Leg Glute Bridge', 'Romanian Deadlift'],
  'Calf':              ['Seated Calf Raise', 'Single-Leg Calf Raise', 'Jump Rope'],
}

// Home alternatives for gym exercises
const HOME_ALTERNATIVES: Record<string, string> = {
  'Barbell Bench Press':        'Push-Ups',
  'Dumbbell Bench Press':       'Push-Ups',
  'Incline Bench Press':        'Incline Push-Ups',
  'Barbell Back Squat':         'Bodyweight Squat',
  'Leg Press':                  'Bodyweight Squat',
  'Barbell Deadlift':           'Glute Bridge',
  'Romanian Deadlift':          'Single-Leg Glute Bridge',
  'Lat Pulldown':               'Pull-Ups',
  'Cable Row':                  'Inverted Row',
  'Barbell Row':                'Inverted Row',
  'Dumbbell Row':               'Inverted Row',
  'Shoulder Press':             'Pike Push-Ups',
  'Barbell Overhead Press':     'Pike Push-Ups',
  'Lateral Raise':              'Arm Circles',
  'Cable Fly':                  'Push-Ups',
  'Pec Deck':                   'Push-Ups',
  'Leg Curl':                   'Glute Bridge',
  'Leg Extension':              'Bodyweight Squat',
  'Tricep Pushdown':            'Triceps Dips',
  'Skull Crusher':              'Close Grip Push-Ups',
  'Barbell Curl':               'Bodyweight Curl (use table edge)',
  'Machine Curl':               'Isometric Curl',
  'Calf Raise':                 'Single-Leg Calf Raise',
}

function getAlternatives(exerciseName: string): string[] {
  for (const [keyword, alts] of Object.entries(ALTERNATIVES)) {
    if (exerciseName.toLowerCase().includes(keyword.toLowerCase())) {
      return alts.filter(a => a !== exerciseName)
    }
  }
  return ['Push-Ups', 'Bodyweight Squat', 'Plank', 'Lunges']
}

function getHomeAlternative(exerciseName: string): string {
  if (HOME_ALTERNATIVES[exerciseName]) return HOME_ALTERNATIVES[exerciseName]
  for (const [key, val] of Object.entries(HOME_ALTERNATIVES)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase().split(' ')[0])) return val
  }
  return 'Bodyweight version'
}

type Exercise = {
  id: string
  day_label: string
  sort_order: number
  target_sets: number
  target_reps_min: number
  target_reps_max: number
  rest_seconds: number
  coaching_cue: string | null
  target_weight_kg: number | null
  exercises: { name: string } | null
  mediaType: 'image' | 'youtube'
  mediaUrl: string
}

export default function WorkoutDayExercises({ exercises }: { exercises: Exercise[] }) {
  const [swapped, setSwapped] = useState<Record<string, string>>({})
  const [swapOpen, setSwapOpen] = useState<string | null>(null)
  const [homeMode, setHomeMode] = useState(false)

  function activateHomeMode() {
    const map: Record<string, string> = {}
    exercises.forEach(pe => {
      const name = pe.exercises?.name ?? ''
      map[pe.id] = getHomeAlternative(name)
    })
    setSwapped(map)
    setHomeMode(true)
  }

  return (
    <div className="space-y-4">
      {/* Home mode button */}
      <button
        onClick={activateHomeMode}
        className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors ${
          homeMode
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
        }`}
      >
        🏠 {w.homeMode}
      </button>

      {exercises.map((pe, i) => {
        const originalName = pe.exercises?.name ?? ''
        const currentName = swapped[pe.id] ?? originalName
        const isSwapped = !!swapped[pe.id]
        const hasWeight = typeof pe.target_weight_kg === 'number' && pe.target_weight_kg > 0
        const alternatives = getAlternatives(originalName)

        return (
          <div key={pe.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {pe.mediaType === 'image' ? (
              <div className="w-full bg-zinc-800 flex items-center justify-center" style={{ minHeight: '160px' }}>
                <img src={pe.mediaUrl} alt={currentName} className="w-full object-contain max-h-52" />
              </div>
            ) : (
              <div className="w-full bg-zinc-800/50 flex flex-col items-center justify-center gap-3 py-6">
                <span className="text-4xl">🏋️</span>
                <a
                  href={pe.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1.5"
                >
                  Watch tutorial on YouTube <span>↗</span>
                </a>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold">{currentName}</h3>
                    {isSwapped && (
                      <p className="text-zinc-500 text-[10px] mt-0.5 line-through">{originalName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSwapOpen(swapOpen === pe.id ? null : pe.id)}
                  className="shrink-0 text-xs text-zinc-500 hover:text-orange-400 border border-zinc-700 hover:border-orange-500/50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {isSwapped ? `✓ ${w.swapped}` : w.swapBtn}
                </button>
              </div>

              {/* Swap panel */}
              {swapOpen === pe.id && (
                <div className="mb-4 p-3 bg-zinc-800/60 rounded-xl border border-zinc-700">
                  <p className="text-zinc-400 text-xs font-semibold mb-2">{w.swapTitle}</p>
                  <div className="space-y-1.5">
                    {alternatives.map(alt => (
                      <button
                        key={alt}
                        onClick={() => { setSwapped(s => ({ ...s, [pe.id]: alt })); setSwapOpen(null) }}
                        className="w-full text-start text-sm text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        {alt}
                      </button>
                    ))}
                    {isSwapped && (
                      <button
                        onClick={() => { setSwapped(s => { const n = { ...s }; delete n[pe.id]; return n }); setSwapOpen(null) }}
                        className="w-full text-start text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700/50 transition-colors"
                      >
                        ← חזור לתרגיל המקורי
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className={`grid gap-2 mb-4 ${hasWeight ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-orange-400 font-bold text-xl">{pe.target_sets}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{w.sets}</p>
                </div>
                <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-orange-400 font-bold text-xl">{pe.target_reps_min}–{pe.target_reps_max}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{w.reps}</p>
                </div>
                <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                  <p className="text-orange-400 font-bold text-xl">{pe.rest_seconds}s</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{w.rest}</p>
                </div>
                {hasWeight && (
                  <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                    <p className="text-orange-400 font-bold text-xl">{pe.target_weight_kg}kg</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{w.weight}</p>
                  </div>
                )}
              </div>

              {pe.coaching_cue && (
                <p className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-3">
                  {pe.coaching_cue}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
