'use client';

export type BasemapMode = 'map' | 'satellite';

interface MapLayerToggleProps {
  current: BasemapMode;
  onChange: (mode: BasemapMode) => void;
  isPt: boolean;
}

export default function MapLayerToggle({ current, onChange, isPt }: MapLayerToggleProps) {
  return (
    <div
      className="absolute top-3 right-3 z-[1000] flex rounded-lg overflow-hidden border border-[rgb(var(--divider))] shadow-lg"
      role="radiogroup"
      aria-label={isPt ? 'Tipo de mapa' : 'Map type'}
    >
      {(['map', 'satellite'] as const).map((mode) => {
        const label = mode === 'map'
          ? (isPt ? 'Mapa' : 'Map')
          : (isPt ? 'Satélite' : 'Satellite');
        const active = current === mode;
        return (
          <button
            key={mode}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? 'bg-[rgb(var(--surface-2))] text-[rgb(var(--fg))]'
                : 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--surface-1))]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
