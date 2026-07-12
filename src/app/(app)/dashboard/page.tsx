import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/translations'

const d = t.dashboard

function getBmiInfo(bmi: number) {
  if (bmi < 18.5) return { label: d.bmiUnder, color: 'text-blue-400',   badge: 'bg-blue-500/20 border-blue-500/30 text-blue-400' }
  if (bmi < 25)   return { label: d.bmiNormal, color: 'text-green-400', badge: 'bg-green-500/20 border-green-500/30 text-green-400' }
  if (bmi < 30)   return { label: d.bmiOver,   color: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500/30 text-orange-400' }
  return            { label: d.bmiObese,  color: 'text-red-400',   badge: 'bg-red-500/20 border-red-500/30 text-red-400' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, primary_goal, experience_level, height_cm, weight_kg, goal_weight_kg, age, gender, days_per_week')
    .eq('id', user!.id)
    .single()

  if (!profile?.primary_goal) redirect('/onboarding')

  const { data: program } = await supabase
    .from('workout_programs')
    .select(`
      id, name, description, split_type, created_at,
      program_exercises (
        id, day_label, day_of_week, sort_order,
        exercises ( name )
      )
    `)
    .eq('client_id', user!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Current week within the 4-week program cycle
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const programAge = program?.created_at
    ? Date.now() - new Date(program.created_at).getTime()
    : 0
  const currentWeek = Math.min(4, Math.max(1, Math.floor(programAge / weekMs) + 1))

  // Completed sessions this week
  const sevenDaysAgo = new Date(Date.now() - weekMs).toISOString()
  const { data: sessions } = program
    ? await supabase
        .from('workout_sessions')
        .select('day_of_week, rating, completed_at')
        .eq('program_id', program.id)
        .gte('completed_at', sevenDaysAgo)
    : { data: null }

  const completedDays = new Set((sessions ?? []).map((s: any) => Number(s.day_of_week)))
  const weeklyCount = completedDays.size

  type DayGroup = { label: string; day: number; exercises: string[] }
  const days: DayGroup[] = program
    ? Object.values(
        (program.program_exercises as any[]).reduce<Record<string, DayGroup>>(
          (acc, pe) => {
            const key = pe.day_label
            if (!acc[key]) acc[key] = { label: pe.day_label, day: pe.day_of_week, exercises: [] }
            acc[key].exercises.push(pe.exercises?.name ?? '')
            return acc
          },
          {}
        )
      ).sort((a, b) => a.day - b.day)
    : []

  // BMI
  const bmi =
    profile?.height_cm && profile?.weight_kg
      ? Math.round((profile.weight_kg / Math.pow(profile.height_cm / 100, 2)) * 10) / 10
      : null
  const bmiInfo = bmi ? getBmiInfo(bmi) : null
  const bmiMarkerPct = bmi ? Math.min(Math.max(((bmi - 15) / 25) * 100, 2), 97) : 0

  // Nutrition (Mifflin-St Jeor BMR → TDEE → goal adjustment)
  type NutritionPlan = { calories: number; protein: number; fat: number; carbs: number }
  let nutrition: NutritionPlan | null = null
  if (profile?.weight_kg && profile?.height_cm && profile?.age) {
    const w = profile.weight_kg, h = profile.height_cm, a = profile.age
    const bmr = profile.gender === 'female'
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5
    const daysPerWeek = profile.days_per_week ?? 4
    const activityMultiplier = daysPerWeek <= 2 ? 1.375 : daysPerWeek <= 4 ? 1.55 : 1.725
    const tdee = Math.round(bmr * activityMultiplier)
    const goalAdjustment: Record<string, number> = {
      fat_loss: -400, hypertrophy: 300, strength: 200, general_fitness: 0,
    }
    const calories = tdee + (goalAdjustment[profile.primary_goal ?? ''] ?? 0)
    const protein = Math.round(w * (profile.primary_goal === 'general_fitness' ? 1.6 : 2.0))
    const fat = Math.round((calories * 0.27) / 9)
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
    nutrition = { calories, protein, fat, carbs }
  }

  const remainingThisWeek = Math.max(0, days.length - weeklyCount)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-4">

      {/* Welcome */}
      <div className="mb-2">
        <p className="text-zinc-500 text-sm">{d.welcomeBack}</p>
        <h1 className="text-3xl font-bold text-white mt-0.5">
          {profile?.full_name?.split(' ')[0] ?? user!.email}
        </h1>
      </div>

      {/* BMI card */}
      {bmi && bmiInfo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">{d.bmiTitle}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiInfo.badge}`}>{bmiInfo.label}</span>
          </div>
          <p className={`text-4xl font-black mb-4 ${bmiInfo.color}`}>{bmi}</p>
          <div className="relative h-2 rounded-full overflow-hidden flex mb-2">
            <div className="w-[14%] bg-blue-500" />
            <div className="w-[26%] bg-green-500" />
            <div className="w-[20%] bg-orange-500" />
            <div className="flex-1 bg-red-500" />
            <div
              className="absolute top-1/2 w-3 h-3 bg-white rounded-full border-2 border-zinc-900 shadow-lg"
              style={{ left: `${bmiMarkerPct}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>תת משקל</span><span>תקין</span><span>עודף</span><span>השמנה</span>
          </div>
        </div>
      )}

      {/* Nutrition card */}
      {nutrition && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">{d.nutritionTitle}</span>
            <span className="text-white font-black text-xl">{nutrition.calories} <span className="text-zinc-500 text-xs font-normal">קל׳</span></span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-orange-500/20 border border-orange-500/30 rounded-xl px-3 py-2.5 text-center">
              <p className="text-orange-400 font-black text-base">{nutrition.protein}g</p>
              <p className="text-orange-500/70 text-[10px] font-semibold uppercase mt-0.5">{d.nutritionProtein}</p>
            </div>
            <div className="flex-1 bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-2.5 text-center">
              <p className="text-blue-400 font-black text-base">{nutrition.fat}g</p>
              <p className="text-blue-500/70 text-[10px] font-semibold uppercase mt-0.5">{d.nutritionFat}</p>
            </div>
            <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-2.5 text-center">
              <p className="text-green-400 font-black text-base">{nutrition.carbs}g</p>
              <p className="text-green-500/70 text-[10px] font-semibold uppercase mt-0.5">{d.nutritionCarbs}</p>
            </div>
          </div>
          {profile?.goal_weight_kg && profile?.weight_kg && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
              <div>
                <p className="text-white font-semibold text-sm">{profile.weight_kg} ק״ג</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">{d.currentWeight}</p>
              </div>
              <div className="flex-1 mx-3 h-px bg-zinc-700 relative">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-orange-500/40" />
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-semibold text-sm">{profile.goal_weight_kg} ק״ג</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">{d.goalWeight}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {program ? (
        <>
          {/* 4-week block — horizontal bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-semibold text-sm">4-Week Block</span>
              <span className="text-orange-400 text-xs font-medium">שבוע {currentWeek} מתוך 4</span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden">
              {[1, 2, 3, 4].map(n => (
                <div
                  key={n}
                  className={`flex-1 rounded-full transition-colors ${
                    n < currentWeek  ? 'bg-green-500' :
                    n === currentWeek ? 'bg-orange-500' :
                                        'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Training day cards */}
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">האימונים השבוע</p>
            <div className="space-y-3">
              {days.map(day => {
                const isDone = completedDays.has(day.day)
                return (
                  <Link
                    key={day.label}
                    href={`/workout/${program.id}/${day.day}`}
                    className={`block rounded-2xl p-5 border transition-colors ${
                      isDone
                        ? 'bg-green-950/30 border-green-800/50 hover:border-green-700'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-bold text-base ${isDone ? 'text-green-400' : 'text-white'}`}>{day.label}</h3>
                      {isDone
                        ? <span className="text-green-400 text-lg font-bold">✓</span>
                        : <span className="text-zinc-600 text-sm">←</span>
                      }
                    </div>
                    <ul className="space-y-1.5">
                      {day.exercises.map((name, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-400">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-green-500' : 'bg-orange-500'}`} />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </Link>
                )
              })}
            </div>
          </div>

          <p className="text-center text-zinc-600 text-xs pt-1">
            {d.notExpected}{' '}
            <Link href="/onboarding" className="text-zinc-400 hover:text-white underline underline-offset-2">
              {d.regenerate}
            </Link>
          </p>
        </>
      ) : (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-white font-semibold mb-1">{d.noProgram}</h3>
          <p className="text-zinc-500 text-sm mb-6">{d.noProgramSub}</p>
          <Link href="/onboarding" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-colors">
            {d.startOnboarding}
          </Link>
        </div>
      )}
    </div>
  )
}
