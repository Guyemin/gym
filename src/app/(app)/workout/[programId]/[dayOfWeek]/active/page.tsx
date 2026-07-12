import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchExerciseMedia, type MediaResult } from '@/lib/exercises/media'
import ActiveWorkout from '@/components/ActiveWorkout'

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ programId: string; dayOfWeek: string }>
}) {
  const { programId, dayOfWeek } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: exercises }, { data: programData }] = await Promise.all([
    supabase
      .from('program_exercises')
      .select(`
        id, day_label, sort_order,
        target_sets, target_reps_min, target_reps_max,
        rest_seconds, coaching_cue, target_weight_kg,
        exercises ( name )
      `)
      .eq('program_id', programId)
      .eq('day_of_week', Number(dayOfWeek))
      .order('sort_order'),
    supabase
      .from('workout_programs')
      .select('created_at')
      .eq('id', programId)
      .single(),
  ])

  if (!exercises?.length) redirect('/dashboard')

  const dayLabel = exercises[0].day_label

  // Week number within the 4-week cycle (1–4)
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const programAge = programData?.created_at
    ? Date.now() - new Date(programData.created_at).getTime()
    : 0
  const weekNumber = Math.min(4, Math.max(1, Math.floor(programAge / weekMs) + 1))

  const formatted = exercises.map(pe => ({
    id: pe.id,
    name: (pe.exercises as any)?.name ?? '',
    target_sets: pe.target_sets ?? 3,
    target_reps_min: pe.target_reps_min ?? 8,
    target_reps_max: pe.target_reps_max ?? 12,
    target_weight_kg: typeof pe.target_weight_kg === 'number' ? pe.target_weight_kg : null,
    rest_seconds: pe.rest_seconds ?? 90,
    coaching_cue: pe.coaching_cue ?? null,
  }))

  const media: MediaResult[] = await Promise.all(
    formatted.map(ex => fetchExerciseMedia(ex.name))
  )

  return (
    <ActiveWorkout
      exercises={formatted}
      dayLabel={dayLabel}
      media={media}
      programId={programId}
      dayOfWeek={dayOfWeek}
      weekNumber={weekNumber}
    />
  )
}
