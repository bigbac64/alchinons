import { AnimatePresence, motion } from "framer-motion";
import ButtonHold from "../Button/ButtonHold";
import Inventory from "../inventory/Inventory.jsx";
import TileCanvas, { TILE_SIZE } from "./TileCanvas.jsx";

const RESOURCE_ICONS = {
  Grass: "🌿",
  Wood: "🪵",
  Stone: "🪨",
  Plank: "🪵",
  Charcoal: "⚫",
  Berry: "🍓",
};

export default function Plain({
                                position,
                                inventory = [],
                                discoveries = [],
                                resources = [],
                                onSearch = () => {},
                                onDiscoveryDone = () => {},
                                searchDisabled = false,
                              }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-white">
          Plaine
        </h1>

        <p className="mt-2 text-slate-400">
          Les hautes herbes cachent encore quelques ressources.
        </p>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-12 grid-rows-2 gap-6">

        {/* Vue du monde */}
        <div className="col-span-6 h-100 row-span-1 relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* même repère (0..400) que les clics envoyés à `onGather`, pour que
                les popups de découverte puissent s'aligner dessus au pixel près */}
            <div className="relative" style={{ width: TILE_SIZE, height: TILE_SIZE }}>
              <TileCanvas position={position} onGather={onSearch} className="rounded-lg" />

              <div className="pointer-events-none absolute inset-0">
                <AnimatePresence>
                  {discoveries.map(drop => (

                    <motion.div
                      key={drop.uuid}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 font-semibold backdrop-blur-sm"
                      style={{ left: drop.x ?? TILE_SIZE / 2, top: drop.y ?? TILE_SIZE / 2 }}
                      initial={{ opacity: 0, y: 0, scale: 0.9 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.6, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
                      onAnimationComplete={() => onDiscoveryDone(drop.uuid)}
                    >
                      {drop.empty ? (
                        "Rien ._."
                      ) : (
                        <>
                          <span className="text-xl">{RESOURCE_ICONS[drop.name] ?? "❔"}</span>
                          <span>+{drop.amount}</span>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Analyse */}
        <div className="col-span-6 row-span-1 rounded-xl border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Analyse de la zone
            </h2>
          </div>

          <div className="space-y-4 p-5">
            {resources.map(resource => (
              <div
                key={resource.id}
                className="rounded-lg border border-slate-700 p-4"
              >
                {resource.discovered ? (
                  <>
                    <div className="flex justify-between">
                      <span>{resource.name}</span>
                      <span className="text-slate-400">
                                                    {resource.remaining}/{resource.max}
                                                </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-700">
                      <div className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${resource.remaining / resource.max * 100}%`
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-slate-600">
                    ??????
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-6 row-span-1 rounded-xl border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Actions
            </h2>
          </div>

          <div className="flex flex-col gap-3 p-5">
            <ButtonHold
              holdDuration={800}
              disabled={searchDisabled}
              onComplete={() => onSearch({ x: 200, y: 200 })}
            >
              Fouiller
            </ButtonHold>
          </div>
        </div>

        {/* Inventaire */}
        <Inventory className="col-span-6 row-span-1" inventory={inventory} />

      </div>
    </div>
  );
}