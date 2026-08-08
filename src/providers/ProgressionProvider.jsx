import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProgression, listenEngineEvents, purchase as purchaseCommand } from "../api/engine.js";
import { useTimedFeedback } from "../hooks/useTimedFeedback.js";

const ProgressionContext = createContext(null);

/**
 * Source unique pour la progression : état des déblocages (lecture) ET
 * déclenchement d'un achat (écriture), regroupés ici pour qu'un seul event
 * (`ProgressionUpdated`/`UnlockFailed`) n'ait qu'un seul endroit à tenir à
 * jour. Le front ne recalcule jamais un coût, il affiche `next_cost` tel
 * que renvoyé par le moteur. Ne dépend d'aucun autre provider.
 */
export function ProgressionProvider({ children }) {
  const [unlockables, setUnlockables] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [error, setError] = useTimedFeedback(1200);

  useEffect(() => {
    getProgression().then(({ unlockables }) => setUnlockables(unlockables));
  }, []);

  useEffect(() => {
    const unlisten = listenEngineEvents({
      ProgressionUpdated: ({ changes }) => {
        setUnlockables(changes.unlockables);
        setPurchasingId(null);
      },
      UnlockFailed: ({ unlockable: label }) => {
        setPurchasingId(null);
        setError(label);
      },
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [setError]);

  const getStatus = useCallback(
    (id) => unlockables?.find((u) => u.id === id) ?? null,
    [unlockables]
  );

  const isUnlocked = useCallback((id) => getStatus(id)?.unlocked ?? false, [getStatus]);

  const purchase = useCallback((id, inventory = "player") => {
    if (purchasingId) return;
    setPurchasingId(id);
    purchaseCommand(id, inventory);
  }, [purchasingId]);

  const value = { getStatus, isUnlocked, purchase, purchasingId, error };

  return <ProgressionContext.Provider value={value}>{children}</ProgressionContext.Provider>;
}

export function useProgression() {
  const ctx = useContext(ProgressionContext);
  if (!ctx) throw new Error("useProgression must be used within <ProgressionProvider>");
  return ctx;
}
