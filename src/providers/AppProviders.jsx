import { MapProvider } from "./map/MapProvider.jsx";
import { PlayerProvider } from "./map/PlayerProvider.jsx";
import { InventoryProvider } from "./InventoryProvider.jsx";

/**
 * Compose les providers globaux de l'application, dans un ordre obligatoire :
 * `PlayerProvider` appelle `useMap()` en interne (pour valider qu'une case
 * est praticable avant d'envoyer une commande de déplacement) et doit donc
 * être monté sous `MapProvider`. `InventoryProvider` ne dépend d'aucun autre
 * provider ; sa position ne change rien fonctionnellement.
 */
export function AppProviders({ children }) {
  return (
    <MapProvider>
      <PlayerProvider>
        <InventoryProvider>
          {children}
        </InventoryProvider>
      </PlayerProvider>
    </MapProvider>
  );
}
