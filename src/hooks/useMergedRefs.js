/**
 * Fusionne plusieurs refs (callback ref ou ref object) en une seule callback
 * ref à passer à un élément DOM. Utile quand un composant a besoin de garder
 * un accès local à un noeud (via un ref interne) tout en transmettant aussi
 * le ref externe reçu via `forwardRef`/une lib tierce (ex. `useDroppable`).
 * @param {...(Function|{current: any}|null|undefined)} refs
 * @returns {(node: any) => void}
 */
export function useMergedRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}
