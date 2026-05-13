'use client';

import { useEffect, useRef, useState } from 'react';
import type { Spot } from '@/types';
import type { SportType } from '@/lib/sportRatings';
import { getTranslation } from '@/lib/i18n';

// ─── Types ───
interface SpotData {
  spot: Spot;
  conditions: {
    waveHeight: number;
    wavePeriod: number;
    waveDirection: number;
    windSpeed: number;
    windDirection: number;
    windGust: number;
    waterTemp: number;
  };
  allScores: Record<SportType, any>;
}

interface SpotMapInteractiveProps {
  spotsData: SpotData[];
  selectedSport: SportType | 'all';
  selectedRegion: string;
  locale: string;
}

// ─── Sport colors (hex for inline styles) ───
const SPORT_COLORS: Record<string, string> = {
  surf: '#22d3ee',      // cyan-400
  bodyboard: '#2dd4bf', // teal-400
  kitesurf: '#c084fc',  // purple-400
  windsurf: '#fb923c',  // orange-400
  foil: '#facc15',      // yellow-400
  sup: '#6ee7b7',       // emerald-300
  wakeboard: '#e879f9', // fuchsia-400
};

function getSpotColor(spot: Spot): string {
  // Use primary sport type color
  return SPORT_COLORS[spot.type] || '#94a3b8';
}

function getBestScore(data: SpotData, sport: SportType | 'all'): number {
  if (sport === 'all') {
    return Math.max(...Object.values(data.allScores).map((s: any) => s?.score || 0));
  }
  return data.allScores[sport]?.score || 0;
}

function getScoreColorClass(score: number): string {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 40) return '#f59e0b'; // amber
  if (score >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
}

// ─── Component ───
export default function SpotMapInteractive({
  spotsData,
  selectedSport,
  selectedRegion,
  locale,
}: SpotMapInteractiveProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  const isPt = locale === 'pt';
  const t = getTranslation(locale as any);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    let destroyed = false;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (destroyed) return;
      leafletRef.current = L;

      // Create map
      const map = L.map(mapRef.current!, {
        center: [39.5, -8.0],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      // CARTO Dark Matter tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control (positioned nicely)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution (compact)
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addTo(map);

      mapInstanceRef.current = map;
      setIsReady(true);
    };

    initMap();

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add/update markers when data or filters change
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return;

    const L = leafletRef.current;
    if (!L) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (spotsData.length === 0) return;

    const bounds = L.latLngBounds([]);

    spotsData.forEach((data) => {
      const { spot, conditions } = data;
      const score = getBestScore(data, selectedSport);
      const color = getSpotColor(spot);
      const scoreColor = getScoreColorClass(score);

      // Custom marker icon (divIcon for full CSS control)
      const icon = L.divIcon({
        className: 'spot-marker',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid ${scoreColor};
            box-shadow: 0 0 8px ${color}66, 0 2px 4px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: #0f172a;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            ${Math.round(score)}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([spot.lat, spot.lon], { icon }).addTo(map);

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.style.cssText = `
        background: rgb(24 24 27);
        border: 1px solid rgb(63 63 70);
        border-radius: 12px;
        padding: 12px;
        min-width: 200px;
        color: #e4e4e7;
        font-family: system-ui, -apple-system, sans-serif;
      `;

      const windKnots = conditions?.windSpeed ? (conditions.windSpeed * 1.94384).toFixed(0) : '—';
      const waveH = conditions?.waveHeight ? conditions.waveHeight.toFixed(1) : '—';
      const waterT = conditions?.waterTemp ? Math.round(conditions.waterTemp) : '—';

      popupContent.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div>
            <div style="font-weight:700;font-size:14px;color:#fafafa;">${spot.name}</div>
            <div style="font-size:11px;color:#a1a1aa;">${spot.region}</div>
          </div>
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:${scoreColor}22;
            border:2px solid ${scoreColor};
            display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:13px;color:${scoreColor};">
            ${Math.round(score)}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px;font-size:11px;">
          <div style="text-align:center;background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;">
            <div style="color:#71717a;margin-bottom:2px;">🌊</div>
            <div style="font-weight:600;">${waveH}m</div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;">
            <div style="color:#71717a;margin-bottom:2px;">💨</div>
            <div style="font-weight:600;">${windKnots}kt</div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.05);border-radius:6px;padding:6px;">
            <div style="color:#71717a;margin-bottom:2px;">🌡️</div>
            <div style="font-weight:600;">${waterT}°C</div>
          </div>
        </div>
        <a href="/${locale}/spots/${spot.slug}" style="
          display:block;width:100%;text-align:center;
          padding:8px 0;background:rgba(255,255,255,0.08);
          border-radius:8px;color:#22d3ee;font-size:12px;font-weight:600;
          text-decoration:none;transition:background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
          ${isPt ? 'Ver spot →' : 'View spot →'}
        </a>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'spot-popup',
        offset: [0, -10],
      });

      markersRef.current.push(marker);
      bounds.extend([spot.lat, spot.lon]);
    });

    // Fit bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [spotsData, selectedSport, selectedRegion, isReady, locale, isPt]);

  return (
    <div className="relative w-full rounded-2xl border border-divider overflow-hidden bg-surface-1" style={{ height: 'clamp(400px, 55vh, 600px)' }}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-1 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-data-waves/30 border-t-data-waves animate-spin" />
            <span className="text-sm text-fg-muted">
              {isPt ? 'A carregar mapa...' : 'Loading map...'}
            </span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" aria-label={isPt ? 'Mapa dos spots' : 'Spots map'} />
    </div>
  );
}
