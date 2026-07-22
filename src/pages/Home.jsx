import Button from "../components/Button/Button.jsx";
import Inventory from "../components/inventory/Inventory.jsx";
import {useInventory} from "../providers/InventoryProvider.jsx";
import {gather} from "../utils/api.js";
import {useEffect} from "react";

function Home() {
  const {player, warehouse} = useInventory();

  useEffect(() => {
    console.log("Player inventory: ", player);
    console.log("Warehouse inventory: ", warehouse);
  }, [player, warehouse]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-100">Alchinons</h1>
      <p className="mb-8 text-sm text-slate-400 uppercase tracking-widest">Atelier d'alchimie</p>

      <div className="mb-6">
        <Button
          variant="dumper"
          onComplete={gather}
        >
          <span>⚗</span>
          Récolter
        </Button>
      </div>

      <div className="mb-6">
        <Button
          variant="hold"
          holdDuration={2000}
          onComplete={gather}
        >
          <span>⚗</span>
          Récolter
        </Button>
      </div>

      <Inventory inventory={player} name={"Joueur"}></Inventory>
      <Inventory inventory={warehouse} name={"Entrepot"}></Inventory>

    </div>
  );
}

export default Home;