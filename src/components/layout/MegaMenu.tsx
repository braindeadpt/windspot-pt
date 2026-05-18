'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Waves, Wind, Thermometer, Compass, Ruler, Gauge, Diamond, CloudSun, Sailboat, Ship, Flame, Zap } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

type Variant = 'modalidades' | 'metricas';

interface MegaMenuProps {
  variant: Variant;
  locale: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MODALIDADES_ITEMS = [
  { id: 'surf', slug: 'surf', icon: Waves, i18nKey: 'modalidadeSurf', i18nDesc: 'modalidadesSurf' },
  { id: 'kitesurf', slug: 'kitesurf', icon: Wind, i18nKey: 'modalidadeKite', i18nDesc: 'modalidadesKite' },
  { id: 'windsurf', slug: 'windsurf', icon: Sailboat, i18nKey: 'modalidadeWind', i18nDesc: 'modalidadesWind' },
  { id: 'big-wave', slug: 'big-wave', icon: Ship, i18nKey: 'modalidadeBigWave', i18nDesc: 'modalidadesBigWave' },
  { id: 'bodyboard', slug: 'bodyboard', icon: Waves, i18nKey: 'modalidadeBodyboard', i18nDesc: 'modalidadesBodyboard' },
  { id: 'sup', slug: 'sup', icon: Diamond, i18nKey: 'modalidadeSup', i18nDesc: 'modalidadesSup' },
  { id: 'foil', slug: 'foil', icon: Flame, i18nKey: 'modalidadeFoil', i18nDesc: 'modalidadesFoil' },
  { id: 'wakeboard', slug: 'wakeboard', icon: Zap, i18nKey: 'modalidadeWakeboard', i18nDesc: 'modalidadesWakeboard' },
];

const METRICAS_ITEMS = [
  { id: 'altura', icon: Ruler, i18nKey: 'metricasAltura' },
  { id: 'periodo', icon: Waves, i18nKey: 'metricasPeriodo' },
  { id: 'vento', icon: Wind, i18nKey: 'metricasVento' },
  { id: 'direcao', icon: Compass, i18nKey: 'metricasDirecao' },
  { id: 'temp', icon: Thermometer, i18nKey: 'metricasTemp' },
  { id: 'swell', icon: CloudSun, i18nKey: 'metricasSwell' },
  { id: 'score', icon: Gauge, i18nKey: 'metricasScore' },
];

export default function MegaMenu({ variant, locale, isOpen, onToggle, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = getTranslation(locale as 'pt' | 'en');
  const isPt = locale === 'pt';

  const items = variant === 'modalidades' ? MODALIDADES_ITEMS : METRICAS_ITEMS;
  const titleKey = variant === 'modalidades' ? 'modalidadesTitle' : 'metricasTitle';
  const isModalidades = variant === 'modalidades';

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      triggerRef.current?.focus();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const labelKey = isModalidades ? 'modalidades' : 'metricas';

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        onClick={onToggle}
        onMouseEnter={onToggle}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-input text-sm font-medium text-fg-subtle hover:text-fg hover:bg-surface-1 transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`mega-menu-${variant}`}
      >
        {t.nav[labelKey]}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-base ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id={`mega-menu-${variant}`}
          role="menu"
          className="absolute top-full left-0 mt-1 w-[480px] rounded-modal border border-divider bg-bg-elevated shadow-modal backdrop-blur-xl p-4 z-[1300]"
          onMouseLeave={onClose}
        >
          <div className="text-xs font-medium text-fg-subtle uppercase tracking-wider mb-3 px-1">
            {t.megaMenu[titleKey]}
          </div>
          {isModalidades ? (
            <div className="grid grid-cols-2 gap-2">
              {(items as typeof MODALIDADES_ITEMS).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/modalidades/${item.slug}`}
                    role="menuitem"
                    onClick={onClose}
                    className="flex items-start gap-3 p-3 rounded-card hover:bg-surface-1 transition-colors group"
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-input bg-surface-1 text-data-waves group-hover:bg-surface-2 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-fg">{t.nav[item.i18nKey]}</div>
                      <div className="text-xs text-fg-subtle leading-relaxed">{t.megaMenu[item.i18nDesc]}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(items as typeof METRICAS_ITEMS).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    role="menuitem"
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-card hover:bg-surface-1 transition-colors group text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-input bg-surface-1 text-data-waves group-hover:bg-surface-2 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-medium text-fg">{t.megaMenu[item.i18nKey]}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
