import React, { useCallback, useState } from 'react';
import Vector from '../../utils/vector.js';
import HexTile from './HexTile.jsx';
import PlayerToken from './PlayerToken.jsx';
import { useMap } from '../../providers/map/MapProvider.jsx';
import { usePlayer } from '../../providers/map/PlayerProvider.jsx';
import { HEX_SIZE } from '../../config/mapConfig.js';

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.15;

/**
 * HexGrid - rendu SVG de la carte hexagonale : tuiles, jeton du joueur,
 * zoom (molette + boutons) et un indicateur de déplacement en cours.
 */
const HexGrid = ({ className = '' }) => {
  const { map, terrain: data_terrain, cell, viewBox, toPixel } = useMap();
  const { position, moveTo, isMoving } = usePlayer();
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState(1);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z - Math.sign(event.deltaY) * ZOOM_STEP)));
  }, []);

  const [x, y, w, h] = viewBox;
  const trimmedW = w - cell.radius * 2;
  const trimmedH = h - cell.radius * 2;
  const centerX = x + cell.radius + trimmedW / 2;
  const centerY = y + cell.radius + trimmedH / 2;
  const scaledW = trimmedW / zoom;
  const scaledH = trimmedH / zoom;
  const frame = [
    Math.max(centerX - scaledW / 2, 0),
    Math.max(centerY - scaledH / 2, 0),
    scaledW,
    scaledH,
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={frame.join(' ')}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        className="h-full w-full rounded-xl border border-slate-700 bg-[#161d2e] shadow-xl"
      >
        {map.flat().map((terrain, index) => {
          const width = map.length.x;
          const at = new Vector(index % width, Math.floor(index / width));
          return (
            <HexTile
              key={`hex-${at.x}-${at.y}`}
              at={at}
              position={toPixel(at)}
              cell={cell}
              walkable={data_terrain?.[terrain?.id]?.walkable}
              color={terrain?.color}
              isHovered={Boolean(hovered) && hovered.x === at.x && hovered.y === at.y}
              isCurrent={position.x === at.x && position.y === at.y}
              onClick={moveTo}
              onHoverChange={setHovered}
            />
          );
        })}
        <PlayerToken position={toPixel(position)} radius={HEX_SIZE * 0.4} />
      </svg>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Zoomer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Dézoomer"
        >
          −
        </button>
      </div>

      {isMoving && (
        <div className="absolute left-3 top-3 rounded-lg bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
          Déplacement…
        </div>
      )}
    </div>
  );
};

export default HexGrid;
