// Retour au clic/relâchement d'un bouton — un seul ressort pour ce rôle
// physique, partagé par les 3 variantes de Button (classic/hold/dumper).
export const SPRING_POP = { type: "spring", stiffness: 400, damping: 20 };

// Déplacement du jeton joueur le long d'un chemin — rôle physique différent
// (un objet qui se déplace dans le monde, pas un feedback de pression),
// volontairement distinct de SPRING_POP.
export const SPRING_TOKEN_MOVE = { type: "spring", stiffness: 260, damping: 22, mass: 0.6 };
