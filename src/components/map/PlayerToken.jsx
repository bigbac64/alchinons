import React from 'react';

/**
 * PlayerToken - marqueur du joueur, glisse d'une case à l'autre via une
 * transition CSS sur `transform` pilotée par le changement de position.
 */
const PlayerToken = ({ position, radius }) => (
  <g
    transform={`translate(${position.x}, ${position.y})`}
    className="transition-transform duration-200 ease-out pointer-events-none"
  >
    <circle r={radius} fill="#f59e0b" stroke="#78350f" strokeWidth={4} />
    <circle r={radius * 0.42} fill="#fde68a" />
  </g>
);

export default PlayerToken;
