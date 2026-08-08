import { MapProvider } from "./map/MapProvider.jsx";
import { PlayerProvider } from "./map/PlayerProvider.jsx";
import { InventoryProvider } from "./InventoryProvider.jsx";
import { ProgressionProvider } from "./ProgressionProvider.jsx";
import {createContext, useContext, useEffect, useState} from "react";


const AppContext = createContext({
  resetState: () => {}, // Valeur par défaut pour éviter les erreurs
});

/**
 * Compose les providers globaux de l'application, dans un ordre obligatoire :
 * `PlayerProvider` appelle `useMap()` en interne (pour valider qu'une case
 * est praticable avant d'envoyer une commande de déplacement) et doit donc
 * être monté sous `MapProvider`. `InventoryProvider` et `ProgressionProvider`
 * ne dépendent d'aucun autre provider ; leur position ne change rien
 * fonctionnellement.
 */
export function AppProviders({ children }) {
  const [reset, setReset] = useState(0)

  const resetState = () => {
    setReset(r => r + 1)
  }

  return (
    <AppContext.Provider value={{resetState}}>
      <MapProvider key={`provider-map-${reset}`}>
        <PlayerProvider key={`provider-player-${reset}`}>
          <InventoryProvider key={`provider-inventory-${reset}`}>
            <ProgressionProvider key={`provider-progression-${reset}`}>
              {children}
            </ProgressionProvider>
          </InventoryProvider>
        </PlayerProvider>
      </MapProvider>
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within a <AppProvider>');
  return ctx;
};
