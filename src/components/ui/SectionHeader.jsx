import { cx } from "../../utils/classNames.js";

/**
 * En-tête de section standard (petites capitales, espacement large,
 * couleur atténuée). Remplace le pattern `uppercase tracking-widest
 * text-slate-400` répété à l'identique (à des divergences non
 * intentionnelles près) dans plusieurs composants. `as` permet de garder la
 * bonne balise sémantique (ex. `p` quand un `h2` briserait la hiérarchie de
 * titres, comme dans `NotFound.jsx`) sans dupliquer le style.
 * @param {{as?: import('react').ElementType, className?: string, children?: import('react').ReactNode}} props
 */
export default function SectionHeader({ as: Tag = "h2", className = "", children, ...other }) {
  return (
    <Tag className={cx("text-xs font-semibold uppercase tracking-widest text-slate-400", className)} {...other}>
      {children}
    </Tag>
  );
}
