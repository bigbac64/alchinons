import { useId, useMemo, useState } from "react";
import Slot from "../dnd/Slot.jsx";
import Button from "../Button/Button.jsx";

const SLOT_SIZE = 56;

/**
 * Formats de disposition des slots de besoin autour du slot de résultat.
 * Chaque format ne fait qu'une chose : donner la position (style) du slot
 * d'index `index` parmi `total`. Ajouter une disposition = ajouter une entrée.
 */
const FORMATS = {
  circle: (index, total, radius) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px - ${SLOT_SIZE / 2}px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px - ${SLOT_SIZE / 2}px)`,
    };
  },
  line: (index, total, gap) => {
    return {
      left: `calc(${(index / total) * gap}px + ${SLOT_SIZE / 2}px)`,
      top: `50%`,
    };
  }
};

/**
 * Craft multi-ressource instantané : combine N slots de besoin (répartis selon
 * `format`) en un slot de résultat unique. Une même recette peut nécessiter
 * plusieurs unités d'une ressource (ex. 2x Bois) : elles sont éclatées en
 * autant de slots à l'unité, pas de gestion de quantité par slot pour l'instant.
 */
export default function CraftMultiResource({
  recipe,
  filled,
  onClearSlot,
  onCraft,
  format = "circle",
  radius = 78,
  sourceInventory = "player",
  className = "",
}) {
  const instanceId = useId();
  const [crafting, setCrafting] = useState(false);

  const needSlots = useMemo(() => (
    recipe.inputs.flatMap((input, inputIndex) =>
      Array.from({ length: input.quantity }, (_, unit) => ({
        id: `craft:${instanceId}:${inputIndex}:${unit}`,
        resourceName: input.resource,
      }))
    )
  ), [recipe, instanceId]);

  const isComplete = needSlots.length > 0
    && needSlots.every((slot) => filled[slot.id] === slot.resourceName);

  const output = recipe.outputs[0];
  const place = FORMATS[format] ?? FORMATS.circle;
  const boardSize = radius * 2 + SLOT_SIZE;

  async function handleCraft() {
    if (!isComplete || crafting) return;
    setCrafting(true);
    try {
      await onCraft(recipe.id, sourceInventory);
      needSlots.forEach((slot) => onClearSlot(slot.id));
    } finally {
      setCrafting(false);
    }
  }

  return (
    <div className={`rounded-xl border border-slate-700 bg-[#161d2e] p-6 ${className}`}>
      <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        {recipe.label}
      </h3>

      <div className="relative mx-auto" style={{ width: boardSize, height: boardSize }}>
        <div
          className="absolute"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <Slot
            id={`craft:${instanceId}:result`}
            resource={{ name: output.resource, quantity: output.quantity }}
            layout="tile"
            className={isComplete ? "border-emerald-400" : ""}
          />
        </div>

        {needSlots.map((slot, index) => {
          const filledResource = filled[slot.id];
          return (
            <div key={slot.id} className="absolute" style={place(index, needSlots.length, radius)}>
              <Slot
                id={slot.id}
                resource={filledResource ? { name: filledResource, quantity: 1 } : null}
                droppable={!filledResource}
                accepts={slot.resourceName}
                placeholder={slot.resourceName}
                layout="tile"
                onClick={filledResource ? () => onClearSlot(slot.id) : undefined}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <Button variant="dumper" disabled={!isComplete || crafting} onComplete={handleCraft}>
          Assembler
        </Button>
      </div>
    </div>
  );
}
