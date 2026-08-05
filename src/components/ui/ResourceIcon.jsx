import { RESOURCE_ICONS } from "../../config/resources.js";

// Une valeur commençant par "/" pointe vers un fichier de public/ (image),
// sinon c'est un emoji affiché tel quel.
export default function ResourceIcon({ resource, className = "text-xl" }) {
  const icon = RESOURCE_ICONS[resource] ?? "❔";

  if (icon.startsWith("/")) {
    // className porte souvent une taille de police (text-xl…) : h/w-[1em] la
    // réutilise pour que l'image suive la même échelle que les emojis.
    return <img src={icon} alt={resource} className={`inline-block h-[1.3em] w-[1.3em] object-contain ${className}`} />;
  }

  return <span className={className}>{icon}</span>;
}
