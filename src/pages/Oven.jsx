import Panel from "../components/ui/Panel.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import UnlockCost from "../components/progression/UnlockCost.jsx";
import { useProgression } from "../providers/ProgressionProvider.jsx";
import { UNLOCKABLE } from "../config/progression.js";

function Oven() {
  const { getStatus, purchase, purchasingId, error } = useProgression();
  const status = getStatus(UNLOCKABLE.OVEN);

  if (!status) return null;

  if (!status.unlocked) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10">
        <Panel className="flex flex-col items-center gap-4 p-8 text-center">
          <SectionHeader>À débloquer</SectionHeader>
          <h1 className="text-2xl font-bold">Four</h1>
          <p className="text-slate-500">Cette fonctionnalité n'est pas encore débloquée.</p>
          <UnlockCost
            cost={status.next_cost}
            purchasing={purchasingId === UNLOCKABLE.OVEN}
            error={error}
            onPurchase={() => purchase(UNLOCKABLE.OVEN)}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 text-center">
      <h1 className="text-2xl font-bold">Four</h1>
      <p className="mt-2 text-slate-500">À compléter.</p>
    </div>
  );
}

export default Oven;
