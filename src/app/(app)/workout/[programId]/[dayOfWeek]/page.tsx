import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/translations'
import { fetchExerciseMedia } from '@/lib/exercises/media'
import WorkoutDayExercises from '@/components/WorkoutDayExercises'

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

  const exercisesWithMedia = exercises.map((pe, i) => ({
    ...pe,
    exercises: (pe.exercises as any) as { name: string } | null,
    mediaType: mediaResults[i].type as 'image' | 'youtube',
    mediaUrl: mediaResults[i].url,
  }))

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

      <WorkoutDayExercises exercises={exercisesWithMedia} />

      <Link
        href={`/workout/${programId}/${dayOfWeek}/active`}
        className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors text-base mt-6"
      >
        {w.startWorkout}
      </Link>
    </div>
  )
}
