import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { t } from '@/lib/i18n/translations'

const c = t.coach
const goals = t.onboarding.goals
const levels = t.onboarding

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Query all clients who have completed onboarding, with their programs
  const { data: clients } = await supabaseAdmin
    .from('profiles')
    .select(`
      id, full_name, primary_goal, experience_level, age, gender,
      workout_programs ( id, status, split_type )
    `)
    .not('primary_goal', 'is', null)
    .order('created_at', { ascending: false })

  const totalClients = clients?.length ?? 0
  const withActiveProgram = clients?.filter(cl =>
    (cl.workout_programs as any[])?.some((p: any) => p.status === 'active')
  ).length ?? 0
  const beginners = clients?.filter(cl => cl.experience_level === 'beginner').length ?? 0

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-zinc-500 text-sm">לוח בקרה</p>
          <h1 className="text-2xl font-bold text-white">{c.title}</h1>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-xl transition-colors"
        >
          {c.clientView}
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{totalClients}</p>
          <p className="text-zinc-500 text-sm mt-1">{c.totalClients}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{withActiveProgram}</p>
          <p className="text-zinc-500 text-sm mt-1">{c.activePrograms}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-orange-400">{beginners}</p>
          <p className="text-zinc-500 text-sm mt-1">{c.beginners}</p>
        </div>
      </div>

      {/* Client list */}
      <h2 className="text-lg font-semibold text-white mb-4">{c.clientList}</h2>

      {!clients?.length ? (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-10 text-center text-zinc-500">
          {c.noClients}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => {
            const activeProgram = (client.workout_programs as any[])?.find((p: any) => p.status === 'active')
            return (
              <Link
                key={client.id}
                href={`/coach/client/${client.id}`}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl px-5 py-4 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{client.full_name ?? 'ללא שם'}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {goalLabel(client.primary_goal)} · {levelLabel(client.experience_level)}
                    {client.age ? ` · ${client.age} שנה` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activeProgram ? (
                    <span className="text-xs text-green-400 bg-green-950/40 border border-green-800/50 px-2.5 py-1 rounded-full">
                      {activeProgram.split_type ?? c.activeBadge}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-full">
                      {c.noProgramBadge}
                    </span>
                  )}
                  <span className="text-zinc-600 text-sm">←</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
