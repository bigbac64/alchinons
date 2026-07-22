import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Inventory from "../components/inventory/Inventory.jsx";
import ScrollCraft from "../components/craft/ScrollCraft.jsx";
import { useInventory } from "../providers/InventoryProvider.jsx";
import { craft, getRecipes } from "../utils/api.js";
import TableScroll from "../components/dnd/Table.jsx";

const SOURCE_INVENTORY = "player";

export default function Craft() {
  const { player } = useInventory();
  const [recipes, setRecipes] = useState([]);
  const [filled, setFilled] = useState({});

  useEffect(() => {
    getRecipes().then(({ recipes }) => setRecipes(recipes));
  }, []);

  function clearSlot(slotId) {
    setFilled((prev) => {
      if (!(slotId in prev)) return prev;
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  function handleDragEnd({ active, over }) {
    if (!over) return;
    const overId = String(over.id);
    if (!overId.startsWith("craft:")) return;

    const draggedResource = active.data.current?.resource;
    const requiredResource = over.data.current?.accepts;

    if (draggedResource && draggedResource === requiredResource) {
      setFilled((prev) => ({ ...prev, [overId]: draggedResource }));
    }
  }

  return (
    <div className={"mx-auto max-w-5xl px-6 py-10 h-screen"}>
      <TableScroll recipes={recipes}/>

      <Inventory
        inventory={player}
        name="Joueur"
        draggable
        sourceInventory={SOURCE_INVENTORY}
        className="w-72 shrink-0 self-start"
      />
    </div>
  );
}
