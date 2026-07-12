import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { programId, dayOfWeek, dayLabel, durationSeconds, rating, setsCompleted, setLogs } = await request.json()

  const { data: session } = await supabaseAdmin
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      program_id: programId,
      day_of_week: Number(dayOfWeek),
      day_label: dayLabel ?? null,
      duration_seconds: durationSeconds ?? null,
      rating: rating ?? null,
      sets_completed: setsCompleted ?? null,
    })
    .select('id')
    .single()

  // Save per-set logs if provided and session was created
  if (session?.id && Array.isArray(setLogs) && setLogs.length > 0) {
    await supabaseAdmin
      .from('set_logs')
      .insert(
        setLogs.map((s: { exerciseName: string; setNumber: number; weightKg: number | null; reps: number }) => ({
          session_id: session.id,
          exercise_name: s.exerciseName,
          set_number: s.setNumber,
          weight_kg: s.weightKg ?? null,
          reps: s.reps ?? null,
        }))
      )
  }

  return NextResponse.json({ success: true })
}
