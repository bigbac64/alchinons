// Comportement hover/active/disabled partagé par les 3 variantes de Button
// (classic/hold/dumper) — avant ce fichier, chacune le redéfinissait
// indépendamment, avec des divergences non intentionnelles.
export const PILL_BUTTON_BASE =
  "hover:bg-emerald-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
