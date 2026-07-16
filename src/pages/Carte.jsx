import { invoke } from "@tauri-apps/api/core";
import { MapProvider } from "../providers/map/MapProvider.jsx";
import { PlayerProvider, usePlayer } from "../providers/map/PlayerProvider.jsx";
import HexGrid from "../components/map/HexGrid.jsx";
import MapLegend from "../components/map/MapLegend.jsx";

function MapContent() {
  const { currentTile, feedback } = usePlayer();

  async function gather() {
    await invoke("engine", { command: "Gather" });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-100">Carte du monde</h1>
      <p className="mb-6 text-sm text-slate-400">
        Cliquez une case pour vous y déplacer, puis fouillez les zones praticables.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="aspect-4/3">
          <HexGrid className="h-full w-full" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-700 bg-[#161d2e] p-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Case actuelle</h2>
            <p className="mt-2 text-lg text-slate-100">{currentTile?.label ?? "—"}</p>
          </div>

          {feedback && (
            <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2 text-sm text-amber-200">
              {feedback}
            </div>
          )}

          <MapLegend />
        </div>
      </div>
    </div>
  );
}

function Carte() {
  return (
    <MapProvider>
      <PlayerProvider>
        <MapContent />
      </PlayerProvider>
    </MapProvider>
  );
}

export default Carte;
