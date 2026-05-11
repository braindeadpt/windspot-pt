'use client';

// ─── Types ───
interface SpotData {
  spot: {
    id: string;
    slug: string;
    name: string;
    nameEn: string;
    lat: number;
    lon: number;
  };
  allScores: Record<string, { score: number }>;
}

interface PortugalMapProps {
  spotsData: SpotData[];
  selectedSport?: string;
  locale: string;
}

// ─── Score tier mapping (consistent with ScoreGauge) ───
function getScoreTier(score: number): 'epic' | 'good' | 'fair' | 'poor' | 'closed' {
  if (score >= 80) return 'epic';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'closed';
}

function getScoreVar(score: number): string {
  return `--score-${getScoreTier(score)}`;
}

// ─── Projection bounds ───
const BOUNDS = {
  continental: { minLat: 36.9, maxLat: 42.2, minLon: -9.7, maxLon: -6.0, x: 20, y: 20, w: 460, h: 360 },
  acores:      { minLat: 36.5, maxLat: 39.8, minLon: -31.5, maxLon: -24.5, x: 520, y: 30, w: 180, h: 120 },
  madeira:     { minLat: 32.2, maxLat: 33.2, minLon: -17.5, maxLon: -16.2, x: 520, y: 180, w: 140, h: 80 },
} as const;

function project(lat: number, lon: number, bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number; x: number; y: number; w: number; h: number }) {
  const xRatio = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon);
  const yRatio = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat);
  return {
    x: bounds.x + xRatio * bounds.w,
    y: bounds.y + yRatio * bounds.h,
  };
}

function getZone(lat: number, lon: number): 'continental' | 'acores' | 'madeira' | null {
  if (lat >= 36.5 && lat <= 42.5 && lon >= -10 && lon <= -6) return 'continental';
  if (lat >= 36.5 && lat <= 40 && lon <= -24) return 'acores';
  if (lat >= 32 && lat <= 34 && lon >= -18 && lon <= -16) return 'madeira';
  return null;
}

// ─── Component ───
export default function PortugalMap({ spotsData, selectedSport = 'all', locale }: PortugalMapProps) {
  const isPt = locale === 'pt';

  // Group spots by zone
  const spotsByZone = { continental: [] as SpotData[], acores: [] as SpotData[], madeira: [] as SpotData[] };
  for (const data of spotsData) {
    const zone = getZone(data.spot.lat, data.spot.lon);
    if (zone) spotsByZone[zone].push(data);
  }

  // For each spot, compute the score to display
  function getDisplayScore(data: SpotData): number {
    if (selectedSport === 'all') {
      // Best score across all sports
      return Math.max(...Object.values(data.allScores).map((s: any) => s.score || 0));
    }
    return data.allScores[selectedSport]?.score || 0;
  }

  function renderMarker(data: SpotData, zone: 'continental' | 'acores' | 'madeira') {
    const bounds = BOUNDS[zone];
    const { x, y } = project(data.spot.lat, data.spot.lon, bounds);
    const score = getDisplayScore(data);
    const tier = getScoreTier(score);
    const varName = getScoreVar(score);
    const spotName = isPt ? data.spot.name : data.spot.nameEn;

    return (
      <g key={data.spot.id} className="group">
        {/* Glow ring — hidden by default, shown on hover */}
        <circle
          cx={x} cy={y} r={12}
          fill={`rgb(var(${varName}) / 0.2)`}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ pointerEvents: 'none' }}
        />
        {/* Marker */}
        <a href={`/${locale}/spots/${data.spot.slug}`}>
          <circle
            cx={x} cy={y} r={5}
            fill={`rgb(var(${varName}) / 0.85)`}
            stroke={`rgb(var(${varName}))`}
            strokeWidth={1.5}
            className="cursor-pointer transition-all duration-200"
            filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.4))"
            style={{ transition: 'r 200ms ease-out' }}
            onMouseEnter={(e) => {
              const target = e.currentTarget;
              target.setAttribute('r', '7');
              target.setAttribute('stroke-width', '2');
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.setAttribute('r', '5');
              target.setAttribute('stroke-width', '1.5');
            }}
          >
            <title>{`${spotName}: ${score}/100`}</title>
          </circle>
        </a>
      </g>
    );
  }

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 720 420" className="w-full h-auto" preserveAspectRatio="xMidYMid meet" aria-label={isPt ? 'Mapa de spots em Portugal' : 'Map of spots in Portugal'}>
        <defs>
          <linearGradient id="coastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--data-water) / 0.10)" />
            <stop offset="100%" stopColor="rgb(255 255 255 / 0.02)" />
          </linearGradient>
        </defs>

        {/* ─── Continental Portugal ─── */}
        <g>
          {/* Water background with W→E gradient (ocean west → land east) */}
          <rect x={BOUNDS.continental.x} y={BOUNDS.continental.y} width={BOUNDS.continental.w} height={BOUNDS.continental.h} fill="url(#coastGradient)" stroke="rgb(255 255 255 / 0.08)" strokeWidth={1} rx={12} />
          {/* Label */}
          <text x={BOUNDS.continental.x + 10} y={BOUNDS.continental.y + 18} className="fill-current text-meta-sm text-fg-subtle font-medium" aria-hidden="true">
            {isPt ? 'Portugal Continental' : 'Mainland Portugal'}
          </text>
          {/* Markers */}
          {spotsByZone.continental.map(d => renderMarker(d, 'continental'))}
        </g>

        {/* ─── Açores inset ─── */}
        <g>
          <rect x={BOUNDS.acores.x} y={BOUNDS.acores.y} width={BOUNDS.acores.w} height={BOUNDS.acores.h} fill="rgb(var(--data-water) / 0.04)" stroke="rgb(255 255 255 / 0.08)" strokeWidth={1} rx={6} />
          <text x={BOUNDS.acores.x + 8} y={BOUNDS.acores.y + 16} className="fill-current text-meta-sm text-fg-subtle font-medium" aria-hidden="true">
            Açores
          </text>
          {spotsByZone.acores.map(d => renderMarker(d, 'acores'))}
        </g>

        {/* ─── Madeira inset ─── */}
        <g>
          <rect x={BOUNDS.madeira.x} y={BOUNDS.madeira.y} width={BOUNDS.madeira.w} height={BOUNDS.madeira.h} fill="rgb(var(--data-water) / 0.04)" stroke="rgb(255 255 255 / 0.08)" strokeWidth={1} rx={6} />
          <text x={BOUNDS.madeira.x + 8} y={BOUNDS.madeira.y + 16} className="fill-current text-meta-sm text-fg-subtle font-medium" aria-hidden="true">
            Madeira
          </text>
          {spotsByZone.madeira.map(d => renderMarker(d, 'madeira'))}
        </g>

        {/* ─── Legend ─── */}
        <g transform="translate(20, 400)">
          <text x={0} y={0} className="fill-current text-meta-sm text-fg-subtle" aria-hidden="true">
            {isPt ? 'Score:' : 'Score:'}
          </text>
          {[
            { tier: 'epic', label: '80+', offset: 45 },
            { tier: 'good', label: '60+', offset: 85 },
            { tier: 'fair', label: '40+', offset: 125 },
            { tier: 'poor', label: '20+', offset: 165 },
            { tier: 'closed', label: '0+', offset: 205 },
          ].map(({ tier, label, offset }) => (
            <g key={tier} transform={`translate(${offset}, -4)`}>
              <circle cx={0} cy={0} r={4} fill={`rgb(var(--score-${tier}))`} />
              <text x={8} y={1} className="fill-current text-meta-sm text-fg-subtle font-mono" aria-hidden="true">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// TODO Fase 5: importar SVG path real de Portugal (Wikipedia tem CC0 disponível)
// para substituir o rectângulo gradient por forma reconhecível do país.
