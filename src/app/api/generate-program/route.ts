import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  // 1. Verify the user is authenticated
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse form data
  const body = await request.json()
  const { age, gender, height_cm, weight_kg, goal_weight_kg, experience_level, primary_goal, days_per_week, equipment, injuries_notes } = body

  // 3. Save client profile
  await supabaseAdmin
    .from('profiles')
    .update({
      age: parseInt(age),
      gender,
      height_cm: parseFloat(height_cm),
      weight_kg: parseFloat(weight_kg),
      goal_weight_kg: goal_weight_kg ? parseFloat(goal_weight_kg) : null,
      experience_level,
      primary_goal,
      days_per_week: parseInt(days_per_week),
      equipment_available: equipment,
      injuries_notes: injuries_notes || null,
    })
    .eq('id', user.id)

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // 4. Build prompt
  const rawEquipment = equipment as string[]
  const equipmentList = rawEquipment.map((e: string) =>
    e === 'gym' ? 'full commercial gym (barbells, dumbbells, cables, machines, kettlebells, etc.)' : e
  ).join(', ')

  const prompt = buildPrompt({
    name: profile?.full_name ?? 'Client',
    age, gender, height_cm, weight_kg,
    experience_level, primary_goal, days_per_week,
    equipment: equipmentList,
    equipmentRaw: rawEquipment,
    injuries_notes: injuries_notes || 'None',
  })

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: missing AI key' }, { status: 500 })
  }

  // 5. Agent 1 — Generate program
  let programJson: any
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })
    const rawText = completion.choices[0]?.message?.content ?? ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    programJson = JSON.parse(jsonMatch[0])
  } catch (err: any) {
    console.error('Generator agent error:', err?.message ?? err)
    return NextResponse.json({ error: `AI generation failed: ${err?.message ?? 'unknown'}` }, { status: 500 })
  }

  // 5b. Agent 2 — Validate & correct program
  console.log('[Agent 2] Running validation on generated program...')
  const originalDays = programJson.days?.length ?? 0
  programJson = await validateAndCorrectProgram(programJson, { experience_level, weight_kg: parseFloat(weight_kg), primary_goal, equipment: rawEquipment })
  console.log(`[Agent 2] Validation complete. Days: ${programJson.days?.length ?? 0} (was ${originalDays})`)

  // 6. Save program
  const { data: program, error: programError } = await supabaseAdmin
    .from('workout_programs')
    .insert({
      client_id: user.id,
      coach_id: null,
      name: programJson.name,
      description: programJson.description,
      split_type: programJson.split_type,
      weeks_duration: 4,
      status: 'active',
      ai_model_used: 'llama-3.3-70b-versatile',
      ai_prompt_used: prompt,
      program_json: programJson,
    })
    .select('id')
    .single()

  if (programError || !program) {
    console.error('Program insert error:', programError)
    return NextResponse.json({ error: 'Failed to save program' }, { status: 500 })
  }

  // 7. Save exercises
  for (const day of programJson.days ?? []) {
    for (let i = 0; i < (day.exercises ?? []).length; i++) {
      const ex = day.exercises[i]

      const { data: existing } = await supabaseAdmin
        .from('exercises')
        .select('id')
        .ilike('name', ex.name)
        .limit(1)
        .maybeSingle()

      let exerciseId: string | null = existing?.id ?? null
      if (!exerciseId) {
        const { data: newEx } = await supabaseAdmin
          .from('exercises')
          .insert({ name: ex.name })
          .select('id')
          .single()
        exerciseId = newEx?.id ?? null
      }

      await supabaseAdmin
        .from('program_exercises')
        .insert({
          program_id: program.id,
          exercise_id: exerciseId,
          day_of_week: day.day_of_week,
          day_label: day.day_label,
          sort_order: i,
          target_sets: ex.target_sets,
          target_reps_min: ex.target_reps_min,
          target_reps_max: ex.target_reps_max,
          target_weight_kg: typeof ex.suggested_weight_kg === 'number' ? ex.suggested_weight_kg : null,
          rest_seconds: ex.rest_seconds ?? 90,
          coaching_cue: ex.coaching_cue ?? null,
        })
    }
  }

  return NextResponse.json({ success: true, programId: program.id })
}

async function validateAndCorrectProgram(
  programJson: any,
  client: { experience_level: string; weight_kg: number; primary_goal: string; equipment: string[] }
): Promise<any> {
  const isBodyweightOnly = client.equipment.length === 1 && client.equipment[0] === 'bodyweight'
  const equipmentStr = isBodyweightOnly
    ? 'bodyweight only — no barbells, dumbbells, cables, or machines'
    : client.equipment.join(', ')

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        {
          role: 'system',
          content: `You are a professional workout program validator for an Israeli gym coaching app.
Review the workout program JSON and fix any of these issues if present:
1. EXERCISE ORDER: Each day must start with compound movements before isolation exercises.
2. VOLUME: Each day must have 4–7 exercises. Trim or add as needed.
3. WEIGHTS: suggested_weight_kg must be realistic for a ${client.experience_level} trainee at ${client.weight_kg}kg. Bodyweight exercises must have null.
4. HEBREW: day_label and coaching_cue must be in colloquial Israeli Hebrew. Fix any English text in those fields.
5. CONSISTENCY: exercise "name" fields must remain in English.
6. EQUIPMENT: Available equipment is: ${equipmentStr}. ${isBodyweightOnly ? 'REMOVE any exercise using barbells, dumbbells, cables, or machines. Replace with bodyweight alternatives: Push-Ups, Pull-Ups, Dips, Bodyweight Squats, Lunges, Glute Bridge, Plank, Mountain Climbers, Burpees.' : 'Remove any exercise requiring equipment NOT in this list.'}
Return ONLY the corrected JSON object, nothing else.`,
        },
        { role: 'user', content: JSON.stringify(programJson) },
      ],
    })
    const rawText = completion.choices[0]?.message?.content ?? ''
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) return programJson
    return JSON.parse(match[0])
  } catch {
    return programJson
  }
}

function buildPrompt(p: {
  name: string; age: string; gender: string; height_cm: string; weight_kg: string
  experience_level: string; primary_goal: string; days_per_week: string
  equipment: string; equipmentRaw: string[]; injuries_notes: string
}): string {
  const goalMap: Record<string, string> = {
    hypertrophy: 'בניית שריר',
    strength: 'להתחזק',
    fat_loss: 'להיות חטוב',
    general_fitness: 'כושר כללי',
  }
  const levelMap: Record<string, string> = {
    beginner: 'מתחיל',
    intermediate: 'בינוני',
    advanced: 'מתקדם',
  }
  const weightRanges: Record<string, string> = {
    beginner: `Barbell Back Squat: 40–60kg | Barbell Bench Press: 30–50kg | Deadlift: 50–70kg | Barbell Row: 30–45kg | OHP: 25–35kg | Dumbbells: 8–16kg`,
    intermediate: `Barbell Back Squat: 80–100kg | Barbell Bench Press: 70–90kg | Deadlift: 100–130kg | Barbell Row: 60–80kg | OHP: 50–65kg | Dumbbells: 16–28kg`,
    advanced: `Barbell Back Squat: 120–160kg | Barbell Bench Press: 100–130kg | Deadlift: 140–180kg | Barbell Row: 90–110kg | OHP: 70–90kg | Dumbbells: 28–42kg`,
  }

  const isBodyweightOnly = p.equipmentRaw.length === 1 && p.equipmentRaw[0] === 'bodyweight'
  const equipmentConstraint = isBodyweightOnly
    ? `⚠️ BODYWEIGHT ONLY — ABSOLUTE RULE: Do NOT include any exercise using barbells, dumbbells, cables, resistance bands, or machines. This is non-negotiable.
ONLY use these exercises: Push-Ups, Wide Push-Ups, Diamond Push-Ups, Pike Push-Ups, Decline Push-Ups, Pull-Ups, Chin-Ups, Inverted Rows, Dips, Triceps Dips, Bodyweight Squats, Jump Squats, Bulgarian Split Squats, Lunges, Reverse Lunges, Step-Ups, Glute Bridge, Single-Leg Glute Bridge, Hip Thrust (bodyweight), Plank, Side Plank, Mountain Climbers, Burpees, Hollow Body Hold, Leg Raises, Flutter Kicks, Superman.`
    : `Available equipment: ${p.equipment}. Use ONLY exercises possible with this equipment. Do NOT add exercises requiring equipment not listed.`

  return `You are an elite Israeli personal trainer. Generate a personalized workout program.

CLIENT:
- Name: ${p.name}
- Age: ${p.age} | Gender: ${p.gender} | Height: ${p.height_cm}cm | Weight: ${p.weight_kg}kg
- Level: ${levelMap[p.experience_level] ?? p.experience_level}
- Goal: ${goalMap[p.primary_goal] ?? p.primary_goal}
- Training days/week: ${p.days_per_week}
- Injuries/Limitations: ${p.injuries_notes}

EQUIPMENT — MANDATORY CONSTRAINT:
${equipmentConstraint}

LANGUAGE — MANDATORY:
Write "name", "description", "day_label", "coaching_cue" in natural Israeli Hebrew gym slang.
Examples:
✅ day_label: "יום דחיפה א׳" / "יום משיכה" / "יום רגליים" / "גוף מלא"
✅ coaching_cue: "גב ישר, בטן מהודקת, לדחוף עד למעלה" (short, direct, like a trainer mid-set)
✅ program name: "PPL · ${p.days_per_week} ימים" or "כוח עליון-תחתון · ${p.days_per_week} ימים"
❌ Never use: "היפרטרופיה", "להירזם", "כושר גופני", "תנועה מורכבת"
Exercise "name" field MUST stay in English (e.g. "Barbell Bench Press").

WEIGHT SUGGESTIONS for ${levelMap[p.experience_level] ?? p.experience_level} at ${p.weight_kg}kg bodyweight:
Reference ranges: ${weightRanges[p.experience_level] ?? weightRanges.intermediate}
Scale proportionally to client weight. For bodyweight exercises (Pull-Ups, Push-Ups, Dips): suggested_weight_kg = null.

REQUIREMENTS:
- Exactly ${p.days_per_week} training days
- Avoid aggravating: ${p.injuries_notes}
- Compound movements FIRST each day, isolation LAST
- Beginner: 4–5 exercises/day | Intermediate/Advanced: 5–7/day
- hypertrophy: 3–5 sets, 8–15 reps, 60–90s rest
- strength: 3–6 sets, 3–6 reps, 120–240s rest
- fat_loss: 3–4 sets, 12–20 reps, 30–60s rest
- general_fitness: 3 sets, 10–15 reps, 60s rest
- day_of_week: 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri (skip rest days)

Return ONLY valid JSON, no markdown, no text outside the JSON:
{
  "name": "PPL · 3 ימים",
  "description": "תיאור קצר של הגישה בעברית, 2-3 משפטים.",
  "split_type": "PPL",
  "days": [
    {
      "day_of_week": 1,
      "day_label": "יום דחיפה א׳",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "target_sets": 4,
          "target_reps_min": 8,
          "target_reps_max": 12,
          "rest_seconds": 90,
          "suggested_weight_kg": 40,
          "coaching_cue": "חזה לחוץ, שכמות נסוגות, לדחוף בפיצוץ"
        }
      ]
    }
  ]
}`
}
