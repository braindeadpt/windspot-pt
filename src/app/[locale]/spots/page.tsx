import { readFileSync } from 'fs'
import { join } from 'path'
import { getTranslation } from '@/lib/i18n'
import { spots } from '@/lib/spots'
import { getAllSportScores } from '@/lib/sportScore'
import type { SportType } from '@/lib/sportRatings'
import SpotGrid from '@/components/spots/SpotGrid'
import type { Metadata } from 'next'

// FIX SEO1: Locale-aware metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isPt = locale === 'pt'
  
  const title = isPt ? `Todos os Spots — VenTu` : `All Spots — VenTu`
  const description = isPt 
    ? `Explora os ${spots.length} spots de surf, kitesurf e windsurf em Portugal com condições em tempo real.`
    : `Browse all ${spots.length} surf, kitesurf and windsurf spots in Portugal with real-time conditions.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ventu.surf/${locale}/spots`,
      siteName: 'VenTu',
      type: 'website',
      locale: isPt ? 'pt_PT' : 'en_US',
    },
    alternates: {
      canonical: `/${locale}/spots`,
      languages: {
        'pt': '/pt/spots',
        'en': '/en/spots',
      },
    },
  }
}

// ─── Load conditions at BUILD TIME from precomputed JSON ───
function loadConditions(): Record<string, any> {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'conditions.json')
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.warn('Failed to load conditions.json:', e)
    return {}
  }
}

export default async function SpotsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = getTranslation(locale as any) as any

  // Load precomputed conditions at build time (same as homepage)
  const precomputed = loadConditions()

  const conditions: Record<string, any> = {}
  const sportScores: Record<string, Record<SportType, any>> = {}

  for (const spot of spots) {
    const cond = precomputed[spot.id]
    if (cond) {
      const conditionsData = {
        waveHeight: cond.waveHeight || 0,
        wavePeriod: cond.wavePeriod || 0,
        waveDirection: cond.waveDirection || 0,
        windSpeed: cond.windSpeed || 0,
        windDirection: cond.windDirection || 0,
        windGust: cond.windGust || 0,
        waterTemp: cond.waterTemp || 0,
      }
      conditions[spot.id] = conditionsData
      sportScores[spot.id] = getAllSportScores(spot, conditionsData)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-fg">{t.spots.title}</h1>
        <p className="text-fg-muted mt-2">
          {locale === 'pt' ? `${spots.length} spots em Portugal com dados em tempo real` : `${spots.length} spots in Portugal with real-time data`}
        </p>
      </div>
      <SpotGrid
        spots={spots}
        locale={locale}
        conditions={conditions}
        sportScores={sportScores}
      />
    </div>
  )
}
