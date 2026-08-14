import { AnimatePresence, motion } from "framer-motion";
import Inventory from "../inventory/Inventory.jsx";
import Panel from "../ui/Panel.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { cx } from "../../utils/classNames.js";
import { Fade } from "../../animations/presets.js";
import { SPRING_POP } from "../../animations/springs.js";
import ResourceIcon from "../ui/ResourceIcon.jsx";
import {useEffect, useState} from "react";

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
  const [clickedResource, setClickedResource] = useState(null);
  const [generation, setGeneration] = useState(0);

  // Nouvelle offre reçue du moteur (chargement initial ou suite au select précédent) :
  // on force un remount des cartes pour rejouer le fondu d'apparition, et on efface
  // le clic précédent qui vient d'être consommé par ce nouveau lot.
  useEffect(() => {
    setGeneration((g) => g + 1);
    setClickedResource(null);
  }, [options]);

  const onAnimatedSelect = (option) => {
    setClickedResource(option.resource);
    setTimeout(() =>  onSelect(option), 160)
  }

  const buttonVariants = {
    idle: { opacity: 1, y: 0, scale: 1 },
    clicked: { opacity: 0, y: 0, scale: 0.85 }, // disparition sur place
    unclicked: { opacity: 0, scale: 0.85, y: 45 },      // fondu + translation vers le haut
  };

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
              layout
            >
              <ResourceIcon resource={drop.name} className="text-xl" />
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

          <div className="mt-4 flex gap-3 justify-center items-center">
            {options.length ? options.map(option => {
              const isClicked = clickedResource === option.resource;
              const isDismissed = clickedResource != null && !isClicked;

              return (
                <motion.button
                  key={`${generation}-${option.resource}`}
                  type="button"
                  initial={{ opacity: 0, y: 100}}
                  animate={
                    isClicked
                      ? buttonVariants.clicked
                      : isDismissed
                        ? buttonVariants.unclicked
                        : buttonVariants.idle  // animation de base à l'apparition
                  }
                  whileHover={{scale: 1.03}}
                  whileTap={{scale: 0.97}}
                  transition={SPRING_POP}
                  onClick={() => onAnimatedSelect(option)}
                  className={cx(
                    "w-40 flex flex-col items-center gap-2 rounded-xl border-2 border-slate-700",
                    "bg-slate-800/70 p-4 transition-colors hover:border-emerald-500"
                  )}
                >
                  <ResourceIcon resource={option.resource} className="text-3xl" />
                  <span className="text-sm text-slate-200">{option.resource}</span>
                  <span className="rounded-md bg-slate-700 px-2 py-0.5 font-mono text-xs text-emerald-300">
                    +{option.amount}
                  </span>
                </motion.button>
              )
            }) : (
              <p className="col-span-full py-6 text-center text-sm italic text-slate-500">
                Rien à récolter ici, la zone a été épuisé.
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
