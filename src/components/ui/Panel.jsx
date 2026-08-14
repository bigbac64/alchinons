import { cx } from "../../utils/classNames.js";

/**
 * Carte sombre standard du projet (fond, bordure, coins arrondis). Remplace
 * le pattern `rounded-xl border border-slate-700 bg-surface-panel` réécrit à
 * l'identique dans plusieurs composants — toute variation (couleur de
 * bordure active, padding) se passe par `className`, jamais par une nouvelle
 * prop dédiée tant qu'un seul composant n'en a besoin.
 * @param {{className?: string, children?: import('react').ReactNode}} props
 */
export default function Panel({ className = "", children, ...other }) {
  return (
    <div className={cx("rounded-xl border border-slate-700 bg-surface-panel", className)} {...other}>
      {children}
    </div>
  );
}
