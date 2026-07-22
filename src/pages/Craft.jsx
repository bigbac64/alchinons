import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import Inventory from "../components/inventory/Inventory.jsx";
import CraftMultiResource from "../components/craft/CraftMultiResource.jsx";
import { useInventory } from "../providers/InventoryProvider.jsx";
import { craft, getRecipes } from "../utils/api.js";

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
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-10">
        <div className="flex flex-1 flex-wrap justify-center gap-6">
          {recipes.map((recipe) => (
            <CraftMultiResource
              key={recipe.id}
              recipe={recipe}
              filled={filled}
              onClearSlot={clearSlot}
              onCraft={craft}
              sourceInventory={SOURCE_INVENTORY}
            />
          ))}
        </div>

        <Inventory
          inventory={player}
          name="Joueur"
          draggable
          sourceInventory={SOURCE_INVENTORY}
          className="w-72 shrink-0 self-start"
        />
      </div>
    </DndContext>
  );
}
