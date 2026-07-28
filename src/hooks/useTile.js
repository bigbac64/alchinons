import { useEffect, useState } from "react";
import { getTile } from "../api/engine.js";

/**
 * Charge la tuile occupée par `position` et l'invalide si `position` change
 * avant que la requête n'ait abouti. Un seul consommateur aujourd'hui
 * (`TileCanvas`) : reste un hook local plutôt qu'un provider tant qu'un
 * deuxième consommateur ne justifie pas un état partagé.
 * @param {{x: number, y: number}|null} position
 * @returns {object|null} la vue de la tuile, ou `null` tant qu'elle n'est pas chargée
 */
export function useTile(position) {
  const [tile, setTile] = useState(null);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    getTile(position).then(view => {
      if (!cancelled) setTile(view ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [position?.x, position?.y]);

  return tile;
}
