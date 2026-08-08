import { usePlayer } from "../providers/map/PlayerProvider.jsx";
import HexGrid from "../components/map/HexGrid.jsx";
import MapLegend from "../components/map/MapLegend.jsx";
import Button from "../components/ui/Button/Button.jsx";
import Panel from "../components/ui/Panel.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import UnlockCost from "../components/progression/UnlockCost.jsx";
import { useProgression } from "../providers/ProgressionProvider.jsx";
import { UNLOCKABLE } from "../config/progression.js";
import {Link} from "react-router-dom";

function Carte() {
  const { currentTile, feedback } = usePlayer();
  const { getStatus, purchase, purchasingId, error } = useProgression();
  const exploration = getStatus(UNLOCKABLE.EXPLORATION_RADIUS);


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
          <Panel className="p-4">
            <SectionHeader>Case actuelle</SectionHeader>
            <p className="mt-2 text-lg text-slate-100">{currentTile?.label ?? "—"}</p>
          </Panel>

          {feedback && (
            <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2 text-sm text-amber-200">
              {feedback}
            </div>
          )}

          <MapLegend />

          {exploration && (
            <Panel className="p-4">
              <SectionHeader>Zone explorée</SectionHeader>
              {exploration.next_cost ? (
                <div className="mt-3">
                  <UnlockCost
                    cost={exploration.next_cost}
                    label={`Agrandir (palier ${exploration.tier + 1})`}
                    purchasing={purchasingId === UNLOCKABLE.EXPLORATION_RADIUS}
                    error={error}
                    onPurchase={() => purchase(UNLOCKABLE.EXPLORATION_RADIUS)}
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-400">Zone maximale explorée.</p>
              )}
            </Panel>
          )}

          <Link to={currentTile?.id === "camp" ? "/camp" : "/exploit"}
                className={`font-medium hover:text-emerald-400 transition-colors`}
          >
            <Button className={"w-full h-full bg-sky-800 hover:bg-sky-700 shadow-sky-900/40"}>
              {currentTile?.id === "camp" ? "Campement" : "Exploitation"}
            </Button>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Carte;
