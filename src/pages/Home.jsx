import { invoke } from "@tauri-apps/api/core";
import { useInventory } from "../hooks/useInventory";
import ButtonHold from "../components/Button/ButtonHold.jsx";
import Button from "../components/Button/Button.jsx";

function Home() {
  const inventory = useInventory();

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
          onClick={gather}
        >
          <span>⚗</span>
          Récolter
        </Button>
      </div>

      <h1>Style 1</h1>
      <hr/>
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#161d2e]">
        <div className="border-b border-slate-700 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Inventaire</h2>
        </div>
        {inventory.items?.length ? (
          <ul className="divide-y divide-slate-700/60">
            {inventory.items.map(({ name, quantity }) => (
              <li
                key={name}
                className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-700/20"
              >
                <span className="text-slate-200">{name}</span>
                <span className="rounded-md bg-slate-700 px-2.5 py-0.5 font-mono text-sm text-emerald-300">
                      {quantity}
                    </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-5 text-center text-sm italic text-slate-500">Inventaire vide.</p>
        )}
      </div>

      <h1>Style 2</h1>
      <hr/>
      <div className="rounded-xl border border-slate-700 bg-[#161d2e] overflow-hidden shadow-xl">
        <div className="border-b border-slate-700 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Inventaire</h2>
        </div>
        {inventory.items?.length ? (
          <ul className="divide-y divide-slate-700/60">
            {inventory.items.map(({ name, quantity }) => (
              <li key={name} className="flex items-center justify-between px-5 py-3 hover:bg-slate-700/20 transition-colors">
                <span className="text-slate-200">{name}</span>
                <span className="rounded-md bg-slate-700 px-2.5 py-0.5 font-mono text-sm text-emerald-300">
                  {quantity}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-center text-sm text-slate-500 italic">Inventaire vide — lancez une récolte.</p>
        )}
      </div>
    </div>
  );
}

export default Home;