// Seul pattern d'animation dupliqué ≥2 fois aujourd'hui (RockRune mis à part,
// supprimé) : un simple fondu d'apparition. Pas de durée imposée — les
// consommateurs actuels divergent déjà volontairement sur ce point.
export const Fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};
