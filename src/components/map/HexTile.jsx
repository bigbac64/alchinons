import React from 'react';
import Vector from '../../utils/vector.js';

/**
 * HexTile - un hexagone de la carte.
 * @param {Vector} at - position logique (colonne, ligne)
 * @param {Vector} position - position en pixels (centre de l'hexagone)
 * @param {import('../../utils/hexagone.js').default} cell
 * @param {object} terrain - définition de terrain (voir config/mapConfig.js)
 * @param {boolean} isHovered
 * @param {boolean} isCurrent - case sur laquelle se trouve le joueur
 * @param {(at: Vector) => void} onClick
 * @param {(at: Vector | null) => void} onHoverChange
 */
const HexTile = ({ at, position, cell, terrain, isHovered, isCurrent, onClick, onHoverChange }) => {
  const points = cell.points(new Vector(0, 0)).join(' ');

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <polygon
        points={points}
        fill={terrain.color}
        stroke={isCurrent ? '#facc15' : isHovered && terrain.walkable ? '#e2e8f0' : 'rgba(15,23,42,0.65)'}
        strokeWidth={isCurrent ? 4 : isHovered && terrain.walkable ? 3 : 1.5}
        className={[
          'transition-[stroke,stroke-width,opacity] duration-150 ease-out',
          terrain.walkable ? 'cursor-pointer' : 'cursor-not-allowed',
          isHovered && terrain.walkable ? 'opacity-95' : 'opacity-100',
        ].join(' ')}
        onClick={() => onClick(at)}
        onMouseEnter={() => onHoverChange(at)}
        onMouseLeave={() => onHoverChange(null)}
      />
    </g>
  );
};

export default HexTile;
