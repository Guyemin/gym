import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/translations'
import LogoutButton from '@/components/LogoutButton'

const d = t.dashboard

const WEEKS = [
  { label: 'בניית בסיס',  sub: '100% מהמשקל' },
  { label: 'הוספת עומס',  sub: '+5% משקל'    },
  { label: 'עומס שיא',   sub: '+10% משקל'    },
  { label: 'שחזור',       sub: 'דילוד 90%'   },
]

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
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-zinc-500 text-sm">{d.welcomeBack}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            {profile?.full_name ?? user!.email}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/history" className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-xl transition-colors">
            {t.history.link}
          </Link>
          <Link href="/coach" className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-xl transition-colors">
            {t.coach.dashboardLink}
          </Link>
          <Link href="/settings" className="text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-xl transition-colors">
            {t.settings.link}
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* BMI card */}
      {bmi && bmiInfo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-400 text-sm font-medium">{d.bmiTitle}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiInfo.badge}`}>{bmiInfo.label}</span>
          </div>
          <p className={`text-3xl font-bold mb-3 ${bmiInfo.color}`}>{bmi}</p>
          <div className="relative h-2 rounded-full overflow-hidden flex mb-1">
            <div className="w-[14%] bg-blue-500/60" />
            <div className="w-[26%] bg-green-500/60" />
            <div className="w-[20%] bg-orange-500/60" />
            <div className="flex-1 bg-red-500/60" />
            <div
              className="absolute top-1/2 w-3 h-3 bg-white rounded-full border-2 border-zinc-900 shadow"
              style={{ left: `${bmiMarkerPct}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </div>
      )}

      {/* Nutrition card */}
      {nutrition && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
          <p className="text-zinc-400 text-sm font-medium mb-3">{d.nutritionTitle}</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-orange-400 font-bold text-lg">{nutrition.calories}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{d.nutritionCalories}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-blue-400 font-bold text-lg">{nutrition.protein}g</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{d.nutritionProtein}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-yellow-400 font-bold text-lg">{nutrition.fat}g</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{d.nutritionFat}</p>
            </div>
            <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
              <p className="text-green-400 font-bold text-lg">{nutrition.carbs}g</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{d.nutritionCarbs}</p>
            </div>
          </div>
          {profile?.goal_weight_kg && profile?.weight_kg && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-white font-semibold text-sm">{profile.weight_kg} ק״ג</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">{d.currentWeight}</p>
              </div>
              <span className="text-zinc-600 text-lg">{d.weightArrow}</span>
              <div className="text-center">
                <p className="text-orange-400 font-semibold text-sm">{profile.goal_weight_kg} ק״ג</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">{d.goalWeight}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {program ? (
        <div className="space-y-4">

          {/* Program summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg leading-tight">{program.name}</h2>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">{program.description}</p>
              </div>
              <span className="shrink-0 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full border border-orange-500/30">
                {program.split_type}
              </span>
            </div>
            {/* This-week day dots */}
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <div className="flex gap-1">
                {days.map(day => (
                  <div
                    key={day.day}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      completedDays.has(day.day) ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-600'
                    }`}
                    title={day.label}
                  >
                    {completedDays.has(day.day) ? '✓' : day.day}
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 text-xs mr-auto">
                {weeklyCount}/{days.length} {d.weeklyProgress}
              </p>
              {remainingThisWeek > 0 && (
                <span className="text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  {remainingThisWeek} {d.remaining}
                </span>
              )}
            </div>
          </div>

          {/* Effort bar — 4-week progression */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">סרגל מאמצים</span>
              <span className="text-orange-400 text-xs font-medium bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                שבוע {currentWeek} מתוך 4
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WEEKS.map(({ label, sub }, idx) => {
                const n = idx + 1
                const isPast    = n < currentWeek
                const isCurrent = n === currentWeek
                return (
                  <div
                    key={n}
                    className={`rounded-xl p-3 text-center border transition-colors ${
                      isCurrent ? 'bg-orange-500/15 border-orange-500/40' :
                      isPast    ? 'bg-zinc-800/60 border-zinc-700' :
                                  'bg-zinc-900 border-zinc-800 opacity-35'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2 ${
                      isPast    ? 'bg-green-600 text-white' :
                      isCurrent ? 'bg-orange-500 text-white' :
                                  'bg-zinc-700 text-zinc-500'
                    }`}>
                      {isPast ? '✓' : n}
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${
                      isCurrent ? 'text-orange-400' : isPast ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>{label}</p>
                    <p className={`text-[10px] mt-1 ${isCurrent ? 'text-orange-500/70' : 'text-zinc-600'}`}>{sub}</p>
                  </div>
                )
              })}
            </div>
            {/* Connecting line behind the dots */}
            <div className="relative mt-3 mx-3 h-px bg-zinc-800">
              <div
                className="absolute top-0 left-0 h-full bg-orange-500/40 transition-all duration-700"
                style={{ width: `${((currentWeek - 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Training day cards */}
          {days.map(day => {
            const isDone = completedDays.has(day.day)
            return (
              <Link
                key={day.label}
                href={`/workout/${program.id}/${day.day}`}
                className={`block rounded-2xl p-5 border transition-colors ${
                  isDone
                    ? 'bg-green-950/20 border-green-800/40 hover:border-green-700'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${isDone ? 'text-green-400' : 'text-white'}`}>{day.label}</h3>
                  <div className="flex items-center gap-2">
                    {isDone && (
                      <span className="text-[10px] font-semibold text-green-400 bg-green-900/40 border border-green-800/50 px-2 py-0.5 rounded-full">
                        {d.completedThisWeek}
                      </span>
                    )}
                    <span className="text-zinc-500 text-xs">←</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {day.exercises.map((name, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {name}
                    </li>
                  ))}
                </ul>
              </Link>
            )
          })}

          <p className="text-center text-zinc-600 text-xs pt-2">
            {d.notExpected}{' '}
            <Link href="/onboarding" className="text-zinc-400 hover:text-white underline underline-offset-2">
              {d.regenerate}
            </Link>
          </p>
        </div>
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
