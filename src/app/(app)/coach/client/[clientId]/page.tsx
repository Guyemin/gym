import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { t } from '@/lib/i18n/translations'

const c = t.coach
const goals = t.onboarding.goals
const levels = t.onboarding

export default async function CoachClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, primary_goal, experience_level, age, gender, height_cm, weight_kg, days_per_week, equipment_available, injuries_notes')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  const { data: program } = await supabaseAdmin
    .from('workout_programs')
    .select(`
      id, name, description, split_type, created_at,
      program_exercises (
        id, day_label, day_of_week, sort_order,
        target_sets, target_reps_min, target_reps_max,
        target_weight_kg, rest_seconds,
        exercises ( name )
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Group exercises by day
  type DayGroup = { label: string; day: number; exercises: any[] }
  const days: DayGroup[] = program
    ? Object.values(
        (program.program_exercises as any[]).reduce<Record<string, DayGroup>>(
          (acc, pe) => {
            const key = pe.day_label
            if (!acc[key]) acc[key] = { label: pe.day_label, day: pe.day_of_week, exercises: [] }
            acc[key].exercises.push(pe)
            return acc
          },
          {}
        )
      ).sort((a, b) => a.day - b.day)
    : []

  function goalLabel(key: string | null) {
    if (!key) return '—'
    return (goals as any)[key]?.label ?? key
  }
  function levelLabel(key: string | null) {
    if (key === 'beginner') return levels.beginner
    if (key === 'intermediate') return levels.intermediate
    if (key === 'advanced') return levels.advanced
    return key ?? '—'
  }

  const equipment = Array.isArray(client.equipment_available)
    ? (client.equipment_available as string[]).map(e => (t.onboarding.equipmentOptions as any)[e] ?? e).join(', ')
    : client.equipment_available ?? c.none

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/coach"
          className="text-zinc-400 hover:text-white text-sm border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          {c.backToCoach} →
        </Link>
        <h1 className="text-xl font-bold text-white">{client.full_name ?? c.clientProfile}</h1>
      </div>

      {/* Bio stats */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">{c.bioStats}</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">מטרה</span>
            <span className="text-white font-medium">{goalLabel(client.primary_goal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">רמה</span>
            <span className="text-white font-medium">{levelLabel(client.experience_level)}</span>
          </div>
          {client.age && (
            <div className="flex justify-between">
              <span className="text-zinc-500">גיל</span>
              <span className="text-white font-medium">{client.age}</span>
            </div>
          )}
          {client.gender && (
            <div className="flex justify-between">
              <span className="text-zinc-500">מין</span>
              <span className="text-white font-medium">
                {client.gender === 'male' ? 'זכר' : client.gender === 'female' ? 'נקבה' : client.gender}
              </span>
            </div>
          )}
          {client.height_cm && (
            <div className="flex justify-between">
              <span className="text-zinc-500">גובה</span>
              <span className="text-white font-medium">{client.height_cm} ס״מ</span>
            </div>
          )}
          {client.weight_kg && (
            <div className="flex justify-between">
              <span className="text-zinc-500">משקל</span>
              <span className="text-white font-medium">{client.weight_kg} ק״ג</span>
            </div>
          )}
          {client.days_per_week && (
            <div className="flex justify-between">
              <span className="text-zinc-500">ימי אימון</span>
              <span className="text-white font-medium">{client.days_per_week}/שבוע</span>
            </div>
          )}
        </div>

        {client.equipment_available && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs mb-1">{c.equipment}</p>
            <p className="text-white text-sm">{equipment}</p>
          </div>
        )}

        {client.injuries_notes && (
          <div className="mt-3">
            <p className="text-zinc-500 text-xs mb-1">{c.injuries}</p>
            <p className="text-zinc-300 text-sm">{client.injuries_notes}</p>
          </div>
        )}
      </div>

      {/* Active program */}
      <h2 className="text-white font-semibold mb-4">{c.activeProgram}</h2>

      {!program ? (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-8 text-center text-zinc-500">
          {c.noProgram}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Program summary card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">{program.name}</h3>
                <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{program.description}</p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30">
                {program.split_type}
              </span>
            </div>
          </div>

          {/* Day breakdown */}
          {days.map(day => (
            <div key={day.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{day.label}</h3>
                <span className="text-zinc-600 text-xs">{day.exercises.length} תרגילים</span>
              </div>
              <div className="space-y-3">
                {day.exercises
                  .sort((a: any, b: any) => a.sort_order - b.sort_order)
                  .map((pe: any) => {
                    const name = pe.exercises?.name ?? ''
                    const hasWeight = typeof pe.target_weight_kg === 'number' && pe.target_weight_kg > 0
                    return (
                      <div key={pe.id} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-zinc-200 text-sm">{name}</span>
                          <span className="text-zinc-600 text-xs mr-2">
                            {' '}·{' '}{pe.target_sets}×{pe.target_reps_min}–{pe.target_reps_max}
                            {hasWeight ? ` · ${pe.target_weight_kg}kg` : ''}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}

          <Link
            href={`/workout/${program.id}/${days[0]?.day}`}
            className="block w-full text-center py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium rounded-xl transition-colors text-sm"
          >
            צפה בתוכנית המלאה →
          </Link>
        </div>
      )}
    </div>
  )
}
