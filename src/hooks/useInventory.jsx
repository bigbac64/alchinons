import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import {invoke} from "@tauri-apps/api/core";

export function useInventory() {
  const [player, setPlayer] = useState(undefined);
  const [warehouse, setWarehouse] = useState(undefined);

  useEffect(() => {
    if (player === undefined) {
      invoke("engine", {command: {GetInventory: {name: "player"}}})
        .then(({data: {items}}) => setPlayer(items))
    }
    if (warehouse === undefined) {
      invoke("engine", {command: {GetInventory: {name: "warehouse"}}})
        .then(({data: {items}}) => setWarehouse(items))
    }

  }, []);

  useEffect(() => {
    const unlisten = listen("inventory_update", (event) => {
      const items = {items: event.payload.items}
      switch (event.payload.name){
        case "player":
          setPlayer(items);
          break;
        case "warehouse":
          setWarehouse(items);
          break;
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return {player, warehouse};
}