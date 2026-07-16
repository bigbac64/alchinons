import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Vector from '../../utils/vector.js';
import Matrix from '../../utils/matrix.js';
import Hexagon from '../../utils/hexagone.js';
import { HEX_SIZE, HEX_GAP, MAP_LAYOUT, TERRAIN } from '../../config/mapConfig.js';

const MapContext = createContext(null);

const buildMap = () => {
  const matrix = new Matrix();
  matrix.make(new Vector(MAP_LAYOUT[0].length, MAP_LAYOUT.length), (at) => ({
    ...TERRAIN[MAP_LAYOUT[at.y][at.x]],
  }));
  return matrix;
};

/**
 * MapProvider - construit la grille de terrain et expose les utilitaires de
 * conversion logique <-> pixel nécessaires au rendu et au pathfinding.
 */
export const MapProvider = ({ children }) => {
  const [map] = useState(buildMap);
  const [cell] = useState(() => new Hexagon(HEX_SIZE));

  const viewBox = useMemo(() => {
    const size = cell.calculateFullSize(map.length.x, map.length.y, HEX_GAP);
    return [0, 0, size.x, size.y];
  }, [cell, map]);

  const toPixel = useCallback((at) => cell.next(at, HEX_GAP), [cell]);
  const getTile = useCallback((at) => map.get(at), [map]);

  const value = useMemo(
    () => ({ map, cell, viewBox, toPixel, getTile }),
    [map, cell, viewBox, toPixel, getTile]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a <MapProvider>');
  return ctx;
};
