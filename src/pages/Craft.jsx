import { useEffect, useState } from "react";
import Inventory from "../components/inventory/Inventory.jsx";
import { useInventory } from "../providers/InventoryProvider.jsx";
import { getRecipes } from "../utils/api.js";
import TableScroll from "../components/craft/TableScroll.jsx";

export default function Craft() {
  const { player } = useInventory();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getRecipes().then(({ recipes }) => setRecipes(recipes));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 flex flex-row gap-3">
      <TableScroll recipes={recipes} player={player} className="mb-6" />

      <Inventory inventory={player} name="Joueur" className="w-72 shrink-0 self-stretch" />
    </div>
  );
}
