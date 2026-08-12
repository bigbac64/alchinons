import React, {useEffect, useState} from 'react';
import Vector from '../../utils/vector.js';
import {is_exploitable_at} from "../../api/engine.js";

/**
 * HexTile - un hexagone de la carte.
 * @param {Vector} at - position logique (colonne, ligne)
 * @param {Vector} position - position en pixels (centre de l'hexagone)
 * @param {import('../../utils/hexagone.js').default} cell
 * @param {object} terrain - définition de terrain (voir config/mapConfig.js)
 * @param {boolean} explored - case déjà dévoilée par le brouillard d'exploration
 * @param {boolean} isHovered
 * @param {boolean} isCurrent - case sur laquelle se trouve le joueur
 * @param {(at: Vector) => void} onClick
 * @param {(at: Vector | null) => void} onHoverChange
 */
const HexTile = ({ at, position, cell, walkable, color, explored, isHovered, isCurrent, onClick, onHoverChange }) => {
  const [exploitable, setExploitable] = useState(true)
  const points = cell.points(new Vector(0, 0)).join(' ');
  const canWalk = walkable && explored;
  const hatchPatternId = `hex-hatch-${at.x}-${at.y}`;

  useEffect(() => {
    is_exploitable_at(at).then(setExploitable)
  }, []);

  console.log(points)

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      {!exploitable && (
        <defs>
          <pattern id={hatchPatternId} width="24" height="24" patternUnits="userSpaceOnUse">
            <line x1="0" y1="24" x2="24" y2="0" stroke="#444444" strokeWidth="2.5" opacity="0.85"/>
          </pattern>
        </defs>
      )}
      <polygon
        points={points}
        fill={color}
        stroke={isCurrent ? '#facc15' : isHovered && canWalk ? '#e2e8f0' : 'rgba(15,23,42,0.65)'}
        strokeWidth={isCurrent ? 4 : isHovered && canWalk ? 3 : 1.5}
        className={[
          'transition-[stroke,stroke-width,opacity] duration-150 ease-out',
          canWalk ? 'cursor-pointer' : 'cursor-not-allowed',
          isHovered && canWalk ? 'opacity-95' : 'opacity-100',
        ].join(' ')}
        onClick={() => onClick(at)}
        onMouseEnter={() => onHoverChange(at)}
        onMouseLeave={() => onHoverChange(null)}
      />
      {!explored && (
        <polygon points={points} fill="#0a0e18" opacity={0.94} className="pointer-events-none" />
      )}
      {!exploitable && (
        <>
          <polygon points={points} fill="#020617" opacity={0.02} className="pointer-events-none" />
          <polygon points={points} fill={`url(#${hatchPatternId})`} className="pointer-events-none" />
        </>
      )}
    </g>
  );
};

export default React.memo(HexTile);
