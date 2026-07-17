import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import Vector from '../../utils/vector.js';
import Matrix from '../../utils/matrix.js';
import Hexagon from '../../utils/hexagone.js';
import { HEX_SIZE, HEX_GAP, TERRAIN } from '../../config/mapConfig.js';
import {invoke} from "@tauri-apps/api/core";

const MapContext = createContext(null);

const buildMap = async () => {
  const matrix = new Matrix();
  let {data: {map}} = await invoke('engine', { command: "GetMap" })
  if (!map) return

  console.log(map)
  matrix.make(new Vector(map[0].length, map.length), (at) => ({
    ...TERRAIN[map[at.y][at.x]],
  }));
  return matrix;
};

/**
 * MapProvider - construit la grille de terrain et expose les utilitaires de
 * conversion logique <-> pixel nécessaires au rendu et au pathfinding.
 */
export const MapProvider = ({ children }) => {
  const [terrain, setTerrain] = useState();
  const [map, setMap] = useState();
  const [cell] = useState(() => new Hexagon(HEX_SIZE));

  const viewBox = useMemo(() => {
    if(!map) return

    const size = cell.calculateFullSize(map?.length.x, map?.length.y, HEX_GAP);
    return [0, 0, size.x, size.y];
  }, [cell, map]);

  const toPixel = useCallback((at) => cell.next(at, HEX_GAP), [cell]);
  const getTile = useCallback((at) => map?.get(at), [map]);

  useEffect(() => {
    buildMap().then(setMap)
  }, []);

  useEffect(() => {
    invoke('engine', { command: "GetTerrain" })
      .then(({data: {terrain}}) => setTerrain(terrain))
  }, []);

  const value = useMemo(
    () => ({ map, cell, terrain, viewBox, toPixel, getTile }),
    [map, cell, terrain, viewBox, toPixel, getTile]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a <MapProvider>');
  return ctx;
};
