export type MediaResult =
  | { type: 'image'; url: string }
  | { type: 'youtube'; url: string }

async function wgerSearch(term: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercisesearch/?term=${encodeURIComponent(term)}&language=english&format=json`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const hit = (data.suggestions ?? []).find((s: any) => s.data?.image)
    return hit?.data?.image ?? null
  } catch {
    return null
  }
}

export async function fetchExerciseMedia(exerciseName: string): Promise<MediaResult> {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' how to exercise tutorial')}`
  const image =
    (await wgerSearch(exerciseName)) ??
    (await wgerSearch(exerciseName.split(' ').slice(0, 2).join(' ')))
  return image ? { type: 'image', url: image } : { type: 'youtube', url: ytUrl }
}
