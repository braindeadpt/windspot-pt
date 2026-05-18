import type { NewsItem } from '@/types'
import fs from 'fs'
import path from 'path'

export async function loadNews(): Promise<NewsItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'public/data/news.json')
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validNews = parsed.filter((item: NewsItem) => item.title && item.title.trim() !== '')
        if (validNews.length > 0) return validNews
      }
    }
  } catch (e) {
    console.warn('Failed to load news.json:', e)
  }
  return []
}
