// Types and constants for sports — scoring logic moved to sportScore.ts

export type SportType = 'surf' | 'kitesurf' | 'windsurf' | 'wakeboard' | 'bodyboard' | 'sup'

export const SPORT_LABELS: Record<SportType, { pt: string; en: string }> = {
  surf: { pt: 'Surf', en: 'Surf' },
  kitesurf: { pt: 'Kitesurf', en: 'Kitesurf' },
  windsurf: { pt: 'Windsurf', en: 'Windsurf' },
  wakeboard: { pt: 'Wakeboard', en: 'Wakeboard' },
  bodyboard: { pt: 'Bodyboard', en: 'Bodyboard' },
  sup: { pt: 'SUP', en: 'SUP' },
}

export const ALL_SPORTS: SportType[] = ['surf', 'kitesurf', 'windsurf', 'wakeboard', 'bodyboard', 'sup']
