import {listen} from "@tauri-apps/api/event";
import {invoke} from "@tauri-apps/api/core";

export const ENGINE_EVENT_CHANNEL = "engine://event";

export const ENGINE_COMMAND = "engine";


/**
 * S'abonne au canal générique du moteur. `handlers` associe le tag `type`
 * de chaque event Rust (ex. "MoveFailed") à une callback recevant son `data`.
 * Les types absents de `handlers` sont simplement ignorés : chaque provider
 * ne déclare que ce qui le concerne.
 * @param {Record<string, (data: any) => void>} handlers
 * @returns {Promise<() => void>} unlisten, pattern Tauri standard
 */
export const listenEngineEvents = (handlers) => {
  return listen(ENGINE_EVENT_CHANNEL, ({ payload }) => {
    for (const event of payload) {
      handlers[event.type]?.(event.data);
    }
  });
}


/**
 * Point d'envoi unique vers le moteur. Toute nouvelle commande passe par ici :
 * un seul endroit connaît la forme de la réponse ({ type, data }).
 * @param {object} command - variante de Command : { Nom: payload } (ex. { Gather: null } ou { Move: {...} }).
 *   Toute variante Rust porte un payload, même vide (`null`) — jamais de chaîne nue.
 */
function sendCommand(command) {
  return invoke(ENGINE_COMMAND, { command }).then(({ data }) => data);
}

// --- Wrappers typés, un par variante de Command ---
// Nouvelle commande Rust -> une ligne ici, jamais un invoke() ailleurs.

export const gather = () => sendCommand({ Gather: null });

export const is_exploitable_player_position = () => sendCommand({ ExploitablePlayerPosition: null });
export const is_exploitable_at = (position) => sendCommand({ Exploitable: { position } });

export const gatherSelect = (resource) => sendCommand({ GatherSelect: { resource } });

export const move = (position) => sendCommand({ Move: { position } });

export const getMap = () => sendCommand({ GetMap: null });

export const getTerrain = () => sendCommand({ GetTerrain: null });

export const getPlayer = () => sendCommand({ GetPlayer: null });

export const getInventory = (name) => sendCommand({ GetInventory: { name } });

export const transferInventory = (sourceName, destinationName, items) =>
  sendCommand({ TransferInventory: { source_name: sourceName, destination_name: destinationName, items } });

export const getRecipes = () => sendCommand({ GetRecipes: null });

export const craft = (recipe, inventory) =>
  sendCommand({ Craft: { recipe, inventory } });

export const getProgression = () => sendCommand({ GetProgression: null });

export const purchase = (unlockable, inventory) =>
  sendCommand({ Purchase: { unlockable, inventory } });

export const reset = () => sendCommand({ ResetSave: null });