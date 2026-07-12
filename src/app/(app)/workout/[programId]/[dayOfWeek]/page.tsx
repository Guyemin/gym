import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/translations'
import { fetchExerciseMedia } from '@/lib/exercises/media'

const w = t.workout

export default async function WorkoutDayPage({
  params,
}: {
  params: Promise<{ programId: string; dayOfWeek: string }>
}) {
  const { programId, dayOfWeek } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exercises } = await supabase
    .from('program_exercises')
    .select(`
      id, day_label, sort_order,
      target_sets, target_reps_min, target_reps_max,
      rest_seconds, coaching_cue, target_weight_kg,
      exercises ( name )
    `)
    .eq('program_id', programId)
    .eq('day_of_week', Number(dayOfWeek))
    .order('sort_order')

  if (!exercises?.length) redirect('/dashboard')

  const dayLabel = exercises[0].day_label

  const mediaResults = await Promise.all(
    exercises.map(pe => fetchExerciseMedia((pe.exercises as any)?.name ?? ''))
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-white text-sm border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          {w.back} →
        </Link>
        <h1 className="text-xl font-bold text-white">{dayLabel}</h1>
      </div>

      <div className="space-y-4">
        {exercises.map((pe, i) => {
          const name = (pe.exercises as any)?.name ?? ''
          const media = mediaResults[i]
          const hasWeight = typeof pe.target_weight_kg === 'number' && pe.target_weight_kg > 0

          return (
            <div key={pe.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

              {media.type === 'image' ? (
                <div className="w-full bg-zinc-800 flex items-center justify-center" style={{ minHeight: '160px' }}>
                  <img
                    src={media.url}
                    alt={name}
                    className="w-full object-contain max-h-52"
                  />
                </div>
              ) : (
                <div className="w-full bg-zinc-800/50 flex flex-col items-center justify-center gap-3 py-6">
                  <span className="text-4xl">🏋️</span>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    Watch tutorial on YouTube
                    <span>↗</span>
                  </a>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-white font-semibold">{name}</h3>
                </div>

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

      <Link
        href={`/workout/${programId}/${dayOfWeek}/active`}
        className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors text-base mt-6"
      >
        {w.startWorkout}
      </Link>
    </div>
  )
}
