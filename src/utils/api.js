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
 * @param {object|string} command - variante de Command (ex. "Gather" ou {Move:{...}})
 */
function sendCommand(command) {
  return invoke(ENGINE_COMMAND, { command }).then(({ data }) => data);
}

// --- Wrappers typés, un par variante de Command ---
// Nouvelle commande Rust -> une ligne ici, jamais un invoke() ailleurs.

export const gather = () => sendCommand("Gather");

export const move = (position) => sendCommand({ Move: { position } });

export const getMap = () => sendCommand("GetMap");

export const getTerrain = () => sendCommand("GetTerrain");

export const getPlayer = () => sendCommand("GetPlayer");

export const getInventory = (name) => sendCommand({ GetInventory: { name } });

export const transferInventory = (sourceName, destinationName, items) =>
  sendCommand({ TransferInventory: { source_name: sourceName, destination_name: destinationName, items } });

export const getRecipes = () => sendCommand("GetRecipes");

export const craft = (recipe, inventory) =>
  sendCommand({ Craft: { payload: { recipe, inventory } } });