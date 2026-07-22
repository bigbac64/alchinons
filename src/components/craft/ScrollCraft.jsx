import { useId, useMemo } from "react";
import Slot from "../dnd/Slot.jsx";

function resourceQuantity(inventory, resourceName) {
  return inventory?.items?.find((item) => item.name === resourceName)?.quantity ?? 0;
}

/**
 * Carte de craft : un slot de résultat + un slot par unité de ressource
 * requise (une recette demandant 2x Bois est éclatée en 2 slots à l'unité).
 * Le remplissage des slots est purement informatif (reflète l'inventaire
 * courant) : le craft réel est déclenché par le bouton Bump et consomme
 * l'inventaire côté moteur, pas ces slots.
 */
export default function ScrollCraft({ recipe, inventory, active = false, className = "" }) {
  const instanceId = useId();

  const needSlots = useMemo(() => {
    const owned = {};
    return recipe.inputs.flatMap((input) => {
      const available = resourceQuantity(inventory, input.resource);
      return Array.from({ length: input.quantity }, () => {
        const index = owned[input.resource] ?? 0;
        owned[input.resource] = index + 1;
        return { resourceName: input.resource, filled: index < available };
      });
    });
  }, [recipe, inventory]);

  const output = recipe.outputs[0];

  return (
    <div
      className={`rounded-xl border overflow-hidden bg-[#161d2e] ${active ? "border-emerald-400" : "border-slate-700"} ${className}`}
    >
      <h3 className="text-center text-m font-semibold uppercase tracking-widest text-slate-400 bg-slate-700">
        {recipe.label}
      </h3>

      <div className="relative mx-auto p-4 flex flex-row-reverse justify-between items-center gap-4">
        <Slot
          resource={{ name: output.resource, quantity: output.quantity }}
          layout="tile"
          className="border-emerald-400"
        />

        <div className="flex gap-2 flex-wrap flex-1 justify-center items-center">
          {needSlots.map((slot, index) => (
            <Slot
              key={`${instanceId}:${slot.resourceName}:${index}`}
              resource={slot.filled ? { name: slot.resourceName, quantity: 1 } : null}
              placeholder={slot.resourceName}
              layout="tile"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
