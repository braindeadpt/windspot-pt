'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SPORT_LABELS, ALL_SPORTS, SportType } from '@/lib/sportRatings';
import { X } from 'lucide-react';

interface SportSelectorProps {
  locale: string;
}

export default function SportSelector({ locale }: SportSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSport = searchParams.get('sport') as SportType | null;
  const isPT = locale === 'pt';

  const handleSportChange = (sport: SportType | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sport) {
      params.set('sport', sport);
    } else {
      params.delete('sport');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <p className="text-sm text-slate-400 mb-3 text-center">
        {isPT ? 'Escolhe o teu desporto:' : 'Choose your sport:'}
      </p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {/* All sports button */}
        <button
          onClick={() => handleSportChange(null)}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            !currentSport
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-105'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/5'
          }`}
        >
          {isPT ? '🌊 Todos' : '🌊 All'}
        </button>

        {ALL_SPORTS.map((sport) => {
          const label = SPORT_LABELS[sport];
          const isActive = currentSport === sport;

          return (
            <button
              key={sport}
              onClick={() => handleSportChange(sport)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/5'
              }`}
            >
              <span>{label.emoji}</span>
              <span className="hidden sm:inline">{isPT ? label.pt : label.en}</span>
            </button>
          );
        })}
      </div>

      {currentSport && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-300 px-4 py-2 rounded-full text-sm">
            {SPORT_LABELS[currentSport].emoji} {isPT ? 'A mostrar spots para' : 'Showing spots for'}{' '}
            <strong>{isPT ? SPORT_LABELS[currentSport].pt : SPORT_LABELS[currentSport].en}</strong>
            <button
              onClick={() => handleSportChange(null)}
              className="ml-2 text-cyan-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
