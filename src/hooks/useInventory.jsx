import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export function useInventory() {
  const [inventory, setInventory] = useState({ items: [] });

  useEffect(() => {
    const unlisten = listen("inventory_update", (event) => {
      setInventory(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return inventory;
}