/**
 * Assemble des classes Tailwind conditionnelles : filtre les valeurs falsy
 * et joint le reste par un espace. Remplace les 3 conventions incohérentes
 * (ternaire inline, `[array].join(" ")`, chaîne statique) par un seul point
 * d'entrée.
 * @param {...(string|false|null|undefined)} parts
 * @returns {string}
 */
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
