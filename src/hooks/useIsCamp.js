import { usePlayer } from "../providers/map/PlayerProvider.jsx";

/**
 * Vrai si le joueur se trouve actuellement sur la tuile "camp". Composition
 * légère au-dessus de `usePlayer()` — ne détient pas de Context propre, donc
 * reste un hook plutôt qu'un provider tant qu'il n'y a rien d'autre à y ajouter.
 */
export function useIsCamp() {
  const { currentTile } = usePlayer();
  return currentTile?.id === "camp";
}
