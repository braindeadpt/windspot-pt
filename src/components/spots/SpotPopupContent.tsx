'use client';

import { renderToStaticMarkup } from 'react-dom/server';
import { Waves, Wind, Thermometer } from 'lucide-react';

interface SpotPopupContentProps {
  name: string;
  region: string;
  score: number;
  scoreColor: string;
  waveHeight: string;
  windKnots: string;
  waterTemp: string | number;
  spotSlug: string;
  locale: string;
}

export function SpotPopupContent({
  name,
  region,
  score,
  scoreColor,
  waveHeight,
  windKnots,
  waterTemp,
  spotSlug,
  locale,
}: SpotPopupContentProps) {
  const isPt = locale === 'pt';
  return (
    <div className="space-y-3 min-w-[200px]">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="font-bold text-sm text-[rgb(var(--fg))] truncate">{name}</div>
          <div className="text-[11px] text-[rgb(var(--fg-muted))]">{region}</div>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-[13px] shrink-0 ml-3"
          style={{
            backgroundColor: `${scoreColor}22`,
            border: `2px solid ${scoreColor}`,
            color: scoreColor,
          }}
        >
          {Math.round(score)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="text-center bg-[rgb(var(--surface-1))] rounded-md py-1.5 px-1">
          <Waves className="w-3.5 h-3.5 mx-auto mb-0.5 text-[rgb(var(--fg-subtle))]" />
          <span className="font-semibold text-[rgb(var(--fg))]">{waveHeight}m</span>
        </div>
        <div className="text-center bg-[rgb(var(--surface-1))] rounded-md py-1.5 px-1">
          <Wind className="w-3.5 h-3.5 mx-auto mb-0.5 text-[rgb(var(--fg-subtle))]" />
          <span className="font-semibold text-[rgb(var(--fg))]">{windKnots}kt</span>
        </div>
        <div className="text-center bg-[rgb(var(--surface-1))] rounded-md py-1.5 px-1">
          <Thermometer className="w-3.5 h-3.5 mx-auto mb-0.5 text-[rgb(var(--fg-subtle))]" />
          <span className="font-semibold text-[rgb(var(--fg))]">{waterTemp}°C</span>
        </div>
      </div>

      <a
        href={`/${locale}/spots/${spotSlug}`}
        className="block w-full text-center py-2 rounded-lg bg-[rgb(var(--surface-1))] text-[rgb(var(--data-waves))] text-xs font-semibold no-underline transition-colors hover:bg-[rgb(var(--surface-2))]"
      >
        {isPt ? 'Ver spot →' : 'View spot →'}
      </a>
    </div>
  );
}

export function renderSpotPopup(options: SpotPopupContentProps): string {
  return renderToStaticMarkup(<SpotPopupContent {...options} />);
}
