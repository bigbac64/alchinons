import { useTile } from "../../hooks/useTile.js";

export const TILE_SIZE = 400;

/**
 * Rendu 400x400 (même repère que le moteur, aucune conversion d'échelle) des
 * zones (`Area`) de la tile occupée par le joueur, en aplats de couleur.
 * Un clic envoie sa position brute dans ce même repère à `onGather` : c'est le
 * moteur qui décide, via hit-test, quelle zone a été touchée.
 */
export default function TileCanvas({ position, onGather = () => {}, className = "" }) {
  const tile = useTile(position);

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = (value) => Math.min(TILE_SIZE - 1, Math.max(0, Math.round(value)));
    onGather({
      x: clamp(event.clientX - rect.left),
      y: clamp(event.clientY - rect.top),
    });
  };

  if (!tile) return null;

  return (
    <div
      className={`relative shrink-0 cursor-crosshair overflow-hidden ${className}`}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
      onClick={handleClick}
    >
      {tile.areas.map((area, index) => (
        <div key={index} className="absolute" style={areaStyle(area)} />
      ))}
    </div>
  );
}

function areaStyle({ color, position, shape }) {
  if (shape.type === "circle") {
    const size = shape.radius * 2;
    return {
      left: position.x - shape.radius,
      top: position.y - shape.radius,
      width: size,
      height: size,
      borderRadius: "9999px",
      backgroundColor: color,
    };
  }

  return {
    left: position.x,
    top: position.y,
    width: shape.width,
    height: shape.height,
    backgroundColor: color,
  };
}
