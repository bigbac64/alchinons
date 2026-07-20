import { AnimatePresence, motion } from "framer-motion";
import ButtonHold from "../Button/ButtonHold";
import Inventory from "../inventory/Inventory.jsx";

export default function Plain({
                                inventory = [],
                                discoveries = [],
                                resources = [],
                                onSearch = () => {},
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
        <div className="col-span-7 row-span-1 relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {discoveries.map(drop => (

                <motion.div
                  key={drop.uuid}
                  className="absolute rounded-lg bg-slate-900/80 px-4 py-2 font-semibold backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {drop.empty
                    ? "Rien ._."
                    : `+${drop.amount} ${drop.name}`}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Analyse */}
        <div className="col-span-5 row-span-1 rounded-xl border border-slate-700 bg-slate-900">
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
        <div className="col-span-5 row-span-1 rounded-xl border border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 px-5 py-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Actions
            </h2>
          </div>

          <div className="flex flex-col gap-3 p-5">
            <ButtonHold
              holdDuration={800}
              disabled={searchDisabled}
              onComplete={onSearch}
            >
              Fouiller
            </ButtonHold>
          </div>
        </div>

        {/* Inventaire */}
        <Inventory className="col-span-7 row-span-1" inventory={inventory} />

      </div>
    </div>
  );
}