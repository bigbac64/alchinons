import { createContext, useContext, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [warehouse, setWarehouse] = useState(null);

  useEffect(() => {
    invoke("engine", { command: { GetInventory: { name: "player" } } })
      .then(({ data }) => setPlayer(data));
    invoke("engine", { command: { GetInventory: { name: "warehouse" } } })
      .then(({ data }) => setWarehouse(data));
  }, []);

  useEffect(() => {
    const unlisten = listen("inventory_update", (event) => {
      const payload = { items: event.payload.items };
      switch (event.payload.name) {
        case "player":    setPlayer(payload);    break;
        case "warehouse": setWarehouse(payload); break;
      }
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
