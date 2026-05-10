/**
 * WindSpot - Update News Script
 * Fetches RSS feeds and generates news items
 * Uses regex-based RSS parsing with CDATA and HTML entity support
 */

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const RSS_FEEDS = [
  'https://surfertoday.com/rss',
  'https://www.windmag.com/rss',
  'https://www.thekitemag.com/rss',
];

/**
 * Extract text from RSS item field, handling CDATA and HTML entities
 */
function extractField(itemXml, fieldName) {
  // Try CDATA first: <field><![CDATA[...]]></field>
  const cdataRegex = new RegExp(`<${fieldName}[\\s\\S]*?>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${fieldName}>`);
  const cdataMatch = itemXml.match(cdataRegex);
  if (cdataMatch) {
    return decodeHtmlEntities(cdataMatch[1].trim());
  }
  
  // Try regular content: <field>...</field>
  const regularRegex = new RegExp(`<${fieldName}[\\s\\S]*?>([\\s\\S]*?)</${fieldName}>`);
  const regularMatch = itemXml.match(regularRegex);
  if (regularMatch) {
    return decodeHtmlEntities(regularMatch[1].replace(/<[^>]*>/g, '').trim());
  }
  
  return '';
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#8217;/g, "'")   // Right single quote
    .replace(/&#8216;/g, "'")   // Left single quote
    .replace(/&#8220;/g, '"')  // Left double quote
    .replace(/&#8221;/g, '"')  // Right double quote
    .replace(/&#8230;/g, '...') // Ellipsis
    .replace(/&#8211;/g, '-')  // En dash
    .replace(/&#8212;/g, '--')  // Em dash
    .replace(/&#038;/g, '&')   // Ampersand
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function fetchRSSFeed(url) {
  try {
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'WindSpot-Bot/1.0' },
      timeout: 10000 
    });
    if (!response.ok) {
      console.warn(`  ⚠️ RSS feed returned ${response.status}: ${url}`);
      return null;
    }
    
    const xml = await response.text();
    const items = [];
    
    // Extract all <item> blocks
    const itemRegex = /<item[\s\S]*?<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const item = match[0];
      
      const title = extractField(item, 'title');
      const description = extractField(item, 'description');
      const link = extractField(item, 'link');
      const pubDate = extractField(item, 'pubDate');
      
      // Skip items with empty titles or links
      if (!title || !link) {
        console.log(`  ⚠️ Skipping item with empty title/link from ${url}`);
        continue;
      }
      
      items.push({
        title,
        description: description.substring(0, 300),
        url: link,
        publishedAt: pubDate || new Date().toISOString(),
        source: new URL(url).hostname.replace('www.', '').replace('feeds.', ''),
      });
    }
    
    console.log(`  ✓ ${url}: ${items.length} articles extracted`);
    return items;
  } catch (e) {
    console.error(`  ✗ Failed to fetch ${url}:`, e.message);
    return null;
  }
}

async function generateSummaryWithGemini(articles, locale) {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ No GEMINI_API_KEY found, using original descriptions as summaries');
    return articles.map(a => ({
      ...a,
      summary: a.description,
      summaryEn: a.description,
    }));
  }

  const prompt = locale === 'pt'
    ? `Resume as seguintes notícias de desportos náuticos em português europeu, focando em condições de ondas e vento para Portugal. Máximo 2 frases por notícia.

${articles.map((a, i) => `${i + 1}. ${a.title}\n${a.description}`).join('\n\n')}`
    : `Summarize the following water sports news in English, focusing on wave and wind conditions for Portugal. Max 2 sentences per news item.

${articles.map((a, i) => `${i + 1}. ${a.title}\n${a.description}`).join('\n\n')}`;

  try {
    const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse numbered summaries from response
    const summaryLines = summary.split('\n').filter(l => l.trim());
    
    return articles.map((a, i) => {
      // Try to find summary for this article
      const articleSummary = summaryLines.find(l => 
        l.includes(`${i + 1}.`) || l.includes(a.title.substring(0, 20))
      );
      
      if (articleSummary) {
        const cleanSummary = articleSummary.replace(/^\d+\.\s*/, '').trim();
        return {
          ...a,
          summary: cleanSummary,
          summaryEn: locale === 'pt' ? a.description : cleanSummary,
        };
      }
      
      return {
        ...a,
        summary: a.description,
        summaryEn: a.description,
      };
    });
  } catch (e) {
    console.error('Gemini API error:', e.message);
    return articles.map(a => ({
      ...a,
      summary: a.description,
      summaryEn: a.description,
    }));
  }
}

async function updateNews() {
  console.log('📰 WindSpot - Updating news...');

  const allArticles = [];
  for (const feed of RSS_FEEDS) {
    const articles = await fetchRSSFeed(feed);
    if (articles) allArticles.push(...articles);
  }

  console.log(`\n📊 Total articles found: ${allArticles.length}`);

  if (allArticles.length === 0) {
    console.warn('⚠️ No articles found! Keeping existing news.json if it exists.');
    return;
  }

  // Remove duplicates by URL
  const seenUrls = new Set();
  const uniqueArticles = allArticles.filter(a => {
    if (seenUrls.has(a.url)) return false;
    seenUrls.add(a.url);
    return true;
  });

  console.log(`📊 Unique articles: ${uniqueArticles.length}`);

  // Take top 6 most recent
  const recentArticles = uniqueArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 6);

  // Generate summaries with Gemini (or fallback to descriptions)
  const ptNews = await generateSummaryWithGemini(recentArticles, 'pt');

  const newsItems = ptNews.map((a, i) => ({
    id: `news-${Date.now()}-${i}`,
    title: a.title,
    titleEn: a.title,
    summary: a.summary || a.description,
    summaryEn: a.summaryEn || a.description,
    category: categorizeNews(a.title),
    source: a.source,
    url: a.url,
    publishedAt: a.publishedAt,
    tags: extractTags(a.title + ' ' + a.description),
  }));

  const outputPath = path.join(__dirname, '../public/data/news.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(newsItems, null, 2));

  console.log(`\n✅ News saved to ${outputPath}`);
  console.log(`📰 Generated ${newsItems.length} news items`);
  
  // Print preview
  newsItems.forEach((item, i) => {
    console.log(`\n  ${i + 1}. ${item.title}`);
    console.log(`     ${item.summary.substring(0, 80)}...`);
    console.log(`     Source: ${item.source} | Category: ${item.category}`);
  });
}

/**
 * Categorize news based on title/content
 */
function categorizeNews(title) {
  const lower = title.toLowerCase();
  if (lower.includes('competition') || lower.includes('wsl') || lower.includes('championship') || lower.includes('tour')) {
    return 'competition';
  }
  if (lower.includes('kitesurf') || lower.includes('kite')) return 'kitesurf';
  if (lower.includes('windsurf') || lower.includes('wind')) return 'windsurf';
  if (lower.includes('surf') && !lower.includes('kitesurf') && !lower.includes('windsurf')) return 'surf';
  if (lower.includes('safety') || lower.includes('alert') || lower.includes('warning')) return 'safety';
  return 'general';
}

/**
 * Extract tags from title and description
 */
function extractTags(text) {
  const tags = [];
  const lower = text.toLowerCase();
  
  const tagMap = {
    'nazare': 'nazare', 'peniche': 'peniche', 'supertubos': 'supertubos',
    'guincho': 'guincho', 'cascais': 'cascais', 'ericeira': 'ericeira',
    'algarve': 'algarve', 'sagres': 'sagres', 'porto': 'porto',
    'foz': 'foz', 'baleal': 'baleal', 'costa': 'costa',
    'wsl': 'wsl', 'big-wave': 'big-wave', 'tow': 'tow',
    'kitesurf': 'kitesurf', 'windsurf': 'windsurf', 'surf': 'surf',
    'wave': 'wave', 'wind': 'wind', 'swell': 'swell',
  };
  
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) tags.push(tag);
  }
  
  return [...new Set(tags)].slice(0, 5); // Max 5 unique tags
}

updateNews().catch(e => {
  console.error('❌ Fatal error in update-news.js:', e);
  process.exit(1);
});
