'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n/translations'

const o = t.onboarding

type FormData = {
  age: string
  gender: string
  height_cm: string
  weight_kg: string
  goal_weight_kg: string
  experience_level: string
  primary_goal: string
  days_per_week: string
  equipment: string[]
  injuries_notes: string
}

const EQUIPMENT_IDS = ['barbell', 'dumbbell', 'cable', 'machine', 'kettlebell', 'bodyweight', 'gym'] as const
const GOAL_KEYS    = ['hypertrophy', 'strength', 'fat_loss', 'general_fitness'] as const
const LEVEL_KEYS   = ['beginner', 'intermediate', 'advanced'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [agentStage, setAgentStage] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!generating) { setAgentStage(1); return }
    const timer = setTimeout(() => setAgentStage(2), 16000)
    return () => clearTimeout(timer)
  }, [generating])

  const [form, setForm] = useState<FormData>({
    age: '', gender: '', height_cm: '', weight_kg: '', goal_weight_kg: '',
    experience_level: '', primary_goal: '',
    days_per_week: '4',
    equipment: ['barbell', 'dumbbell', 'cable'],
    injuries_notes: '',
  })

  // Pre-fill from saved profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('age, gender, height_cm, weight_kg, goal_weight_kg, experience_level, primary_goal, days_per_week, equipment_available, injuries_notes')
        .eq('id', user.id)
        .single()
      if (!data) return
      setForm(prev => ({
        ...prev,
        age: data.age?.toString() ?? prev.age,
        gender: data.gender ?? prev.gender,
        height_cm: data.height_cm?.toString() ?? prev.height_cm,
        weight_kg: data.weight_kg?.toString() ?? prev.weight_kg,
        goal_weight_kg: data.goal_weight_kg?.toString() ?? prev.goal_weight_kg,
        experience_level: data.experience_level ?? prev.experience_level,
        primary_goal: data.primary_goal ?? prev.primary_goal,
        days_per_week: data.days_per_week?.toString() ?? prev.days_per_week,
        equipment: (data.equipment_available as string[]) ?? prev.equipment,
        injuries_notes: data.injuries_notes ?? prev.injuries_notes,
      }))
    }
    loadProfile()
  }, [])

  function set(field: keyof FormData, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleEquipment(id: string) {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.includes(id)
        ? prev.equipment.filter(e => e !== id)
        : [...prev.equipment, id],
    }))
  }

  async function handleSubmit() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה, נסה שוב.')
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-10">
            <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white">{o.loadingTitle}</h2>
          </div>

          {/* Agent 1 */}
          <div className={`flex items-start gap-4 p-4 rounded-2xl mb-3 transition-all duration-500 ${
            agentStage === 1 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-zinc-900 border border-zinc-800 opacity-60'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              agentStage === 1 ? 'bg-orange-500' : 'bg-green-600'
            }`}>
              {agentStage === 1
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="text-white text-xs font-bold">✓</span>
              }
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{o.agent1Title}</p>
              <p className="text-zinc-400 text-xs mt-0.5">{o.agent1Sub}</p>
            </div>
          </div>

          {/* Agent 2 */}
          <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
            agentStage === 2 ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-zinc-900 border border-zinc-800 opacity-40'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              agentStage === 2 ? 'bg-orange-500' : 'bg-zinc-700'
            }`}>
              {agentStage === 2
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <span className="text-zinc-500 text-xs font-bold">2</span>
              }
            </div>
            <div>
              <p className={`font-semibold text-sm ${agentStage === 2 ? 'text-white' : 'text-zinc-500'}`}>{o.agent2Title}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{o.agent2Sub}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">

      {/* Step progress bar */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-orange-500' : 'bg-zinc-800'}`}
          />
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{o.step1Title}</h1>
            <p className="text-zinc-400 text-sm mt-1">{o.step1Sub}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">{o.age}</label>
              <input
                type="number" inputMode="numeric"
                value={form.age} onChange={e => set('age', e.target.value)}
                placeholder={o.agePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">{o.gender}</label>
              <select
                value={form.gender} onChange={e => set('gender', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              >
                <option value="">{o.genderSelect}</option>
                <option value="male">{o.male}</option>
                <option value="female">{o.female}</option>
                <option value="other">{o.other}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">{o.height}</label>
              <input
                type="number" inputMode="numeric"
                value={form.height_cm} onChange={e => set('height_cm', e.target.value)}
                placeholder={o.heightPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">{o.weight}</label>
              <input
                type="number" inputMode="numeric"
                value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)}
                placeholder={o.weightPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {o.goalWeight}{' '}
              <span className="text-zinc-500 font-normal">{o.goalWeightOptional}</span>
            </label>
            <input
              type="number" inputMode="numeric"
              value={form.goal_weight_kg} onChange={e => set('goal_weight_kg', e.target.value)}
              placeholder={o.goalWeightPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!form.age || !form.gender || !form.height_cm || !form.weight_kg}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
          >
            {o.continueBtn}
          </button>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{o.step2Title}</h1>
            <p className="text-zinc-400 text-sm mt-1">{o.step2Sub}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">{o.primaryGoal}</label>
            <div className="space-y-2">
              {GOAL_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => set('primary_goal', key)}
                  className={`w-full text-start px-4 py-3.5 rounded-xl border transition-colors ${
                    form.primary_goal === key
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{o.goals[key].label}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{o.goals[key].sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">{o.experienceLevel}</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVEL_KEYS.map(level => (
                <button
                  key={level}
                  onClick={() => set('experience_level', level)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                    form.experience_level === level
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {o[level]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              {o.daysPerWeek}{' '}
              <span className="text-orange-400 font-bold">{form.days_per_week}</span>
            </label>
            {/* Range slider is always LTR so the numbers increase left→right */}
            <input
              type="range" min="2" max="6" dir="ltr"
              value={form.days_per_week}
              onChange={e => set('days_per_week', e.target.value)}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1.5">
              <span>{o.minDays}</span>
              <span>{o.maxDays}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 border border-zinc-700 text-zinc-300 hover:border-zinc-500 font-semibold rounded-xl transition-colors"
            >
              {o.backBtn}
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.primary_goal || !form.experience_level}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
            >
              {o.continueBtn}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{o.step3Title}</h1>
            <p className="text-zinc-400 text-sm mt-1">{o.step3Sub}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">{o.availableEquipment}</label>
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_IDS.map(id => (
                <button
                  key={id}
                  onClick={() => toggleEquipment(id)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium text-start transition-colors ${
                    form.equipment.includes(id)
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {o.equipmentOptions[id]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {o.injuries}{' '}
              <span className="text-zinc-500 font-normal">{o.injuriesOptional}</span>
            </label>
            <textarea
              value={form.injuries_notes}
              onChange={e => set('injuries_notes', e.target.value)}
              rows={3}
              placeholder={o.injuriesPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3.5 border border-zinc-700 text-zinc-300 hover:border-zinc-500 font-semibold rounded-xl transition-colors"
            >
              {o.backBtn}
            </button>
            <button
              onClick={handleSubmit}
              disabled={form.equipment.length === 0}
              className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-colors"
            >
              {o.submitBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
