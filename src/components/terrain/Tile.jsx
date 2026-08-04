import { AnimatePresence, motion } from "framer-motion";
import Inventory from "../inventory/Inventory.jsx";
import Panel from "../ui/Panel.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { cx } from "../ui/classNames.js";
import { Fade } from "../../animations/presets.js";
import { SPRING_POP } from "../../animations/springs.js";
import { RESOURCE_ICONS } from "../../config/resources.js";

// Texte d'ambiance par id de Terrain (voir engine/src/world/terrain.rs) ; un seul
// consommateur pour l'instant donc pas besoin d'un fichier config/ dédié (cf. useTile.js).
const TERRAIN_DESCRIPTIONS = {
  plain: "Les hautes herbes cachent encore quelques ressources.",
  forest: "Les frondaisons denses dissimulent bois, résine et champignons.",
  cliff: "La roche affleure, entre minerais et éclats de cristal.",
};

/**
 * Plus de zones cliquables (Area/Shape ont disparu côté moteur) : le lieu propose
 * directement une liste de ressources déjà tirées aléatoirement (`options`), sous
 * forme de cartes à sélectionner. `terrain.color` habille le fond de la page en
 * guise d'ambiance visuelle — remplace l'ancien rendu géométrique de `TileCanvas`.
 * @param {{
 *   terrain: {id: string, label: string, color: string},
 *   inventory?: object,
 *   options?: Array<{resource: string, amount: number}>,
 *   discoveries?: Array<{uuid: string, name: string, amount: number}>,
 *   onSelect?: (option: {resource: string, amount: number}) => void,
 *   onDiscoveryDone?: (uuid: string) => void,
 * }} props
 */
export default function Tile({
                                terrain,
                                inventory = [],
                                options = [],
                                discoveries = [],
                                onSelect = () => {},
                                onDiscoveryDone = () => {},
                              }) {
  return (
    <div
      className="relative flex flex-col gap-6 overflow-hidden rounded-2xl p-6"
      style={{ background: `radial-gradient(circle at 50% 0%, ${terrain.color}3d, transparent 70%)` }}
    >
      {/* Popups de découverte : connues côté client dès le clic sur la carte,
          plus besoin de deviner via un diff d'inventaire avant/après. */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2">
        <AnimatePresence>
          {discoveries.map(drop => (
            <motion.div
              key={drop.uuid}
              className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 font-semibold backdrop-blur-sm"
              initial={{ ...Fade.initial, y: -8, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0, scale: 1 }}
              exit={Fade.initial}
              transition={{ duration: 1.6, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
              onAnimationComplete={() => onDiscoveryDone(drop.uuid)}
            >
              <span className="text-xl">{RESOURCE_ICONS[drop.name] ?? "❔"}</span>
              <span>+{drop.amount}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-white">
          {terrain.label}
        </h1>

        <p className="mt-2 text-slate-400">
          {TERRAIN_DESCRIPTIONS[terrain.id] ?? "Une zone à explorer."}
        </p>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Récolte */}
        <Panel className="p-5">
          <SectionHeader>Récolte</SectionHeader>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.length ? options.map(option => (
              <motion.button
                key={option.resource}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_POP}
                onClick={() => onSelect(option)}
                className={cx(
                  "flex flex-col items-center gap-2 rounded-xl border-2 border-slate-700",
                  "bg-slate-800/70 p-4 transition-colors hover:border-emerald-500"
                )}
              >
                <span className="text-3xl">{RESOURCE_ICONS[option.resource] ?? "❔"}</span>
                <span className="text-sm text-slate-200">{option.resource}</span>
                <span className="rounded-md bg-slate-700 px-2 py-0.5 font-mono text-xs text-emerald-300">
                  +{option.amount}
                </span>
              </motion.button>
            )) : (
              <p className="col-span-full py-6 text-center text-sm italic text-slate-500">
                Rien à récolter ici pour l'instant.
              </p>
            )}
          </div>
        </Panel>

        {/* Inventaire */}
        <Inventory inventory={inventory} />

      </div>
    </div>
  );
}
