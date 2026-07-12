import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/translations'
import DeleteWorkoutButton from '@/components/DeleteWorkoutButton'

const h = t.history

const RATING_EMOJIS = ['😫', '😕', '😐', '💪', '🔥']

function fmt(s: number) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}ש'`
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, day_label, day_of_week, completed_at, duration_seconds, rating, sets_completed')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(50)

  // Fetch set logs for each session
  const sessionIds = (sessions ?? []).map(s => s.id)
  const { data: allSetLogs } = sessionIds.length
    ? await supabase
        .from('set_logs')
        .select('session_id, exercise_name, set_number, weight_kg, reps')
        .in('session_id', sessionIds)
        .order('exercise_name')
        .order('set_number')
    : { data: [] }

  type SetLog = { session_id: string; exercise_name: string; set_number: number; weight_kg: number | null; reps: number | null }
  const logsBySession = (allSetLogs ?? []).reduce<Record<string, SetLog[]>>((acc, log) => {
    if (!acc[log.session_id]) acc[log.session_id] = []
    acc[log.session_id]!.push(log as SetLog)
    return acc
  }, {})

  const totalSessions = sessions?.length ?? 0
  const totalMinutes = (sessions ?? []).reduce((s, sess) => s + (sess.duration_seconds ?? 0), 0) / 60

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-white text-sm border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          {h.back} →
        </Link>
        <h1 className="text-xl font-bold text-white">{h.title}</h1>
      </div>

      {/* Stats row */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-orange-400 font-bold text-3xl">{totalSessions}</p>
            <p className="text-zinc-500 text-xs mt-1">{h.totalWorkouts}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-orange-400 font-bold text-3xl">{Math.round(totalMinutes / 60 * 10) / 10}</p>
            <p className="text-zinc-500 text-xs mt-1">{h.totalHours}</p>
          </div>
        </div>
      )}

      {/* Session list */}
      {!totalSessions ? (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-white font-semibold mb-1">{h.noHistory}</p>
          <p className="text-zinc-500 text-sm">{h.noHistorySub}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(sessions ?? []).map(sess => {
            const sessLogs = logsBySession[sess.id] ?? []
            // Group by exercise name
            const byExercise = sessLogs.reduce<Record<string, SetLog[]>>((acc, l) => {
              if (!acc[l.exercise_name]) acc[l.exercise_name] = []
              acc[l.exercise_name]!.push(l)
              return acc
            }, {})

            return (
              <details key={sess.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <div>
                    <p className="text-white font-semibold text-sm">{sess.day_label ?? `יום ${sess.day_of_week}`}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{fmtDate(sess.completed_at)}</p>
                    <div className="mt-1" onClick={e => e.preventDefault()}>
                      <DeleteWorkoutButton sessionId={sess.id} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sess.rating && (
                      <span className="text-lg">{RATING_EMOJIS[sess.rating - 1]}</span>
                    )}
                    <div className="text-right">
                      <p className="text-orange-400 text-sm font-mono font-bold">{fmt(sess.duration_seconds ?? 0)}</p>
                      <p className="text-zinc-600 text-[10px]">{sess.sets_completed ?? 0} {h.sets}</p>
                    </div>
                    <span className="text-zinc-600 text-xs group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>

                {/* Set logs detail */}
                {Object.keys(byExercise).length > 0 && (
                  <div className="px-5 pb-4 border-t border-zinc-800 pt-3 space-y-3">
                    {Object.entries(byExercise).map(([exName, exLogs]) => (
                      <div key={exName}>
                        <p className="text-zinc-400 text-xs font-semibold mb-1.5">{exName}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {exLogs!.map((l, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-lg"
                            >
                              {l.weight_kg ? `${l.weight_kg}ק״ג` : 'משקל גוף'} × {l.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}
