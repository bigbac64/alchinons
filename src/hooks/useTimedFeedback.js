import { useEffect, useState } from "react";

/**
 * Valeur de feedback qui s'auto-efface après `durationMs`. Extrait du pattern
 * dupliqué dans `PlayerProvider.jsx` (message d'erreur de déplacement) et
 * `useCraft.js` (erreur de craft) — la 3e occurrence (erreur de déblocage,
 * `useUnlock.js`) déclenche cette extraction.
 * @param {number} durationMs
 * @returns {[any, (value: any) => void]}
 */
export function useTimedFeedback(durationMs) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!value) return undefined;
    const id = setTimeout(() => setValue(null), durationMs);
    return () => clearTimeout(id);
  }, [value, durationMs]);

  return [value, setValue];
}
