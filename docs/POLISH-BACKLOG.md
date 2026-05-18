# Polish Backlog

> Items deferred from Lote C (Homepage Polish) for future sessions.
> Priorities are relative within each area.

---

## Status Bar

- [ ] **Tooltip on status dot** — Explain green/amber/red meaning on hover. E.g., "Dados frescos (<3h) / Ligeiramente desactualizados / Muito desactualizados" with concrete timestamps.
  - File: `src/app/[locale]/page.tsx` ~line 141
  - Priority: Low (users don't ask about the dot yet)

## Footer Stats

- [ ] **Semantic `<dl>` refactor** — Replace bare `<div>` pairs with `<dl><dt>label</dt><dd>number</dd></dl>` for screen reader structure.
  - File: `src/app/[locale]/page.tsx` ~line 250
  - Priority: Medium (SEO + a11y, but low traffic)

## Hero

- [ ] **`prefers-reduced-data` for radial glow** — The 600×600px radial gradient div has `opacity-[0.03]` but still loads. Consider `@media (prefers-reduced-data: reduce) { display: none }` or a data-saver variant.
  - File: `src/app/[locale]/page.tsx` ~line 194
  - Priority: Low (3G/2G users only)

## Cross-Cutting

- [ ] **Radial glow removal on low-end devices** — `(prefers-reduced-data: reduce)` media query.

---

*Generated 2026-05-18 after Lote C polish.*
