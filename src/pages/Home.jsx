import { invoke } from "@tauri-apps/api/core";
import { useInventory } from "../hooks/useInventory";
import Button from "../components/Button/Button.jsx";
import Inventory from "../components/inventory/Inventory.jsx";

function Home() {
  const {player, warehouse} = useInventory();

  async function gather() {
    await invoke("engine", { command: "Gather" });
  }

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