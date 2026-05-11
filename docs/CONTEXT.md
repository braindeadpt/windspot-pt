# WindSpot — Context for LLM sessions

Lê este ficheiro antes de qualquer trabalho no repo. Define o estado do projecto e as restrições técnicas que limitam que soluções são viáveis.

## Identidade

- **Projecto:** WindSpot Portugal — plataforma open-source de condições para desportos náuticos em Portugal (surf, kitesurf, windsurf, bodyboard, SUP, wakeboard).
- **Repo:** https://github.com/braindeadpt/windspot-pt
- **Site em produção:** https://braindeadpt.github.io/windspot-pt/pt/
- **Licença:** MIT.

## Stack técnica

| Camada | Tecnologia | Notas |
|---|---|---|
| Framework | Next.js 14.2 + React 18.3 | App Router |
| Linguagem | TypeScript 5.4 (strict) | |
| Styling | Tailwind CSS 3.4 | Config em `tailwind.config.ts` com paletas custom (`ocean`, `surf`, `wind`, `wave`) parcialmente usadas |
| Ícones | `lucide-react` | Não trocar por outra lib |
| Charts | `recharts` | |
| Dados marinha | Open-Meteo Marine API | Free, sem auth, default unit km/h para vento |
| Chat | Supabase (`@supabase/supabase-js`) | Realtime + RLS |
| IA notícias | Google Gemini Flash via script Node | Corre em GitHub Actions |
| Deploy | GitHub Pages (static export) | `output: 'export'` no `next.config.js` |

## Restrições técnicas críticas

São restrições estruturais — qualquer proposta tem de as respeitar.

1. **Static export.** `next.config.js` tem `output: 'export'`. Não há server-side rendering em runtime, não há API routes (todas as `app/api/*` estão fora de questão), não há middleware. Tudo o que existe em runtime é HTML/JS/CSS estático servido pelo GitHub Pages.

2. **basePath obrigatório em produção.** O site vive em `/windspot-pt/`, não na raiz. Qualquer fetch absoluto (`/data/x.json`) parte. Usar paths relativos ou respeitar o `basePath` do Next config.

3. **Sem headers HTTP customizáveis.** GitHub Pages não permite. CSP, HSTS, etc. só via `<meta http-equiv>` no HTML — e com limitações.

4. **Sem dependências pesadas novas.** O `package.json` actual é deliberadamente leve. Antes de adicionar qualquer dep, justificar. Preferir CSS/SVG vanilla a libs (ex.: gauges, wave shapes — não precisam de uma lib).

5. **`output: 'export'` + páginas dinâmicas exigem `generateStaticParams`.** A rota `/[locale]/spots/[slug]` já o tem. Não introduzir rotas dinâmicas que não sejam estaticamente enumeráveis.

6. **Cliente vs servidor:** componentes com `'use client'` correm no browser. Componentes server (sem essa directiva) correm em **build time** (não em runtime — não há servidor). Decidir bem onde colocar o fetch de dados.

## Estrutura do repo

```
src/
├── app/
│   ├── layout.tsx                    Root layout (define <html lang>, body bg)
│   ├── page.tsx                      Redirect / → /pt/
│   ├── globals.css                   Tailwind + custom utilities
│   └── [locale]/
│       ├── layout.tsx                Header + Footer + metadata por locale
│       ├── page.tsx                  HOME (client-side, fetch de 81 spots)
│       ├── spots/page.tsx            Lista (server, fetch em build)
│       ├── spots/[slug]/page.tsx     Detail (delega ao client)
│       ├── favorites/page.tsx        Favoritos (localStorage)
│       ├── compare/page.tsx          Comparador VS
│       ├── news/page.tsx             Notícias (actualmente mock hardcoded)
│       └── about/page.tsx            Sobre
├── components/
│   ├── layout/Header.tsx, Footer.tsx
│   ├── spots/SpotCard.tsx, SpotGrid.tsx, SpotDetailClient.tsx,
│   │         SpotMap.tsx, SpotChat.tsx, SessionForecastChart.tsx,
│   │         LocalTipsSection.tsx, SecretTipsSection.tsx,
│   │         WaterQualityBadge.tsx, FacilityIcon.tsx
│   ├── weather/ConditionCard.tsx, ForecastChart.tsx
│   ├── news/NewsCard.tsx
│   ├── ui/WindCompass.tsx
│   ├── FavoriteButton.tsx, TrendIndicator.tsx, SportSelector.tsx,
│   │   HtmlLang.tsx, SecurityHeaders.tsx
│   └── DawnPatrolBanner.tsx, AlertBanner.tsx,
│       MagicWindows.tsx, SwellDetective.tsx     ← DEAD CODE (não importados)
├── lib/
│   ├── spots.ts                      81 spots (alguns slugs duplicados — a corrigir)
│   ├── openmeteo.ts                  Fetch + parsing Open-Meteo
│   ├── sportScore.ts                 Scoring 0-100 por desporto
│   ├── sportRatings.ts               Tipos SportType
│   ├── i18n.ts                       Translations PT/EN
│   ├── spotTips.ts                   Local tips por spot
│   ├── chatModeration.ts             Filtro de palavrões + rate limit
│   ├── supabase-config.ts            Anon key hardcoded como fallback
│   └── supabase.ts                   Client lazy
└── types/index.ts                    Spot, MarineData, NewsItem, Locale

public/
├── data/
│   ├── conditions.json              ← vazio actualmente
│   ├── dawn-patrol.json             ← gerado por workflow
│   └── news.json                    ← gerado por workflow (com bugs de parsing)
├── favicon.svg, apple-touch-icon.svg
├── manifest.json, robots.txt, sitemap.xml

scripts/
├── update-conditions.js              GH Action: actualiza conditions.json a cada 3h
├── update-news.js                    GH Action: RSS + Gemini
└── dawn-patrol.js                    GH Action diária: gera recomendação matinal

.github/workflows/
├── deploy.yml                        Build + deploy GitHub Pages
├── update-data.yml                   Cron 3h para condições + notícias
└── dawn-patrol.yml                   Cron diário 6am

docs/
├── REDESIGN-SPEC.md                  Spec antiga (parcialmente implementada)
├── PLANO-REORGANIZACAO.md
├── CONTEXT.md                        ← este ficheiro
└── UX-AUDIT.md                       ← audit detalhado
```

## Estado actual conhecido (bugs e dívida)

Não é objectivo desta sessão arranjar isto a menos que seja explicitamente pedido. Listado para evitar que a LLM resolva problemas errados ou introduza assumptions falsas.

- **Unidades de vento erradas em todo o lado.** Open-Meteo devolve km/h; o código multiplica por `1.94384` (factor m/s → kt). Display em kt está ~3,6× exagerado. Quando se mexer em UI que mostra kt, **não usar `windSpeed * 1.94384`** — ou usar `windSpeed * 0.5400` (km/h → kt) ou adicionar `&wind_speed_unit=ms` ao fetch.
- **Filtro de regiões da home não funciona.** `REGIONS` usa macro (Norte/Centro/Lisboa) mas `spot.region` guarda municípios.
- **Slugs duplicados em `spots.ts`** (zambujeira, sao-torpes, porto-covo, paul-mar, odeceixe, moledo, jardim-mar + vila-nova-milfontes/vilanova-milfontes).
- **Página de notícias usa `mockNews` hardcoded**, não lê `public/data/news.json`.
- **Home faz 81 fetches paralelos client-side** ignorando `public/data/conditions.json` (que está vazio).
- **`SecurityHeaders.tsx` injecta CSP via JS** em runtime — sem efeito real.
- **DawnPatrolBanner, AlertBanner, MagicWindows, SwellDetective** estão definidos mas nunca importados.
- **`WindCompass` SVG roda os labels** junto com a seta — bug visual.
- **`findIndex(...) || 0`** em `openmeteo.ts:216` e `update-conditions.js:113` — `-1 || 0` é `-1`.
- **Inter declarada em `globals.css` mas nunca carregada.** Site usa system fonts.
- **`manifest.json` start_url é `/pt` mas o site vive em `/windspot-pt/pt/`.**

## Convenções

- **Idioma do projecto:** Português europeu (PT-PT). Strings duplicadas em `i18n.ts` para PT/EN.
- **Tom:** directo, conciso. Não usar exclamações excessivas. Não usar emojis em UI excepto onde já existem (avisos, chat empty states).
- **Comentários no código:** em inglês ou português — escolher um por ficheiro e manter.
- **Tailwind:** usar utilities, evitar `@apply` excepto para componentes que se repetem em múltiplos sítios. Custom em `globals.css @layer components`.
- **Componentes:** server-first sempre que possível. `'use client'` só quando há `useState`, `useEffect`, event handlers, ou hooks do `next/navigation`.
- **Imports:** alias `@/*` aponta para `src/*` (configurado em `tsconfig.json`).

## Como pedir trabalho à LLM

1. **Carregar este ficheiro primeiro.** `Lê docs/CONTEXT.md.`
2. **Carregar o audit/spec relevante.** `Lê docs/UX-AUDIT.md.`
3. **Pedir trabalho cirúrgico, uma fase de cada vez.** Não pedir "redesign completo". Pedir "implementa apenas a Foundation" ou "implementa o ScoreGauge isolado em `src/components/ui/`".
4. **Pedir perguntas antes de código.** `Se houver ambiguidade, faz-me 2-3 perguntas antes de gerar código.`
5. **Definir o output esperado.** "Devolve: (a) ficheiro completo do componente novo, (b) diff dos ficheiros existentes a alterar, (c) lista de imports a adicionar."
6. **Restringir escopo do diff.** `Não tocar em ficheiros fora dos que listei.`
