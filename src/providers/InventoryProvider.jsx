import { createContext, useContext, useEffect, useState } from "react";
import {getInventory, listenEngineEvents} from "../utils/api.js";

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    getInventory("player").then(({ data }) => setPlayer(data));
    getInventory("warehouse").then(({ data }) => setWarehouse(data));
  }, []);

  useEffect(() => {
    const unlisten = listenEngineEvents({
      InventoryUpdated: ({changes}) => {
        if (changes.name === "player") setPlayer(changes);
        if (changes.name === "warehouse") setWarehouse(changes);
      },
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  return (
    <InventoryContext.Provider value={{ player, warehouse }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within <InventoryProvider>");
  return ctx;
}
