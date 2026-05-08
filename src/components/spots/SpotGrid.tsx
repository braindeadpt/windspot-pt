'use client';

import { useState } from 'react';
import { Spot } from '@/types';
import { SportType, SPORT_LABELS } from '@/lib/sportRatings';
import SpotCard from './SpotCard';
import { Filter, MapPin } from 'lucide-react';

interface SpotGridProps {
  spots: Spot[];
  locale: string;
  conditions?: Record<string, any>;
  sportRatings?: Record<string, Record<string, any>>;
  selectedSport?: SportType | null;
}

type SportFilter = 'all' | 'surf' | 'kitesurf' | 'windsurf' | 'big-wave' | 'foil' | 'wakeboard';
type RegionFilter = 'all' | 'norte' | 'centro' | 'lisboa' | 'oeste' | 'algarve' | 'alentejo' | 'acores' | 'madeira';

export default function SpotGrid({ spots, locale, conditions = {}, sportRatings = {}, selectedSport }: SpotGridProps) {
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');

  const filteredSpots = spots.filter(s => {
    const sportMatch = sportFilter === 'all' 
      ? true 
      : s.type === sportFilter || (sportFilter === 'surf' && s.type === 'big-wave');
    
    const regionMatch = regionFilter === 'all'
      ? true
      : regionFilter === 'norte' 
        ? ['Porto', 'Viana do Castelo', 'Braga', 'Caminha', 'Norte'].includes(s.region)
        : regionFilter === 'centro'
        ? ['Ericeira', 'Peniche', 'Aveiro', 'Oeste'].includes(s.region)
        : regionFilter === 'lisboa'
        ? ['Cascais', 'Almada', 'Sesimbra', 'Lisboa'].includes(s.region)
        : regionFilter === 'oeste'
        ? ['Nazaré', 'Oeste', 'Peniche'].includes(s.region)
        : regionFilter === 'algarve'
        ? s.region === 'Algarve' || ['Sagres', 'Portimão', 'Lagos', 'Faro', 'Tavira'].includes(s.region)
        : regionFilter === 'alentejo'
        ? s.region === 'Alentejo'
        : regionFilter === 'acores'
        ? ['São Miguel', 'Terceira', 'Faial', 'Santa Maria'].includes(s.region)
        : regionFilter === 'madeira'
        ? s.region === 'Madeira'
        : true;
    
    return sportMatch && regionMatch;
  });

  const sportFilters: { value: SportFilter; label: string }[] = [
    { value: 'all', label: locale === 'pt' ? 'Todos' : 'All' },
    { value: 'surf', label: 'Surf' },
    { value: 'kitesurf', label: 'Kitesurf' },
    { value: 'windsurf', label: 'Windsurf' },
    { value: 'big-wave', label: 'Big Wave' },
    { value: 'foil', label: 'Foil' },
    { value: 'wakeboard', label: 'Wakeboard' },
  ];

  const regionFilters: { value: RegionFilter; label: string }[] = [
    { value: 'all', label: locale === 'pt' ? 'Todas' : 'All Regions' },
    { value: 'norte', label: 'Norte' },
    { value: 'centro', label: 'Centro' },
    { value: 'lisboa', label: 'Lisboa' },
    { value: 'oeste', label: 'Oeste' },
    { value: 'algarve', label: 'Algarve' },
    { value: 'alentejo', label: 'Alentejo' },
    { value: 'acores', label: 'Açores' },
    { value: 'madeira', label: 'Madeira' },
  ];

  return (
    <div className="space-y-6">
      {/* Sport filters (only show if no selectedSport from URL) */}
      {!selectedSport && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Filter className="w-5 h-5 text-white/50 flex-shrink-0" />
          {sportFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setSportFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sportFilter === f.value
                  ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/25'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Region filters */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        <MapPin className="w-5 h-5 text-white/50 flex-shrink-0" />
        {regionFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setRegionFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              regionFilter === f.value
                ? 'bg-surf-500 text-white shadow-lg shadow-surf-500/25'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpots.map((spot) => (
          <SpotCard 
            key={spot.id} 
            spot={spot} 
            locale={locale} 
            conditions={conditions[spot.id]}
            sportRatings={sportRatings[spot.id]}
            selectedSport={selectedSport}
          />
        ))}
      </div>
    </div>
  );
}