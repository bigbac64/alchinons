import { useCallback, useEffect, useState } from "react";
import { gather, gatherSelect } from "../api/engine.js";

/**
 * Options de récolte disponibles sur la tile occupée par `position`. Recharge une
 * nouvelle offre à chaque changement de position (et l'invalide si `position` change
 * avant que la requête n'ait abouti, même logique que l'ex `useTile`). `select`
 * valide un choix côté moteur, qui répond immédiatement avec une nouvelle offre
 * (boucle de fouille continue, cf. `Command::GatherSelect`).
 * @param {{x: number, y: number}|null} position
 * @returns {{options: Array<{resource: string, amount: number}>, select: (resource: string) => void}}
 */
export function useGather(position) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!position) return;
    let cancelled = false;
    gather().then((options) => {
      if (!cancelled) setOptions(options);
    });
    return () => {
      cancelled = true;
    };
  }, [position?.x, position?.y]);

  const select = useCallback((resource) => {
    gatherSelect(resource).then(setOptions);
  }, []);

  return { options, select };
}
