# VenTu — Plano de Implementação por Fases

> Criado: 2026-05-14 | Estado: Pendente aprovação do utilizador
> Filosofia: **pequenas vitórias, teste contínuo, zero regressões**

---

## 🎯 Visão Geral

Este plano organiza todo o trabalho restante em **fases pequenas, independentes e testáveis**.
Cada fase termina com um **build verde** e um **deploy funcional** — nunca deixamos o repo quebrado.

```
Fase 0 │ Estabilização (fixes críticos que temos AGORA)
Fase 1 │ Arquitetura de Dados (scores por desporto — a base de tudo)
Fase 2 │ Redesign Core (Spot Detail → Grid → Compare → Favorites)
Fase 3 │ Funcionalidades Novas (marés, câmaras, dados reais)
Fase 4 │ Expansão & Polish (mais spots, idiomas, SEO, PWA)
```

---

## ✅ FASE 0: Estabilização
**Objetivo:** Corrigir bugs críticos e completar o que ficou pendente dos audits.
**Duração estimada:** 2-3 sessões
**Critério de saída:** Todos os workflows a passar, zero erros no build, site 100% funcional.

### 0.1 — Fix Workflows GitHub Actions
- [ ] `update-conditions.js`: validação de segurança (já feita?), testar run manual
- [ ] `update-news.js`: fix do crash quando `a.url` é vazio
- [ ] `dawn-patrol.js`: já fixado com retry + fallback — confirmar run automática
- [ ] Verificar se `conditions.json` está a ser populado correctamente

**Teste:** Trigger manual de cada workflow → verificar green check + output correcto.

### 0.2 — Completar Traduções EN
- [ ] Auditar `i18n.ts` — listar todas as strings em PT sem equivalente EN
- [ ] Traduzir faltas (prioridade: labels de UI, não conteúdo editorial)
- [ ] Verificar build não quebra com locale `en`

**Teste:** `npm run build` com ambos locales + spot check visual em `/en/spots/`.

### 0.3 — Fix "Spot não encontrado"
- [ ] Reproduzir: clicar em spot no grid → "spot não encontrado"
- [ ] Verificar se o problema é em slugs com caracteres especiais, acentos, ou hífens
- [ ] Corrigir `generateStaticParams` ou normalização de slug

**Teste:** Clicar em 10 spots aleatórios (PT + EN), confirmar que todos abrem.

### 0.4 — Limpar Dead Code
- [ ] Remover `DawnPatrolBanner.tsx`, `AlertBanner.tsx`, `MagicWindows.tsx`, `SwellDetective.tsx` se não são importados
- [ ] Remover `SecurityHeaders.tsx` (CSP via JS é inútil em static export)
- [ ] Verificar `SessionForecastChart.tsx` e `ForecastChart.tsx` — deletados no remote, verificar se não há imports fantasmas

**Teste:** `npm run build` + grep por imports removidos.

### 0.5 — Municípios em Falta
- [ ] Auditar `regions.ts` vs `spots.ts` — listar municípios não mapeados
- [ ] Adicionar mappings em falta
- [ ] Garantir `getMacroRegion()` nunca devolve `null`/`undefined`

**Teste:** Build + verificar que todos os 81 spots têm região atribuída.

---

## 🏗 FASE 1: Arquitetura de Dados por Desporto
**Objetivo:** Cada spot mostra só o que é relevante para o desporto seleccionado.
**Duração estimada:** 3-4 sessões
**Critério de saída:** Sistema de scores por desporto funciona em todas as páginas.
**Dependências:** Fase 0 completa.

### 1.1 — Sistema de Compatibilidade
- [ ] Adicionar `primarySports` e `possibleSports` ao tipo `Spot`
- [ ] Preencher os 81 spots com compatibilidade real (trabalho manual + LLM valida)
- [ ] Implementar `getCompatibleSports(spot)` robusto (não só fallback heurístico)
- [ ] `isSportCompatible(spot, sport)` → boolean

**Teste:** Verificar Guincho (surf + kite + wind) vs Lagoa de Alqueva (wake + sup) vs Nazaré (surf + body).

### 1.2 — Scores por Desporto
- [ ] Reescrever `sportScore.ts`: `getSportScore(spot, sport, conditions)` → `{ score, rating, factors, warning? }`
- [ ] Cada desporto tem lógica própria:
  - Surf: ondas + offshore
  - Kitesurf: vento forte + ondas pequenas
  - Windsurf: vento moderado
  - Wakeboard: 0 se não tiver cable park
  - Bodyboard: ondas (mais tolerante que surf)
  - SUP: ondas pequenas + vento leve
  - Foil: vento leve/moderado
- [ ] Remover score "geral" misturado

**Teste:** Comparar scores do mesmo spot em desportos diferentes — devem variar logicamente.

### 1.3 — Filtros Funcionais
- [ ] Quando filtra "Kitesurf": mostrar só spots compatíveis, ordenar por score de KITESURF
- [ ] Quando filtra "Surf": mostrar só spots compatíveis, ordenar por score de SURF
- [ ] Sport "all": mostrar todos, ordenar por `primaryScore` (score do desporto principal do spot)
- [ ] Atualizar `SpotGridClient.tsx` para usar novo sistema

**Teste:**
1. Filtrar "Wakeboard" → só spots com cable park / lagoas
2. Filtrar "Surf" em Lisboa → não aparecer spots de lagoa
3. Filtrar "Kitesurf" → top spots têm vento forte

### 1.4 — SpotCard Adaptativo
- [ ] `SpotCard` recebe `sport` prop
- [ ] Mostra score do desporto seleccionado (não primaryScore genérico)
- [ ] Stats relevantes ao desporto:
  - Surf: Ondas X.Xm | Período XXs | Vento offshore
  - Kite: Vento XXkt | Rajadas XX | Ondas X.Xm
  - Wakeboard: Aberto/Fechado | Temperatura

**Teste:** Mudar filtro de desporto na homepage → cards mudam stats e scores.

---

## 🎨 FASE 2: Redesign Consistente
**Objetivo:** Todas as páginas usam os mesmos componentes e design language.
**Duração estimada:** 5-6 sessões
**Critério de saída:** Site consistente em todas as páginas, mobile-first, zero information overload.
**Dependências:** Fase 1 completa (usamos scores por desporto).

### 2.1 — Spot Detail (P1 — mais importante)
- [ ] Layout 1 coluna, scroll natural
- [ ] Header: nome + região + score grande + badge desporto + favorito
- [ ] Condições: 3 cards só com dados relevantes ao desporto
- [ ] Forecast: tabela 24h simplificada (mantemos a actual mas com cores por desporto)
- [ ] Recomendação: texto gerado + crowd + melhor hora
- [ ] Mapa: OpenStreetMap pequeno
- [ ] Info do spot: facilities em ícones, hazards só se existirem
- [ ] Chat: compacto, sempre visível
- [ ] Remover: SwellDetective, excesso de facilities, scores de desportos não compatíveis

**Teste:** Abrir 5 spots diferentes (surf, kite, wake, sup, foil) → verificar que cada um mostra só info relevante.

### 2.2 — Spot Grid (/spots)
- [ ] Usar `SpotCard` adaptativo (de Fase 1.4)
- [ ] Filtros sticky: desporto + região + dificuldade + score mínimo
- [ ] Top 3 destaque quando filtra desporto (já feito em Fase 4b, validar que funciona com novo sistema)
- [ ] Empty state com sugestão alternativa

**Teste:**
- Filtrar + verificar ordenação correcta
- Mobile: filtros em drawer, scroll natural
- Desktop: 3 colunas, cards alinhados

### 2.3 — Compare
- [ ] Layout tabela lado a lado (não cards sobrepostos)
- [ ] Max 3 spots
- [ ] Linhas comparáveis: score, ondas, vento, temperatura, crowd
- [ ] Highlight no melhor de cada categoria

**Teste:** Comparar Guincho vs Nazaré vs Carcavelos → verificar que a comparação faz sentido.

### 2.4 — Favorites
- [ ] Usar `SpotCard` adaptativo
- [ ] Badge de alerta se condições mudaram desde última visita
- [ ] Fácil remover favorito

**Teste:** Adicionar/remover favorito + verificar persistência (localStorage).

### 2.5 — Homepage Ajustes
- [ ] Conectar com novo sistema de scores
- [ ] Quando filtra desporto, hero mostra spot #1 desse desporto
- [ ] Live ticker com dados reais (conditions.json)
- [ ] PortugalMap SVG (já feito em Fase 4c, validar que funciona)

**Teste:** Homepage em PT + EN, mobile + desktop, filtros funcionais.

---

## 🌊 FASE 3: Funcionalidades Novas
**Objetivo:** Adicionar dados reais que fazem diferença na decisão do rider.
**Duração estimada:** 4-5 sessões
**Critério de saída:** Dados de marés e câmaras funcionais, qualidade da água integrada.
**Dependências:** Fase 2 completa.

### 3.1 — Marés (Alta Prioridade)
- [ ] Investigar API do Instituto Hidrográfico (hidrografico.pt)
- [ ] Ou usar WorldTides/Stormglass com cache inteligente
- [ ] Adicionar `tide` ao tipo `Spot` (altitude, fase, próxima maré)
- [ ] Mostrar na Spot Detail: "Maré alta em 2h" / "Melhor: maré baixa"
- [ ] Indicar spots que dependem de maré (Carcavelos, Costa Caparica)

**Teste:** Verificar maré actual vs site oficial do IH.

### 3.2 — Livecams nos Spots Populares
- [ ] Identificar 5-6 spots com webcams públicas (Carcavelos, Guincho, Nazaré, Supertubos, Ribeira d'Ilhas)
- [ ] Componente `<Livecam>` com iframe ou YouTube embed
- [ ] Integrar na Spot Detail (secção "Câmara ao vivo")
- [ ] Fallback elegante se stream offline

**Teste:** Abrir spot com câmara → verificar stream a correr.

### 3.3 — Qualidade da Água
- [ ] Parse boletim APA (semanal)
- [ ] Badge na Spot Detail: "Qualidade Excelente" / "Boa" / "Insuficiente"
- [ ] Link para boletim oficial

**Teste:** Verificar badge vs último boletim APA.

### 3.4 — Imagens Reais por Spot
- [ ] Curadoria: Wikimedia Commons + Unsplash para 20 spots principais
- [ ] Adicionar campo `images` ao Spot
- [ ] Variante `<SpotCard variant="hero">` para destaques
- [ ] Lazy loading + otimização

**Teste:** Verificar que imagens carregam rápido (Lighthouse performance).

---

## 🌍 FASE 4: Expansão & Polish
**Objetivo:** Site profissional, completo, pronto para crescimento.
**Duração estimada:** 4-6 sessões
**Critério de saída:** SEO optimizado, PWA funcional, internacionalizado, analytics privados.
**Dependências:** Fase 3 completa.

### 4.1 — Mais Spots
- [ ] Açores: Santa Maria, São Miguel (spot já existe?), Pico, Faial, São Jorge
- [ ] Madeira: Jardim do Mar, Paul do Mar, Machico
- [ ] Lagoas interiores: Alqueva, Castelo do Bode, barragens
- [ ] Norte adicional: spots menos conhecidos
- [ ] Atualizar `regions.ts`, `spots.ts`, `update-conditions.js`

**Teste:** Todos os novos spots têm coordenadas correctas, região mapeada, e aparecem no grid.

### 4.2 — SEO Landing Pages
- [ ] Gerar rotas estáticas por combinação:
  - `/pt/surf/` — spots de surf
  - `/pt/kitesurf-algarve/` — sport × região
  - `/pt/melhores-spots-fim-de-semana/` — editorial
- [ ] `generateStaticParams` para cada combinação
- [ ] Meta descriptions únicos por página

**Teste:** Verificar que páginas geradas têm meta tags correctos (inspect element).

### 4.3 — Analytics (Privacidade-First)
- [ ] Integrar Plausible.io, GoatCounter, ou Umami
- [ ] Zero cookies → sem banner de cookies
- [ ] Track: page views, filtros usados, spots clicados

**Teste:** Verificar dashboard analytics a receber dados.

### 4.4 — PWA (App Instalável)
- [ ] `manifest.json` já existe — verificar se está completo
- [ ] Service Worker para cache offline
- [ ] Ícones em todas as resoluções
- [ ] Testar "Add to Home Screen" em Android/iOS

**Teste:** Instalar em telemóvel → verificar que funciona offline (cache das últimas condições).

### 4.5 — Mais Idiomas
- [ ] ES (espanhóis no Algarve)
- [ ] FR (franceses surfistas)
- [ ] DE (alemães na Madeira)
- [ ] Adicionar routes `/es/`, `/fr/`, `/de/`
- [ ] Traduzir `i18n.ts` (~200 strings por idioma)

**Teste:** Navegar em cada idioma, verificar que não há strings em PT.

### 4.6 — Social / Chat por Spot (Investigação)
- [ ] Avaliar viabilidade técnica (já investigado — é viável com Supabase)
- [ ] Custo: Supabase free tier aguenta?
- [ ] Implementar chat persistente por spot (já existe SpotChat.tsx, expandir)
- [ ] Perfis anónimos + moderacão

**Teste:** 2 users a conversar no chat do mesmo spot em tempo real.

---

## 🧪 Processo de Teste por Fase

Cada fase segue este ritual:

```
1. ANTES de começar: Build verde confirmado
2. DURANTE: a cada sub-tarefa, build verde
3. DEPOIS de cada fase:
   ├── npm run build (zero erros, zero warnings)
   ├── npm run lint (zero erros)
   ├── Teste manual: 10 spots clicáveis, filtros funcionais
   ├── Teste mobile: Chrome DevTools 375px
   ├── Teste EN: /en/ prefixo funcional
   └── Commit com mensagem clara + push
4. VALIDAÇÃO: user confirma que faz sentido antes da próxima fase
```

### Checklist de Regressão (fazer sempre)
- [ ] Homepage carrega em < 3s
- [ ] Spot grid mostra scores e ordena correctamente
- [ ] Spot detail abre para todos os slugs
- [ ] Favoritos persistem em localStorage
- [ ] Chat funciona (sem erros de console)
- [ ] Dawn Patrol gera JSON válido
- [ ] Forecast table mostra dados em knots
- [ ] Mapa interativo renderiza com markers
- [ ] Build: 180+ páginas estáticas geradas

---

## 📊 Roadmap Visual

```
AGORA        +1 semana      +2 semanas     +3 semanas     +1 mês
  │              │              │              │              │
  ▼              ▼              ▼              ▼              ▼
┌──────┐    ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
│Fase 0│    │Fase 1│      │Fase 2│      │Fase 3│      │Fase 4│
│Fixes │ →  │Dados │  →   │Design│  →   │Dados │  →   │Expan-│
│Pend  │    │Sport │      │Pages │      │Novos │      │são   │
└──────┘    └──────┘      └──────┘      └──────┘      └──────┘
   │            │             │             │             │
   │            │             │             │             │
   ▼            ▼             ▼             ▼             ▼
Workflows   Scores por    Spot Detail   Marés +      Mais spots
Traduções   desporto      redesign      Câmaras      + Idiomas
Spot click  Filtros       Grid/Compare  Qualidade    + SEO
Dead code   SpotCard      Favorites     Imagens      + PWA
Municípios  adaptativo    Homepage      reais        + Analytics
```

---

## 🎮 Como Começar

1. **User aprova este plano** (ou pede ajustes)
2. **Começamos Fase 0** — estabilizar o que está partido AGORA
3. **Uma fase de cada vez** — não avançamos sem o user validar
4. **Deploy contínuo** — cada commit verde vai para produção

---

## 📝 Notas

- Este plano é **vivo** — pode ser ajustado a qualquer momento
- Prioridades podem mudar com base no feedback do user
- Fases 3+ dependem de APIs externas (IH, webcams) — se falharem, adaptamos
- A filosofia é **menos é mais** — não adicionar features só porque são "fixes"

---

*Plano criado por Botnoid worker | VenTu Project*
