import React, { useCallback, useRef, useState } from 'react';
import Vector from '../../utils/vector.js';
import HexTile from './HexTile.jsx';
import PlayerToken from './PlayerToken.jsx';
import { useMap } from '../../providers/map/MapProvider.jsx';
import { usePlayer } from '../../providers/map/PlayerProvider.jsx';
import { HEX_SIZE } from '../../config/mapConfig.js';

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.14;
const PAN_STEP = HEX_SIZE * 1.5;
// Un déplacement de pointeur en-deçà de ce seuil (en px écran) est encore
// considéré comme un clic, pas un glissement de la vue.
const DRAG_THRESHOLD = 4;

/**
 * Ramène `value` dans les bornes praticables pour un axe de la vue : si le
 * cadre visible (`scaled`) est plus grand que la carte (`total`), il n'y a
 * pas de marge de manoeuvre et on retombe sur le centre.
 */
const clampFocus = (value, scaled, total) => (
  scaled >= total ? total / 2 : Math.min(Math.max(value, scaled / 2), total - scaled / 2)
);

/**
 * HexGrid - rendu SVG de la carte hexagonale : tuiles, jeton du joueur,
 * zoom (molette + boutons), et navigation de la vue (glisser-déposer ou
 * pavé directionnel) puisque la carte dépasse largement le cadre visible.
 */
const HexGrid = ({ className = '' }) => {
  const { map, terrain: data_terrain, cell, viewBox, toPixel } = useMap();
  const { position, moveTo, isMoving } = usePlayer();
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState(1.35);
  const [isPanning, setIsPanning] = useState(false);

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

  // Point (en px, repère de la carte) sur lequel la vue est centrée. Initialisé
  // au centre géométrique de la carte, puis déplacé par le drag ou le pavé.
  const [focus, setFocus] = useState(() => new Vector(centerX, centerY));

  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);

  const panBy = useCallback((dx, dy) => {
    setFocus((current) => new Vector(
      clampFocus(current.x + dx, scaledW, w),
      clampFocus(current.y + dy, scaledH, h),
    ));
  }, [scaledW, scaledH, w, h]);

  const handlePointerDown = useCallback((event) => {
    draggedRef.current = false;
    dragRef.current = { x: event.clientX, y: event.clientY, focus };
    setIsPanning(true);
  }, [focus]);

  const handlePointerMove = useCallback((event) => {
    if (!dragRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dxClient = event.clientX - dragRef.current.x;
    const dyClient = event.clientY - dragRef.current.y;
    if (Math.abs(dxClient) + Math.abs(dyClient) > DRAG_THRESHOLD) draggedRef.current = true;
    const dx = dxClient * (scaledW / rect.width);
    const dy = dyClient * (scaledH / rect.height);
    setFocus(new Vector(
      clampFocus(dragRef.current.focus.x - dx, scaledW, w),
      clampFocus(dragRef.current.focus.y - dy, scaledH, h),
    ));
  }, [scaledW, scaledH, w, h]);

  const stopPanning = useCallback(() => {
    dragRef.current = null;
    setIsPanning(false);
  }, []);

  // Ignore le clic qui suit un glissement de la vue : sans quoi relâcher la
  // souris après un pan déplace aussi le joueur vers la case sous le curseur.
  const handleTileClick = useCallback((at) => {
    if (draggedRef.current) return;
    moveTo(at);
  }, [moveTo]);

  const frame = [
    focus.x - scaledW / 2,
    focus.y - scaledH / 2,
    scaledW,
    scaledH,
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        viewBox={frame.join(' ')}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPanning}
        onPointerLeave={stopPanning}
        className={`h-full w-full rounded-xl border border-slate-700 bg-surface-panel shadow-xl ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
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
              explored={terrain?.explored}
              isHovered={Boolean(hovered) && hovered.x === at.x && hovered.y === at.y}
              isCurrent={position.x === at.x && position.y === at.y}
              onClick={handleTileClick}
              onHoverChange={setHovered}
            />
          );
        })}
        <PlayerToken position={toPixel(position)} radius={HEX_SIZE * 0.4} />
      </svg>

      <div className="absolute bottom-3 left-3 grid grid-cols-3 grid-rows-3 gap-1">
        <div />
        <button
          type="button"
          onClick={() => panBy(0, -PAN_STEP)}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Déplacer la vue vers le haut"
        >
          ↑
        </button>
        <div />
        <button
          type="button"
          onClick={() => panBy(-PAN_STEP, 0)}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Déplacer la vue vers la gauche"
        >
          ←
        </button>
        <div />
        <button
          type="button"
          onClick={() => panBy(PAN_STEP, 0)}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Déplacer la vue vers la droite"
        >
          →
        </button>
        <div />
        <button
          type="button"
          onClick={() => panBy(0, PAN_STEP)}
          className="h-9 w-9 rounded-lg bg-slate-700/90 font-bold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="Déplacer la vue vers le bas"
        >
          ↓
        </button>
        <div />
      </div>

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
