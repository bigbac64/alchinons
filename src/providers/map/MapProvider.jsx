import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import Vector from '../../utils/vector.js';
import Matrix from '../../utils/matrix.js';
import Hexagon from '../../utils/hexagone.js';
import { HEX_SIZE, HEX_GAP } from '../../config/mapConfig.js';
import {getMap, getTerrain, listenEngineEvents} from "../../api/engine.js";

const MapContext = createContext(null);

function buildMatrix(rawMap, explored, terrain) {
  if (!rawMap) return undefined;
  console.log(explored)

  const matrix = new Matrix();
  matrix.make(new Vector(rawMap[0].length, rawMap.length), (at) => {
    const id = rawMap[at.y][at.x];
    return { id, explored: explored[at.y][at.x], ...terrain[id] };
  });
  return matrix;
}

/**
 * MapProvider - construit la grille de terrain et expose les utilitaires de
 * conversion logique <-> pixel nécessaires au rendu et au pathfinding.
 */
export const MapProvider = ({ children, ...props }) => {
  const [terrain, setTerrain] = useState();
  const [map, setMap] = useState();
  const [cell] = useState(() => new Hexagon(HEX_SIZE));

  console.log(props)

  const viewBox = useMemo(() => {
    if(!map) return

    const size = cell.calculateFullSize(map?.length.x, map?.length.y, HEX_GAP);
    return [0, 0, size.x, size.y];
  }, [cell, map]);

  useEffect(() => {
    console.log(map)
  }, [map]);

  const toPixel = useCallback((at) => cell.next(at, HEX_GAP), [cell]);
  const getTile = useCallback((at) => map?.get(at), [map]);

  useEffect(() => {
    (async () => {
      const { terrain } = await getTerrain();
      setTerrain(terrain);
      const { map: rawMap, explored } = await getMap();
      setMap(buildMatrix(rawMap, explored, terrain));
    })();
  }, []);

  useEffect(() => {
    if (!terrain) return undefined;
    const unlisten = listenEngineEvents({
      MapUpdated: ({ changes: { map: rawMap, explored } }) => setMap(buildMatrix(rawMap, explored, terrain)),
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [terrain]);

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
