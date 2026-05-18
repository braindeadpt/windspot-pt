'use client';

import { createContext, useContext } from 'react';

interface MapDrawerState {
  openSpotId: string | null;
  setOpenSpotId: (id: string | null) => void;
  drawerSport: string;
  setDrawerSport: (sport: string) => void;
}

export const MapDrawerContext = createContext<MapDrawerState>({
  openSpotId: null,
  setOpenSpotId: () => {},
  drawerSport: 'surf',
  setDrawerSport: () => {},
});

export const useMapDrawer = () => useContext(MapDrawerContext);
