'use client';

import type L from 'leaflet';
import { getScoreRgb } from '@/lib/map-constants';

export function createClusterIconFunction(
  L: typeof import('leaflet'),
): (cluster: L.MarkerCluster) => L.DivIcon {
  return function (cluster: L.MarkerCluster) {
    const markers = cluster.getAllChildMarkers();
    let totalScore = 0;
    let count = 0;

    markers.forEach((m: any) => {
      if (typeof m.spotScore === 'number') {
        totalScore += m.spotScore;
        count++;
      }
    });

    const avgScore = count > 0 ? totalScore / count : 0;
    const color = getScoreRgb(avgScore);
    const childCount = cluster.getChildCount();

    const size = childCount < 10 ? 36 : childCount < 100 ? 44 : 52;
    const fontSize = childCount < 10 ? 11 : childCount < 100 ? 12 : 14;

    return L.divIcon({
      className: 'ventu-cluster-icon',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.9;
          border: 2px solid rgb(var(--bg-elevated));
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${fontSize}px;
          font-weight: 700;
          color: #fff;
        ">${childCount}</div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };
}
